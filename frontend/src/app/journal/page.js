import Header from "../components/Header";
import PublicPageHero from "../components/PublicPageHero";
import FinalSalesCTA from "../components/FinalSalesCTA";
import Footer from "../components/Footer";

export const metadata = {
  title: "Journal",
  description:
    "Read stories about ONIRIA City, architecture, lifestyle and Zanzibar.",
};

const articles = [
  {
    category: "ONIRIA CITY",
    date: "Coming soon",
    title: "Introducing a New Way of Living in Fumba",
    description:
      "Discover the vision behind a connected residential and lifestyle destination shaped by Zanzibar.",
    image:
      "/media/oniria/villa-front-entry.png",
    slug: "introducing-oniria-city",
  },
  {
    category: "ARCHITECTURE",
    date: "Coming soon",
    title: "Designing Contemporary Homes for a Tropical Climate",
    description:
      "Explore how light, airflow, shade and natural materials influence ONIRIA’s architectural direction.",
    image:
      "/media/oniria/villa-gated-entry.png",
    slug: "tropical-architecture",
  },
  {
    category: "LIFESTYLE",
    date: "Coming soon",
    title: "Why Zanzibar Continues to Inspire the World",
    description:
      "Ocean experiences, culture, nature and warm hospitality make Zanzibar a distinctive place to live.",
    image:
      "/media/oniria/residence-parking-garden.png",
    slug: "zanzibar-lifestyle",
  },
  {
    category: "INVESTMENT",
    date: "Coming soon",
    title: "Understanding the ONIRIA Property Collections",
    description:
      "Learn about the villas, residences, apartments and commercial opportunities planned for the community.",
    image:
      "/media/oniria/residence-roundabout.png",
    slug: "property-collections",
  },
  {
    category: "MASTERPLAN",
    date: "Coming soon",
    title: "Building a Walkable and Connected Community",
    description:
      "See how homes, public spaces, nature and everyday services can work together within one destination.",
    image:
      "/media/oniria/residence-aerial-masterplan.png",
    slug: "connected-community",
  },
  {
    category: "WELLNESS",
    date: "Coming soon",
    title: "Creating Space for Health, Nature and Belonging",
    description:
      "ONIRIA’s lifestyle vision includes wellness, landscaped spaces and opportunities for social connection.",
    image:
      "/media/oniria/v-avenue-commercial.png",
    slug: "wellness-and-belonging",
  },
];

export default function JournalPage() {
  return (
    <main>
      <Header />

      <PublicPageHero
        eyebrow="THE ONIRIA JOURNAL"
        title="Stories from ONIRIA City"
        description="Architecture, lifestyle, investment and stories inspired by Zanzibar."
        image="/media/oniria/villa-pool-rear.png"
      />

      <section className="journalIntroduction" id="page-content">
        <p className="sectionLabel">NEWS & STORIES</p>

        <h2>Ideas shaping the ONIRIA experience</h2>

        <p>
          Follow the development journey and explore stories about design,
          community, island living and investment in Zanzibar.
        </p>
      </section>

      <section className="journalGrid">
        {articles.map((article) => (
          <article className="journalCard" key={article.slug}>
            <a href={`/journal/${article.slug}`} className="journalImageLink">
              <div
                className="journalImage"
                style={{ backgroundImage: `url("${article.image}")` }}
              >
                <div className="journalImageOverlay" />
                <span>Read story →</span>
              </div>
            </a>

            <div className="journalCardContent">
              <div className="journalMeta">
                <span>{article.category}</span>
                <span>{article.date}</span>
              </div>

              <h2>{article.title}</h2>

              <p>{article.description}</p>

              <a href={`/journal/${article.slug}`} className="textLink">
                Read article →
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
