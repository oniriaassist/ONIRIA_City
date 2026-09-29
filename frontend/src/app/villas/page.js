import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata = {
  title: "Villas | MALǓA",
  description:
    "Explore private villas at MALǓA in Fumba, Zanzibar — generous tropical homes shaped around privacy, landscape and indoor-outdoor living.",
};

const villas = [
  {
    title: "Signature Four-Bedroom Villa",
    eyebrow: "SIGNATURE VILLA",
    image: "/media/oniria/villa-pool-rear.png",
    bedrooms: "4 bedrooms",
    bathrooms: "4 bathrooms",
    area: "320 m²",
    description:
      "A generous family villa with refined interiors, private gardens and an easy connection between indoor living and the landscape outside.",
    link: "/villas/signature-villa",
    featured: true,
  },
  {
    title: "Three-Bedroom Garden Villa",
    eyebrow: "GARDEN VILLA",
    image: "/media/oniria/villa-gated-entry.png",
    bedrooms: "3 bedrooms",
    bathrooms: "3 bathrooms",
    area: "245 m²",
    description:
      "A calm contemporary home shaped around landscaped outdoor space, comfortable family rooms and everyday privacy.",
    link: "/villas/garden-villa",
  },
  {
    title: "Courtyard Villa",
    eyebrow: "COURTYARD VILLA",
    image: "/media/malua/villa-pool.webp",
    bedrooms: "3 bedrooms",
    bathrooms: "3 bathrooms",
    area: "260 m²",
    description:
      "A private villa planned around light, greenery and sheltered outdoor living, bringing a quieter rhythm into the centre of the home.",
    link: "/villas/courtyard-villa",
  },
];

const principles = [
  {
    label: "PRIVATE OUTDOOR LIVING",
    title: "A home that opens to the landscape.",
    description:
      "Gardens, terraces and shaded outdoor areas extend everyday living beyond the walls of the home.",
  },
  {
    label: "GENEROUS SPACE",
    title: "Room for life to evolve.",
    description:
      "Flexible interiors support family life, visiting guests, private work and slower moments of retreat.",
  },
  {
    label: "TROPICAL DESIGN",
    title: "Comfort shaped by Zanzibar.",
    description:
      "Natural light, shade, airflow and calm material choices create an easy relationship with the island climate.",
  },
];

export default function VillasPage() {
  return (
    <main className="villasPremiumPage">
      <Header />

      <section
        className="villasPremiumHero"
        style={{
          backgroundImage: 'url("/media/malua/malua-bedroom-premium.webp")',
        }}
      >
        <div className="villasPremiumHeroOverlay" />

        <div className="villasPremiumHeroInner">
          <h1>
            Space to
            <em> live well.</em>
          </h1>

          <p>
            Private villas shaped around light, landscape and the freedom of
            indoor-outdoor island living.
          </p>

          <a href="/register-interest" className="villasPremiumHeroAction">
            Register interest <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="villasPremiumFacts" aria-label="Villa collection summary">
          <div>
            <small>Collection</small>
            <strong>3–4 bedrooms</strong>
          </div>
          <div>
            <small>Villa sizes</small>
            <strong>245–320 m²</strong>
          </div>
          <div>
            <small>Setting</small>
            <strong>Private gardens</strong>
          </div>
          <div>
            <small>Location</small>
            <strong>Fumba, Zanzibar</strong>
          </div>
        </div>
      </section>

      <section className="villasPremiumIntro" id="page-content">
        <div className="villasPremiumIntroCopy">
          <p className="sectionLabel">THE VILLA COLLECTION</p>
          <h2>More space. More privacy. More possibility.</h2>
          <p>
            MALǓA villas are designed for owners who value generous living,
            private outdoor space and a calm tropical setting. Architecture,
            landscape and everyday comfort come together as one complete home.
          </p>
        </div>

        <div
          className="villasPremiumIntroImage"
          role="img"
          aria-label="MALǓA private villa surrounded by tropical landscape"
          style={{
            backgroundImage: 'url("/media/oniria/villa-front-entry.png")',
          }}
        >
          <div className="villasPremiumIntroCaption">
            <span>PRIVATE LIVING</span>
            <strong>Architecture softened by landscape.</strong>
          </div>
        </div>
      </section>

      <section className="villasPremiumPrinciples" aria-label="Villa design principles">
        {principles.map((principle) => (
          <article key={principle.title}>
            <p>{principle.label}</p>
            <h3>{principle.title}</h3>
            <span>{principle.description}</span>
          </article>
        ))}
      </section>

      <section className="villasPremiumCollection" id="available-collection">
        <div className="villasPremiumCollectionHeading">
          <div>
            <p className="sectionLabel">AVAILABLE COLLECTION</p>
            <h2>Choose the villa that fits the way you want to live.</h2>
          </div>
          <p>
            Explore three private villa types and compare their proportions,
            specifications and individual character.
          </p>
        </div>

        <div className="villasPremiumGrid">
          {villas.map((villa) => (
            <article
              className={`villasPremiumCard${
                villa.featured ? " villasPremiumCardFeatured" : ""
              }`}
              key={villa.title}
            >
              <div className="villasPremiumCardImageLink">
                <div
                  className="villasPremiumCardImage"
                  style={{ backgroundImage: `url("${villa.image}")` }}
                >
                  <div className="villasPremiumCardImageOverlay" />
                </div>
              </div>

              <div className="villasPremiumCardContent">
                <p className="villasPremiumCardEyebrow">{villa.eyebrow}</p>
                <h3>{villa.title}</h3>

                <div
                  className="villasPremiumSpecs"
                  aria-label={`${villa.title} specifications`}
                >
                  <span>{villa.bedrooms}</span>
                  <span>{villa.bathrooms}</span>
                  <span>{villa.area}</span>
                </div>

                <p className="villasPremiumCardDescription">
                  {villa.description}
                </p>

              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="villasPremiumEnquiry" aria-label="Private villa enquiry">
        <div>
          <p className="sectionLabel">PRIVATE VILLA ENQUIRY</p>
          <h2>Explore the collection in more detail.</h2>
        </div>
        <p>
          Request villa information or arrange a private site visit with the
          MALǓA team to discuss the home that best fits your plans.
        </p>
        <div className="villasPremiumEnquiryActions">
          <a href="/register-interest">
            Register interest <span aria-hidden="true">→</span>
          </a>
          <a href="/arrange-site-visit">Arrange a site visit</a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
