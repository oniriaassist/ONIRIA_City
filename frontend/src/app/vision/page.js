import Image from "next/image";
import Link from "next/link";
import Header from "../components/Header";
import BrandLogo from "../components/BrandLogo";
import Footer from "../components/Footer";
import oniriaInvestmentsLogo from "../../assets/partners/oniria-investments.png";
import vigorGroupLogo from "../../assets/partners/vigor-group.png";

export const metadata = {
  title: "Vision | MALǓA — A World of Your Own",
  description:
    "Discover the vision behind MALǓA in Fumba, Zanzibar — a considered residential and lifestyle destination by ONIRIA Investments.",
};

const principles = [
  {
    title: "Designed around people",
    description:
      "Walkable neighbourhoods, welcoming shared spaces and homes for different stages of life create a calm setting where privacy and connection can coexist.",
    image: "/media/oniria/residence-roundabout.png",
    imagePosition: "center 52%",
  },
  {
    title: "Inspired by Zanzibar",
    description:
      "Tropical landscape, natural materials and an indoor-outdoor rhythm draw directly from the island’s climate, coastline and relaxed way of life.",
    image: "/media/malua/malua-water.webp",
    imagePosition: "center 46%",
  },
  {
    title: "Built for lasting value",
    description:
      "Residential, lifestyle and commercial elements are planned together to support everyday ease, long-term relevance and a destination with enduring identity.",
    image: "/media/oniria/residence-aerial-masterplan.png",
    imagePosition: "center 48%",
  },
];

const waysToLive = [
  {
    label: "PRIVATE LIVING",
    title: "Villas",
    description: "Private homes shaped around greenery, comfort and an easy indoor-outdoor lifestyle.",
  },
  {
    label: "CONNECTED LIVING",
    title: "Residences",
    description: "Contemporary homes with thoughtful layouts, natural light and a strong sense of place.",
  },
  {
    label: "LIFESTYLE",
    title: "Everyday wellbeing",
    description: "Landscape, wellness and social spaces designed to make daily life feel considered and complete.",
  },
  {
    label: "COMMERCE",
    title: "V Avenue",
    description: "Dining, retail, services and commercial opportunities woven into the heart of the destination.",
  },
];

