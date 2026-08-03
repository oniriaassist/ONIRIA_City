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
        {eyebrow && <p>{eyebrow}</p>}
        <h1>{title}</h1>
        <span>{description}</span>
      </div>

      <a href="#page-content" className="publicPageScroll">
        Explore ↓
      </a>
    </section>
  );
}