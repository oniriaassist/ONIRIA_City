import Header from "./Header";
import PublicPageHero from "./PublicPageHero";
import FinalSalesCTA from "./FinalSalesCTA";
import Footer from "./Footer";

function getSectionId(section) {
  if (section.id) {
    return section.id;
  }

  return section.title
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function EditorialPage({
  hero,
  introduction,
  sections,
  showFinalCTA = true,
}) {
  return (
    <main>
      <Header />

      <PublicPageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        description={hero.description}
        image={hero.image}
      />

      <section className="editorialIntroduction" id="page-content">
        <p className="sectionLabel">{introduction.label}</p>

        <h2>{introduction.title}</h2>

        <p>{introduction.description}</p>
      </section>

      <section className="editorialSections" id="editorial-sections">
        {sections.map((section, index) => (
          <article
            className={`editorialSection ${
              index % 2 !== 0 ? "editorialSectionReverse" : ""
            }`}
            id={getSectionId(section)}
            key={section.title}
          >
            <div
              className="editorialSectionImage"
              style={{
                backgroundImage: `url("${section.image}")`,
              }}
            />

            <div className="editorialSectionContent">
              <span>{String(index + 1).padStart(2, "0")}</span>

              <h2>{section.title}</h2>

              <p>{section.description}</p>

              {section.points && (
                <ul>
                  {section.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              )}

              {section.link && (
                <a href={section.link.href} className="textLink">
                  {section.link.label} →
                </a>
              )}
            </div>
          </article>
        ))}
      </section>

      {showFinalCTA && <FinalSalesCTA />}
      <Footer />
    </main>
  );
}