export default function VisionPage() {
  return (
    <main className="visionPage visionPageV5">
      <Header />

      <section className="visionV5Hero" aria-label="MALǓA vision">
        <div className="visionV5HeroImage" aria-hidden="true" />
        <div className="visionV5HeroOverlay" aria-hidden="true" />

        <div className="visionV5HeroInner">
          <div className="visionV5HeroCopy">
            <h1>
              <span>A place to</span>
              <em>belong.</em>
            </h1>
            <p className="visionV5HeroLead">
              Thoughtful living, rooted in Zanzibar and designed for generations.
            </p>

            <div className="visionV5HeroActions">
              <a href="#vision-purpose" className="visionV5PrimaryButton">
                Explore the vision <span aria-hidden="true">↓</span>
              </a>
              <Link href="/request-brochure" className="visionV5InlineLink visionV5InlineLinkLight">
                Request brochure <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <div className="visionV5HeroFacts" aria-label="MALǓA key facts">
            <div>
              <span>Location</span>
              <strong>Fumba, Zanzibar</strong>
            </div>
            <div>
              <span>Destination</span>
              <strong>Residential · Lifestyle · Commerce</strong>
            </div>
            <div>
              <span>Collection</span>
              <strong>Villas · Residences · V Avenue</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="visionV5Purpose" id="vision-purpose">
        <div className="visionV5PurposeIntro">
          <p className="visionV5SectionLabel">OUR PURPOSE</p>
          <h2>Creating a place to live, connect and belong.</h2>
        </div>

        <div className="visionV5PurposeBody">
          <p>
            MALǓA is envisioned as a complete residential and lifestyle community in Fumba,
            bringing homes, commerce, wellness, landscape and shared experiences together
            within one considered destination.
          </p>
          <div className="visionV5Signature">
            <BrandLogo className="visionV5SignatureLogo" />
            <p>
              A world of your own — shaped around arrival, privacy, connection, nature and
              everyday ease.
            </p>
          </div>
        </div>
      </section>

      <section className="visionV5Principles" aria-label="MALǓA design principles">
        <div className="visionV5SectionIntro">
          <div>
            <p className="visionV5SectionLabel">THE MALǓA VISION</p>
            <h2>Designed for the way life should feel.</h2>
          </div>
          <p>
            The vision reaches beyond individual buildings. It is about creating a coherent
            place where architecture, landscape, lifestyle and everyday convenience work as one.
          </p>
        </div>

        <div className="visionV5PrincipleGrid">
          {principles.map((principle) => (
            <article className="visionV5PrincipleCard visionV5PrincipleCardFull" key={principle.title}>
              <div
                className="visionV5PrincipleImage"
                style={{
                  backgroundImage: `url("${principle.image}")`,
                  backgroundPosition: principle.imagePosition,
                }}
                aria-hidden="true"
              />
              <div className="visionV5PrincipleCopy">
                <h3>{principle.title}</h3>
                <p>{principle.description}</p>
              </div>
            </article>
          ))}
        </div>

      </section>

      <section className="visionV5Living" aria-label="Ways to live at MALǓA">
        <div className="visionV5LivingMedia" aria-hidden="true" />

        <div className="visionV5LivingContent">
          <p className="visionV5SectionLabel">ONE DESTINATION · MANY WAYS TO BELONG</p>
          <h2>A complete living environment.</h2>
          <p className="visionV5LivingLead">
            MALǓA brings private homes, contemporary residences, landscape, wellbeing and
            everyday convenience together so each part of the destination strengthens the whole.
          </p>

          <div className="visionV5LivingGrid">
            {waysToLive.map((item) => (
              <article key={item.label}>
                <span>{item.label}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="visionV5Partners" aria-label="Development and group partners">
        <div className="visionV5PartnersIntro">
          <p className="visionV5SectionLabel">DEVELOPMENT &amp; PARTNERSHIP</p>
          <h2>Backed by vision, experience and a wider business ecosystem.</h2>
          <p>
            MALǓA brings together a Zanzibar-focused development perspective with relationships
            that extend across established operating businesses and sectors in Tanzania.
          </p>
        </div>

        <div className="visionV5PartnerGrid">
          <article className="visionV5PartnerCard visionV5OniriaCard">
            <div className="visionV5PartnerLogoFrame visionV5OniriaLogoFrame">
              <Image
                src={oniriaInvestmentsLogo}
                alt="ONIRIA Investments"
                width={751}
                height={262}
                className="visionV5OniriaLogo"
                unoptimized
                priority={false}
              />
            </div>
            <div className="visionV5PartnerCopy">
              <h3>ONIRIA Investments </h3>
              <p>
                ONIRIA creates distinctive Zanzibar destinations around place, culture and the
                way people want to live and experience the island. Its portfolio spans heritage
                hospitality, coastal wellness, landmark residences and complete living environments.
              </p>
              <a
                href="https://oniriainvestments.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="visionV5InlineLink"
              >
                Visit ONIRIA Investments <span aria-hidden="true">↗</span>
              </a>
            </div>
          </article>

          <article className="visionV5PartnerCard visionV5VigorCard">
            <div className="visionV5PartnerLogoFrame visionV5VigorLogoFrame">
              <Image
                src={vigorGroupLogo}
                alt="Vigor — A Turky's Group of Companies"
                width={790}
                height={754}
                className="visionV5VigorLogo"
                unoptimized
                priority={false}
              />
            </div>
            <div className="visionV5PartnerCopy">
              <h3>Vigor / Turky Group of Companies</h3>
              <p>
                Connected to a diversified business ecosystem with experience across healthcare,
                hospitality, manufacturing, energy, real estate, services, insurance and social impact.
              </p>
              <p className="visionV5PartnerNote">
                Rooted in Zanzibar, with experience that extends beyond real estate.
              </p>
              <a
                href="https://turkysgroup.co.tz/"
                target="_blank"
                rel="noopener noreferrer"
                className="visionV5InlineLink"
              >
                Visit Vigor Group <span aria-hidden="true">↗</span>
              </a>
            </div>
          </article>
        </div>
      </section>

      <Footer />
    </main>
  );
}
