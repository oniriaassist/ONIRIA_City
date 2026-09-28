export default function IntroductionSection() {
  return (
    <section id="introduction" className="introductionSection maluaIntroductionSection">
      <div className="maluaIntroductionHeading">
        <p className="sectionLabel">WELCOME HOME</p>
        <h2>A NEW ZANZIBAR WAY OF LIFE</h2>
      </div>

      <div className="maluaIntroductionLayout">
        <div className="introductionInner maluaIntroductionCopy">
          <div className="introductionCopy">
            <p className="introductionText">
              MALǓA is a carefully designed residential and lifestyle
              destination in Fumba, Zanzibar. It brings together beautiful
              architecture, natural surroundings, wellness, comfort and community.
            </p>

            <p className="introductionText">
              From private villas and modern residences to commercial spaces and
              shared amenities, every part of MALǓA is designed to create a
              peaceful, connected and inspiring way of life.
            </p>
          </div>

          <a href="/vision#page-content" className="textLink introductionLink">
            Discover our vision <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="maluaIntroductionVisual" aria-label="MALǓA Zanzibar lifestyle">
          <div className="maluaIntroductionImage maluaIntroductionImagePrimary">
            <img src="/media/malua/villa-pool.webp" alt="MALǓA villa with private pool and tropical landscaping" />
          </div>
          <div className="maluaIntroductionImage maluaIntroductionImageSecondary">
            <img src="/media/malua/shoreline.webp" alt="Zanzibar shoreline and clear turquoise water" />
          </div>
        </div>
      </div>
    </section>
  );
}
