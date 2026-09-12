export default function HeroSection() {
  return (
    <section
      className="heroSlider edenInspiredHero"
      aria-label="Welcome to Roho"
    >
      <div className="heroSlides" aria-hidden="true">
        <div
          className="heroSlide heroSlideActive"
          style={{
            backgroundImage: 'url("/media/oniria/villa-pool-rear.png")',
            backgroundPosition: "center",
          }}
        />
      </div>

      <div className="heroDarkOverlay" />

      <div className="heroMainContent edenHeroContent">
        <h1 className="hero-title">
          <span>WELCOME TO</span>
          <span>ROHO</span>
        </h1>
        <p className="heroSignature hero-subtitle">MY HOME. MY SOUL.</p>
      </div>

      <a href="#introduction" className="beginStoryLink hero-cta" aria-label="Begin your story and continue to the next section">
        <span>BEGIN YOUR STORY</span>
        <span className="beginStoryArrow" aria-hidden="true" />
      </a>
    </section>
  );
}
