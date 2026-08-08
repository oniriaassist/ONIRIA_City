import { notFound } from "next/navigation";
import Header from "../../components/Header";
import PublicPageHero from "../../components/PublicPageHero";
import FinalSalesCTA from "../../components/FinalSalesCTA";
import Footer from "../../components/Footer";

const articles = {
  "introducing-oniria-city": {
    category: "ONIRIA CITY",
    title: "Introducing a New Way of Living in Fumba",
    description:
      "Discover the vision behind a connected residential and lifestyle destination shaped by Zanzibar.",
    image: "/media/oniria/villa-front-entry.png",
    sections: [
      {
        title: "A destination shaped around daily life",
        body:
          "ONIRIA City brings homes, landscape, amenities and commercial spaces together in one planned destination. The ambition is to create a calm, connected place where living, working and gathering feel naturally close.",
      },
      {
        title: "Connected to Zanzibar",
        body:
          "The project takes its cues from Zanzibar's light, climate, coastal rhythm and community culture. Architecture, outdoor spaces and services are planned to support a refined island lifestyle.",
      },
      {
        title: "A clear next step",
        body:
          "Prospective residents, buyers and business owners can register their interest to receive approved project information as availability, timelines and collection details are released.",
      },
    ],
  },
  "tropical-architecture": {
    category: "ARCHITECTURE",
    title: "Designing Contemporary Homes for a Tropical Climate",
    description:
      "Explore how light, airflow, shade and natural materials influence ONIRIA's architectural direction.",
    image: "/media/oniria/villa-gated-entry.png",
    sections: [
      {
        title: "Designing with climate",
        body:
          "Tropical living depends on comfort, shade and natural movement of air. ONIRIA's architecture is planned around generous openings, protected outdoor areas and a close relationship with landscape.",
      },
      {
        title: "A calmer material palette",
        body:
          "Warm textures, natural tones and refined details support the project's quiet luxury character while keeping homes practical for everyday use.",
      },
      {
        title: "Homes that feel open and private",
        body:
          "The design language balances open living spaces with private rooms, garden areas and calm transitions between inside and outside.",
      },
    ],
  },
  "zanzibar-lifestyle": {
    category: "LIFESTYLE",
    title: "Why Zanzibar Continues to Inspire the World",
    description:
      "Ocean experiences, culture, nature and warm hospitality make Zanzibar a distinctive place to live.",
    image: "/media/oniria/residence-parking-garden.png",
    sections: [
      {
        title: "A rhythm shaped by place",
        body:
          "Zanzibar offers a rare blend of ocean, culture, climate and calm. ONIRIA City is planned to make that rhythm part of everyday residential life.",
      },
      {
        title: "Wellness and community",
        body:
          "Landscaped areas, gathering spaces and daily services are intended to support a lifestyle that feels both private and connected.",
      },
      {
        title: "A long-term home",
        body:
          "The destination is designed for people who want more than a property: a place to return to, share and grow with over time.",
      },
    ],
  },
  "property-collections": {
    category: "INVESTMENT",
    title: "Understanding the ONIRIA Property Collections",
    description:
      "Learn about the villas, residences, apartments and commercial opportunities planned for the community.",
    image: "/media/oniria/residence-roundabout.png",
    sections: [
      {
        title: "Different ways to belong",
        body:
          "ONIRIA City includes private villas, modern residences, apartments and commercial spaces so buyers can choose the setting that matches their lifestyle or investment goals.",
      },
      {
        title: "A shared destination",
        body:
          "Each collection has its own character while remaining connected to the wider masterplan, amenities and V Avenue.",
      },
      {
        title: "Guided information",
        body:
          "The ONIRIA team can provide current availability, details and next steps through the register interest and request brochure pages.",
      },
    ],
  },
  "connected-community": {
    category: "MASTERPLAN",
    title: "Building a Walkable and Connected Community",
    description:
      "See how homes, public spaces, nature and everyday services can work together within one destination.",
    image: "/media/oniria/residence-aerial-masterplan.png",
    sections: [
      {
        title: "A more connected plan",
        body:
          "Walkable routes, public spaces and nearby services help residents move through the destination with ease.",
      },
      {
        title: "Nature and convenience",
        body:
          "The masterplan is intended to balance landscaped calm with daily convenience, bringing homes, amenities and commercial life into a coherent whole.",
      },
      {
        title: "Designed for generations",
        body:
          "A connected community is not only about movement. It is about creating a place where families, neighbours and visitors can feel at home.",
      },
    ],
  },
  "wellness-and-belonging": {
    category: "WELLNESS",
    title: "Creating Space for Health, Nature and Belonging",
    description:
      "ONIRIA's lifestyle vision includes wellness, landscaped spaces and opportunities for social connection.",
    image: "/media/oniria/v-avenue-commercial.png",
    sections: [
      {
        title: "Everyday wellbeing",
        body:
          "Wellness at ONIRIA is planned as part of daily life: spaces to walk, rest, gather and reconnect with nature.",
      },
      {
        title: "Shared experiences",
        body:
          "Amenities, landscaped areas and V Avenue create opportunities for residents and visitors to meet naturally throughout the day.",
      },
      {
        title: "A calmer way to live",
        body:
          "The project's visual and spatial language is intentionally restrained, supporting a quieter and more considered residential experience.",
      },
    ],
  },
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = articles[slug];

  if (!article) {
    return {
      title: "Journal Article Not Found",
    };
  }

  return {
    title: `${article.title}`,
    description: article.description,
  };
}

export default async function JournalArticlePage({ params }) {
  const { slug } = await params;
  const article = articles[slug];

  if (!article) {
    notFound();
  }

  return (
    <main>
      <Header />
      <PublicPageHero
        eyebrow={article.category}
        title={article.title}
        description={article.description}
        image={article.image}
      />

      <article className="journalArticleSection" id="page-content">
        {article.sections.map((section, index) => (
          <section key={section.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </section>
        ))}
      </article>

      <FinalSalesCTA />
      <Footer />
    </main>
  );
}
