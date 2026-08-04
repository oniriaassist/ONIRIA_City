export default function IntroductionSection() {
  return (
    <section id="introduction" className="introductionSection">
      <div className="introductionInner">
        <p className="sectionLabel">WELCOME HOME</p>

        <h2>A NEW ZANZIBAR WAY OF LIFE</h2>

        <div className="introductionCopy">
          <p className="introductionText">
            ONIRIA City is a carefully designed residential and lifestyle
            destination in Fumba, Zanzibar. It brings together beautiful
            architecture, natural surroundings, wellness, comfort and community.
          </p>

          <p className="introductionText">
            From private villas and modern residences to commercial spaces and
            shared amenities, every part of ONIRIA City is designed to create a
            peaceful, connected and inspiring way of life.
          </p>
        </div>

        <a href="/vision" className="textLink introductionLink">
          Discover our vision <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  );
}
