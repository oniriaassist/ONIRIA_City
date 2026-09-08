"use client";

import { useEffect, useState } from "react";

export default function HeroCarousel({ slides }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return undefined;

    const slider = window.setInterval(() => {
      setCurrentSlide((previous) => (previous + 1) % slides.length);
    }, 8000);

    return () => window.clearInterval(slider);
  }, [isPaused, slides.length]);

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
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
    </div>
  );
}
