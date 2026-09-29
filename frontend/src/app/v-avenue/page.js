import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata = {
  title: "V Avenue | MALǓA",
  description:
    "Discover apartments, retail, dining and professional opportunities at V Avenue, the social and commercial heart of MALǓA in Fumba, Zanzibar.",
};

const opportunities = [
  {
    title: "V Avenue Two-Bedroom Apartment",
    category: "CONNECTED LIVING",
    description:
      "A contemporary home positioned close to dining, retail, everyday services and the social energy of V Avenue.",
    image: "/media/oniria/v-avenue-apartment.png",
  },
  {
    title: "V Avenue Retail Space",
    category: "RETAIL OPPORTUNITY",
    description:
      "A flexible commercial address designed for visibility and convenient access within MALǓA’s mixed-use centre.",
    image: "/media/oniria/v-avenue-retail-space.png",
  },
  {
    title: "Restaurant and Café Space",
    category: "DINING OPPORTUNITY",
    description:
      "A hospitality setting designed for cafés, restaurants and selected dining concepts within a day-to-evening destination.",
    image: "/media/oniria/v-avenue-dining-space.png",
  },
  {
    title: "Professional Office Space",
    category: "BUSINESS OPPORTUNITY",
    description:
      "A modern workplace for companies and professional service providers within a connected residential and lifestyle community.",
    image: "/media/oniria/v-avenue-office-space.png",
  },
];

const experiences = [
  {
    label: "WALKABLE",
    title: "Everyday needs, closer together.",
    text: "Homes, workspaces, dining and useful services are planned around a compact destination that is easy to move through.",
  },
  {
    label: "MIXED USE",
    title: "Activity throughout the day.",
    text: "Residential, commercial and social uses bring different reasons to visit, work, meet and spend time in V Avenue.",
  },
  {
    label: "FLEXIBLE",
    title: "Space for different ideas.",
    text: "A range of residential and commercial opportunities supports different ways to live, operate and participate in MALǓA.",
  },
];

export default function VAvenuePage() {
  return (
    <main className="vAvenuePremiumPage">
      <Header />

      <section
        className="vAvenuePremiumHero"
        style={{
          backgroundImage: 'url("/media/oniria/v-avenue-commercial.png")',
        }}
      >
        <div className="vAvenuePremiumHeroOverlay" />
        <div className="vAvenuePremiumHeroInner">
          <p className="vAvenuePremiumHeroLabel">V AVENUE</p>
          <h1>
            The social heart
            <em> of MALǓA.</em>
          </h1>
          <p className="vAvenuePremiumHeroCopy">
            Living, dining, retail and business come together in one walkable
            mixed-use destination designed around everyday convenience and
            meaningful connection.
          </p>
          <div className="vAvenuePremiumHeroActions">
            <a href="#v-avenue-opportunities" className="vAvenuePremiumPrimaryAction">
              Explore opportunities <span aria-hidden="true">↓</span>
            </a>
            <a
              href="/register-interest?collection=commercial"
              className="vAvenuePremiumSecondaryAction"
            >
              Register interest <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        <div className="vAvenuePremiumHeroFacts" aria-label="V Avenue destination summary">
          <span>Living</span>
          <span>Dining</span>
          <span>Retail</span>
          <span>Business</span>
        </div>
      </section>

      <section className="vAvenuePremiumIntro" id="discover-v-avenue">
        <div className="vAvenuePremiumIntroCopy">
          <p className="sectionLabel">DISCOVER V AVENUE</p>
          <h2>A destination designed to make everyday life feel connected.</h2>
          <p>
            V Avenue brings homes, shops, cafés, restaurants, offices and
            public spaces into one considered centre. It gives residents and
            visitors practical reasons to return throughout the day while
            creating a visible address for businesses within MALǓA.
          </p>
        </div>

        <div
          className="vAvenuePremiumIntroVisual"
          role="img"
          aria-label="V Avenue mixed-use commercial destination at MALǓA"
          style={{
            backgroundImage: 'url("/media/malua/malua-kitchen-premium.webp")',
          }}
        >
          <div className="vAvenuePremiumIntroCaption">
            <span>DINING · SOCIAL LIFE</span>
            <strong>Designed for everyday gathering.</strong>
          </div>
        </div>
      </section>

      <section className="vAvenuePremiumPurpose" aria-label="V Avenue experience">
        <div className="vAvenuePremiumPurposeHeading">
          <p className="sectionLabel">A PLACE WITH PURPOSE</p>
          <h2>More reasons to be here.</h2>
        </div>

        <div className="vAvenuePremiumPurposeGrid">
          {experiences.map((item) => (
            <article key={item.label}>
              <p>{item.label}</p>
              <h3>{item.title}</h3>
              <span>{item.text}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="vAvenuePremiumOpportunities" id="v-avenue-opportunities">
        <div className="vAvenuePremiumOpportunitiesHeading">
          <div>
            <p className="sectionLabel">EXPLORE V AVENUE</p>
            <h2>Choose how you become part of the destination.</h2>
          </div>
          <p>
            Explore residential, retail, dining and professional opportunities,
            then open the relevant property page for current details and enquiry
            options.
          </p>
        </div>

        <div className="vAvenuePremiumGrid">
          {opportunities.map((item) => (
            <article className="vAvenuePremiumCard" key={item.title}>
              <div className="vAvenuePremiumCardContent">
                <div
                  className="vAvenuePremiumCardImage"
                  style={{ backgroundImage: `url("${item.image}")` }}
                >
                  <div className="vAvenuePremiumCardOverlay" />
                </div>
                <div className="vAvenuePremiumCardBody">
                  <p>{item.category}</p>
                  <h3>{item.title}</h3>
                  <span>{item.description}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="vAvenuePremiumEnquiry" aria-label="V Avenue enquiry">
        <div>
          <p className="sectionLabel">V AVENUE ENQUIRIES</p>
          <h2>Explore the opportunity with our team.</h2>
        </div>
        <p>
          Request current information about residential or commercial
          opportunities, or arrange a private introduction to MALǓA in Fumba.
        </p>
        <div className="vAvenuePremiumEnquiryActions">
          <a href="/register-interest?collection=commercial">
            Register interest <span aria-hidden="true">→</span>
          </a>
          <a href="/arrange-site-visit?collection=commercial">Arrange a site visit</a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
