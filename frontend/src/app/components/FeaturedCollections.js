const collections = [
  {
    title: "Villas",
    category: "PRIVATE LIVING",
    description:
      "Elegant private villas designed for comfort, privacy and modern island living.",
    image:
      "/media/oniria/villa-pool-rear.png",
    link: "/villas#available-collection",
  },
  {
    title: "Residences",
    category: "MODERN RESIDENCES",
    description:
      "Contemporary homes combining thoughtful design, natural light and community.",
    image:
      "/media/oniria/residence-roundabout.png",
    link: "/residences#available-collection",
  },
  {
    title: "V Avenue",
    category: "LIFESTYLE & BUSINESS",
    description:
      "A vibrant destination for shops, restaurants, services and everyday experiences.",
    image:
      "/media/oniria/v-avenue-commercial.png",
    link: "/v-avenue#v-avenue-opportunities",
  },
];

export default function FeaturedCollections() {
  return (
    <section className="collectionsSection">
      <div className="collectionsHeading">
        <p className="sectionLabel">DISCOVER ONIRIA</p>

        <h2>Featured Collections</h2>

        <p>
          Explore the different spaces that come together to create the ONIRIA
          City experience.
        </p>
      </div>

      <div className="collectionsGrid">
        {collections.map((collection) => (
          <article className="collectionCard" key={collection.title}>
            <div
              className="collectionImage"
              style={{
                backgroundImage: `url("${collection.image}")`,
              }}
            >
              <div className="collectionOverlay"></div>

              <div className="collectionContent">
                <p>{collection.category}</p>

                <h3>{collection.title}</h3>

                <span>Explore →</span>
              </div>

              <a
                href={collection.link}
                className="collectionFullLink"
                aria-label={`Explore ${collection.title}`}
              ></a>
            </div>

            <p className="collectionDescription">
              {collection.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
