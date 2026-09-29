export default function BrandLogo({ className = "", label }) {
  const classes = ["maluaBrandLogo", className].filter(Boolean).join(" ");
  const accessibility = label
    ? { role: "img", "aria-label": label }
    : { "aria-hidden": true };

  return (
    <svg
      className={classes}
      viewBox="0 0 320 100"
      preserveAspectRatio="none"
      focusable="false"
      {...accessibility}
    >
      <text
        className="maluaBrandLogoText"
        x="160"
        y="52"
        textAnchor="middle"
        dominantBaseline="middle"
        textLength="294"
        lengthAdjust="spacingAndGlyphs"
      >
        MALǓA
      </text>
    </svg>
  );
}
