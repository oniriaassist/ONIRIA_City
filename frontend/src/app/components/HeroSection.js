import BrandLogo from "./BrandLogo";

export default function HeroSection() {
  return (
    <section
      className="heroSlider edenInspiredHero"
      aria-label="Welcome to MALǓA"
    >
      <div className="heroSlides" aria-hidden="true">
        <div
          className="heroSlide heroSlideActive"
          style={{
            backgroundImage: 'url("/media/malua/arrival.webp")',
            backgroundPosition: "center 56%",
          }}
        />
      </div>

      <div className="heroDarkOverlay" />

      <div className="heroMainContent edenHeroContent">
        <h1 className="hero-title maluaHeroTitle" aria-label="WELCOME TO MALǓA">
          <span>WELCOME TO</span>
          <span className="maluaHeroBrandWord" aria-hidden="true">
            <BrandLogo className="maluaHeroBrandLogo" />
          </span>
        </h1>
        <p className="heroSignature hero-subtitle">A world of your own</p>
      </div>

      <a href="#introduction" className="beginStoryLink hero-cta" aria-label="Begin your story and continue to the next section">
        <span>BEGIN YOUR STORY</span>
        <span className="beginStoryArrow" aria-hidden="true" />
      </a>
    </section>
  );
}
