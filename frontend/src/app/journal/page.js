import Header from "../components/Header";
import PublicPageHero from "../components/PublicPageHero";
import FinalSalesCTA from "../components/FinalSalesCTA";
import Footer from "../components/Footer";

export const metadata = {
  title: "MALǓA Journal",
  description:
    "Stories about MALǓA, architecture, lifestyle, investment and island living in Zanzibar.",
};

const articles = [
  {
    category: "MALǓA",
    date: "Coming soon",
    title: "Introducing a New Way of Living in Fumba",
    description:
      "Discover the vision behind a connected residential and lifestyle destination shaped by Zanzibar.",
    image: "/media/oniria/villa-front-entry.png",
    slug: "introducing-oniria-city",
  },
  {
    category: "ARCHITECTURE",
    date: "Coming soon",
    title: "Designing Contemporary Homes for a Tropical Climate",
    description:
      "Explore how light, airflow, shade and natural materials shape MALǓA’s architectural direction.",
    image: "/media/oniria/villa-gated-entry.png",
    slug: "tropical-architecture",
  },
  {
    category: "LIFESTYLE",
    date: "Coming soon",
    title: "Why Zanzibar Continues to Inspire the World",
    description:
      "Ocean experiences, culture, nature and warm hospitality make Zanzibar a distinctive place to live.",
    image: "/media/malua/malua-interior.webp",
    slug: "zanzibar-lifestyle",
  },
  {
    category: "INVESTMENT",
    date: "Coming soon",
    title: "Understanding the MALǓA Property Collections",
    description:
      "Explore the villas, residences and V Avenue opportunities planned within one connected destination.",
    image: "/media/oniria/residence-roundabout.png",
    slug: "property-collections",
  },
  {
    category: "MASTERPLAN",
    date: "Coming soon",
    title: "Building a Walkable and Connected Community",
    description:
      "See how homes, public spaces, landscape and everyday services are designed to work together.",
    image: "/media/oniria/residence-aerial-masterplan.png",
    slug: "connected-community",
  },
  {
    category: "WELLNESS",
    date: "Coming soon",
    title: "Creating Space for Health, Nature and Belonging",
    description:
      "MALǓA’s lifestyle vision brings wellness, landscaped spaces and social connection into everyday life.",
    image: "/media/malua/malua-shoreline.webp",
    slug: "wellness-and-belonging",
  },
];

export default function JournalPage() {
  return (
    <main className="journalPage journalPagePremium">
      <Header />

      <PublicPageHero
        eyebrow="THE MALǓA JOURNAL"
        title="Stories from MALǓA"
        description="Architecture, lifestyle, place and ideas inspired by a new way of living in Zanzibar."
        image="/media/malua/malua-homepage-premium.webp"
      />

      <section className="journalIntroduction journalPremiumIntroduction" id="page-content">
        <div>
          <p className="sectionLabel">JOURNAL · ZANZIBAR</p>
          <h2>Ideas shaping the MALǓA experience</h2>
        </div>

        <p>
          Follow the development journey and explore thoughtful stories about
          architecture, community, island living, landscape and long-term value.
        </p>
      </section>

      <section className="journalGrid journalPremiumGrid" aria-label="MALǓA journal stories">
        {articles.map((article, index) => (
          <article
            className={`journalCard journalPremiumCard ${index === 0 ? "journalPremiumCardFeatured" : ""}`}
            key={article.slug}
          >
            <a href={`/journal/${article.slug}`} className="journalImageLink" aria-label={`Read ${article.title}`}>
              <div
                className="journalImage journalPremiumImage"
                style={{ backgroundImage: `url("${article.image}")` }}
              >
                <div className="journalImageOverlay" />
              </div>
            </a>

            <div className="journalCardContent journalPremiumContent">
              <div className="journalMeta">
                <span>{article.category}</span>
                <span>{article.date}</span>
              </div>

              <h2>{article.title}</h2>
              <p>{article.description}</p>

              <a href={`/journal/${article.slug}`} className="journalPremiumLink">
                Read article <span aria-hidden="true">→</span>
              </a>
            </div>
          </article>
        ))}
      </section>

      <FinalSalesCTA />
      <Footer />
    </main>
  );
}
