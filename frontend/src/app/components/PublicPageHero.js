function renderTitle(title) {
  const lines = Array.isArray(title) ? title : [title];

  return lines.map((line, index) => (
    <span className="publicPageHeroTitleLine" key={`${line}-${index}`}>
      {line}
    </span>
  ));
}

export default function PublicPageHero({
  eyebrow,
  title,
  description,
  image,
}) {
  return (
    <section
      className="publicPageHero"
      style={{
        backgroundImage: `url("${image}")`,
      }}
    >
      <div className="publicPageHeroOverlay" />

      <div className="publicPageHeroContent">
        {eyebrow && <p className="publicPageHeroEyebrow">{eyebrow}</p>}
        <h1 className="hero-title">{renderTitle(title)}</h1>
        <span className="publicPageHeroDescription hero-subtitle">{description}</span>
      </div>

      <a href="#page-content" className="publicPageScroll hero-cta">
        Explore <span aria-hidden="true">↓</span>
      </a>
    </section>
  );
}
