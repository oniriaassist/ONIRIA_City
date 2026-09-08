import HeroCarousel from "./HeroCarousel";

const slides = [
  { image: "/media/oniria/residence-roundabout.png", position: "center" },
  { image: "/media/oniria/villa-pool-rear.png", position: "center" },
  { image: "/media/oniria/residence-aerial-masterplan.png", position: "center" },
];

export default function HeroSection() {
  return (
    <section
      className="heroSlider edenInspiredHero"
      aria-label="Welcome to Roho"
    >
      <HeroCarousel slides={slides} />

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
