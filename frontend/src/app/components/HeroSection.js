"use client";

import { useEffect, useState } from "react";

const slides = [
  { image: "/media/oniria/residence-roundabout.png", position: "center" },
  { image: "/media/oniria/villa-pool-rear.png", position: "center" },
  { image: "/media/oniria/residence-aerial-masterplan.png", position: "center" },
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return undefined;

    const slider = window.setInterval(() => {
      setCurrentSlide((previous) => (previous + 1) % slides.length);
    }, 8000);

    return () => window.clearInterval(slider);
  }, [isPaused]);

  return (
    <section
      className="heroSlider edenInspiredHero"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Welcome to ONIRIA City"
    >
      <div className="heroSlides" aria-hidden="true">
        {slides.map((slide, index) => (
          <div
            key={slide.image}
            className={`heroSlide ${currentSlide === index ? "heroSlideActive" : ""}`}
            style={{
              backgroundImage: `url("${slide.image}")`,
              backgroundPosition: slide.position,
            }}
          />
        ))}
      </div>

      <div className="heroDarkOverlay" />

      <div className="heroMainContent edenHeroContent">
        <h1>
          <span>WELCOME TO</span>
          <span>ONIRIA CITY</span>
        </h1>
        <p className="heroSignature">The Art of Living</p>
      </div>

      <a href="#introduction" className="beginStoryLink" aria-label="Begin your story and continue to the next section">
        <span>BEGIN YOUR STORY</span>
        <span className="beginStoryArrow" aria-hidden="true" />
      </a>

      <div className="heroSlideDots" aria-label="Hero slides">
        {slides.map((slide, index) => (
          <button
            key={slide.image}
            type="button"
            className={currentSlide === index ? "isActive" : ""}
            onClick={() => {
              setCurrentSlide(index);
              setIsPaused(true);
            }}
            aria-label={`Show slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
