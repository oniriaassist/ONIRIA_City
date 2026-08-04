from __future__ import annotations

import csv
import io
import re
import zipfile
from datetime import date, datetime
from typing import Any, Iterable
from xml.sax.saxutils import escape


_INVALID_SHEET_CHARS = re.compile(r"[\\/*?:\[\]]")


def _normalise(value: Any) -> str | int | float:
    if value is None:
        return ""
    if isinstance(value, (datetime, date)):
        return value.isoformat(sep=" ") if isinstance(value, datetime) else value.isoformat()
    if isinstance(value, bool):
        return "Yes" if value else "No"
    if isinstance(value, (int, float)):
        return value
    return str(value)


def _headers(rows: list[dict[str, Any]]) -> list[str]:
    ordered: list[str] = []
    seen: set[str] = set()
    for row in rows:
        for key in row.keys():
            if key not in seen:
                seen.add(key)
                ordered.append(key)
    return ordered


def csv_bytes(rows: list[dict[str, Any]]) -> bytes:
    output = io.StringIO(newline="")
    headers = _headers(rows)
    writer = csv.DictWriter(output, fieldnames=headers, extrasaction="ignore")
    if headers:
        writer.writeheader()
        for row in rows:
            writer.writerow({key: _normalise(row.get(key)) for key in headers})
    return output.getvalue().encode("utf-8-sig")


def _column_name(index: int) -> str:
    result = ""
    while index:
        index, remainder = divmod(index - 1, 26)
        result = chr(65 + remainder) + result
    return result


def _cell_xml(reference: str, value: Any, style: int | None = None) -> str:
    normalised = _normalise(value)
    style_attr = f' s="{style}"' if style is not None else ""
    if isinstance(normalised, (int, float)) and not isinstance(normalised, bool):
        return f'<c r="{reference}"{style_attr}><v>{normalised}</v></c>'
    return f'<c r="{reference}" t="inlineStr"{style_attr}><is><t>{escape(str(normalised))}</t></is></c>'


def _sheet_xml(rows: list[dict[str, Any]]) -> str:
    headers = _headers(rows)
    sheet_rows: list[str] = []
    if headers:
        header_cells = "".join(
            _cell_xml(f"{_column_name(index)}1", header.replace("_", " ").title(), style=1)
            for index, header in enumerate(headers, start=1)
        )
        sheet_rows.append(f'<row r="1">{header_cells}</row>')
        for row_number, row in enumerate(rows, start=2):
            cells = "".join(
                _cell_xml(f"{_column_name(index)}{row_number}", row.get(header))
                for index, header in enumerate(headers, start=1)
            )
            sheet_rows.append(f'<row r="{row_number}">{cells}</row>')

    end_column = _column_name(max(len(headers), 1))
    end_row = max(len(rows) + (1 if headers else 0), 1)
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        f'<dimension ref="A1:{end_column}{end_row}"/>'
        '<sheetViews><sheetView workbookViewId="0"/></sheetViews>'
        '<sheetFormatPr defaultRowHeight="18"/>'
        '<sheetData>' + "".join(sheet_rows) + '</sheetData>'
        f'<autoFilter ref="A1:{end_column}{max(end_row, 1)}"/>'
        '</worksheet>'
    )


def xlsx_bytes(sheets: Iterable[tuple[str, list[dict[str, Any]]]]) -> bytes:
    sheet_items = list(sheets)
    if not sheet_items:
        sheet_items = [("Data", [])]

    safe_names: list[str] = []
    for raw_name, _ in sheet_items:
        name = _INVALID_SHEET_CHARS.sub(" ", raw_name).strip()[:31] or "Data"
        candidate = name
        suffix = 2
        while candidate in safe_names:
            suffix_text = f" {suffix}"
            candidate = f"{name[:31-len(suffix_text)]}{suffix_text}"
            suffix += 1
        safe_names.append(candidate)

    workbook_sheets = "".join(
        f'<sheet name="{escape(name)}" sheetId="{index}" r:id="rId{index}"/>'
        for index, name in enumerate(safe_names, start=1)
    )
    workbook_xml = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
        f'<sheets>{workbook_sheets}</sheets></workbook>'
    )

    workbook_rels = "".join(
        f'<Relationship Id="rId{index}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet{index}.xml"/>'
        for index in range(1, len(sheet_items) + 1)
    )
    workbook_rels_xml = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        f'{workbook_rels}'
        '<Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
        '</Relationships>'
    )

    content_overrides = "".join(
        f'<Override PartName="/xl/worksheets/sheet{index}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
        for index in range(1, len(sheet_items) + 1)
    )
    content_types_xml = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
        '<Default Extension="xml" ContentType="application/xml"/>'
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
        '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
        f'{content_overrides}</Types>'
    )

    root_rels_xml = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
        '</Relationships>'
    )

    styles_xml = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Calibri"/></font></fonts>'
        '<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF2A4933"/><bgColor indexed="64"/></patternFill></fill></fills>'
        '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'
        '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
        '<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs>'
        '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>'
        '</styleSheet>'
    )

    output = io.BytesIO()
    with zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED) as archive:
        archive.writestr("[Content_Types].xml", content_types_xml)
        archive.writestr("_rels/.rels", root_rels_xml)
        archive.writestr("xl/workbook.xml", workbook_xml)
        archive.writestr("xl/_rels/workbook.xml.rels", workbook_rels_xml)
        archive.writestr("xl/styles.xml", styles_xml)
        for index, (_, rows) in enumerate(sheet_items, start=1):
            archive.writestr(f"xl/worksheets/sheet{index}.xml", _sheet_xml(rows))
    return output.getvalue()
