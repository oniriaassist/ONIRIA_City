const residences = [
  {
    title: "Signature Villa",
    type: "ONIRIA VILLAS",
    image:
      "/media/oniria/villa-pool-rear.png",
    bedrooms: "4 Bedrooms",
    area: "320 m²",
    price: "Price on request",
    description:
      "A spacious private villa with elegant interiors, landscaped outdoor areas and a strong connection to Zanzibar’s tropical environment.",
    link: "/villas/signature-villa",
  },
  {
    title: "Garden Residence",
    type: "RESIDENCES",
    image:
      "/media/oniria/residence-roundabout.png",
    bedrooms: "3 Bedrooms",
    area: "210 m²",
    price: "Price on request",
    description:
      "A refined residence designed around natural light, open-plan living and peaceful views of the landscaped community.",
    link: "/residences/garden-residence",
  },
  {
    title: "V Avenue Apartment",
    type: "V AVENUE",
    image:
      "/media/oniria/v-avenue-commercial.png",
    bedrooms: "2 Bedrooms",
    area: "145 m²",
    price: "Price on request",
    description:
      "A modern apartment close to shops, dining, services and everyday experiences within the heart of ONIRIA City.",
    link: "/v-avenue/apartment",
  },
];

export default function FeaturedResidences() {
  return (
    <section className="featuredResidencesSection">
      <div className="featuredResidencesHeading">
        <div>
          <p className="sectionLabel">FEATURED HOMES</p>
          <h2>Find a residence that fits your way of life</h2>
        </div>

        <div className="featuredResidencesIntro">
          <p>
            Explore a selection of villas, residences and apartments designed
            for comfort, privacy and modern island living.
          </p>

          <a href="/properties#available-collection" className="textLink">
            View all properties →
          </a>
        </div>
      </div>

      <div className="featuredResidencesGrid">
        {residences.map((residence) => (
          <article className="residenceCard" key={residence.title}>
            <a href={residence.link} className="residenceImageLink">
              <div
                className="residenceImage"
                style={{
                  backgroundImage: `url("${residence.image}")`,
                }}
              >
                <div className="residenceImageOverlay" />

                <span className="residenceViewLabel">View residence →</span>
              </div>
            </a>

            <div className="residenceCardContent">
              <h3>{residence.title}</h3>

              <div className="residenceDetails">
                <span>{residence.bedrooms}</span>
                <span>{residence.area}</span>
              </div>

              <p>{residence.description}</p>

              <div className="residenceCardFooter">
                <div>
                  <small>Starting from</small>
                  <strong>{residence.price}</strong>
                </div>

                <a href={residence.link}>Explore →</a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
