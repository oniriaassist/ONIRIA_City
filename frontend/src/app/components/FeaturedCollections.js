const collections = [
  {
    title: "Villas",
    category: "PRIVATE LIVING",
    description:
      "Elegant private villas designed for comfort, privacy and modern island living.",
    image: "/media/oniria/villa-front-entry.png",
    link: "/villas#available-collection",
  },
  {
    title: "Residences",
    category: "MODERN RESIDENCES",
    description:
      "Contemporary homes combining thoughtful design, natural light and community.",
    image: "/media/malua/interior-staircase.webp",
    link: "/residences#available-collection",
  },
  {
    title: "V Avenue",
    category: "LIFESTYLE & BUSINESS",
    description:
      "A vibrant destination for shops, restaurants, services and everyday experiences.",
    image: "/media/oniria/v-avenue-commercial.png",
    link: "/v-avenue#v-avenue-opportunities",
  },
];

export default function FeaturedCollections() {
  return (
    <section className="collectionsSection maluaCollectionsSection">
      <div className="collectionsHeading">
        <p className="sectionLabel">DISCOVER MALǓA</p>
        <h2>Featured Collections</h2>
        <p>
          Explore the different spaces that come together to create the MALǓA
          experience.
        </p>
      </div>

      <div className="collectionsGrid maluaCollectionsGrid">
        {collections.map((collection) => (
          <article className="collectionCard maluaCollectionCard" key={collection.title}>
            <a
              href={collection.link}
              className="maluaCollectionImageLink"
              aria-label={`Explore ${collection.title}`}
            >
              <div
                className="collectionImage maluaCollectionImage"
                style={{ backgroundImage: `url("${collection.image}")` }}
              >
                <div className="collectionOverlay" />
                <span className="maluaCollectionImageAction">Explore →</span>
              </div>
            </a>

            <div className="maluaCollectionBody">
              <p className="maluaCollectionCategory">{collection.category}</p>
              <div className="maluaCollectionTitleRow">
                <h3>{collection.title}</h3>
                <a href={collection.link} aria-label={`Explore ${collection.title}`}>
                  ↗
                </a>
              </div>
              <p className="collectionDescription">{collection.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
