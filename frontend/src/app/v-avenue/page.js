import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata = {
  title: "V Avenue",
  description:
    "Discover apartments, retail, dining and professional opportunities at V Avenue, the social and commercial heart of ONIRIA City.",
};

const opportunities = [
  {
    number: "01",
    title: "V Avenue Two-Bedroom Apartment",
    category: "Mixed-use apartment",
    description:
      "A contemporary home close to dining, retail, everyday services and the energy of community life.",
    image: "/media/oniria/residence-parking-garden.png",
    href: "/v-avenue/apartment",
  },
  {
    number: "02",
    title: "V Avenue Retail Space",
    category: "Commercial opportunity",
    description:
      "A flexible and visible retail address created for businesses serving a growing residential destination.",
    image: "/media/oniria/residence-roundabout.png",
    href: "/commercial/retail-space",
  },
  {
    number: "03",
    title: "Restaurant and Café Space",
    category: "Dining opportunity",
    description:
      "A welcoming hospitality setting for cafés, restaurants and selected dining concepts with strong footfall potential.",
    image: "/media/oniria/residence-aerial-masterplan.png",
    href: "/commercial/restaurant-space",
  },
  {
    number: "04",
    title: "Professional Office Space",
    category: "Office opportunity",
    description:
      "A modern business address for companies and professional service providers within a connected community.",
    image: "/media/oniria/v-avenue-commercial.png",
    href: "/commercial/office-space",
  },
];

export default function VAvenuePage() {
  return (
    <main className="vAvenuePage">
      <Header />

      <section
        className="vAvenueHero"
        style={{
          backgroundImage: 'url("/media/oniria/v-avenue-commercial.png")',
        }}
      >
        <div className="vAvenueHeroOverlay" />
        <div className="vAvenueHeroContent">
          <h1 className="hero-title"><span>THE HEART</span><span>OF ONIRIA</span></h1>
          <p className="vAvenueHeroMeta hero-subtitle">
            Living, dining, retail and business—brought together.
          </p>
          <a href="#discover-v-avenue" className="vAvenueScrollLink hero-cta">
            Explore <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>

      <section id="discover-v-avenue" className="vAvenueIntroduction">
        <p className="vAvenueSectionLabel">DISCOVER V AVENUE</p>
        <h2>A vibrant destination for living, working and gathering</h2>
        <p className="vAvenueLead">
          V Avenue is a walkable mixed-use centre where residents, visitors and
          businesses meet. Homes, shops, cafés, restaurants, offices and public
          spaces come together in one active destination designed for everyday
          convenience and meaningful connection.
        </p>
      </section>

      <section className="vAvenueExperience" id="v-avenue-experience" aria-label="V Avenue experience">
        <div className="vAvenueExperienceImage" />
        <div className="vAvenueExperienceContent">
          <p className="vAvenueSectionLabel">A PLACE WITH PURPOSE</p>
          <h2>Designed around everyday life</h2>
          <p>
            From a morning coffee and convenient services to evening dining and
            professional workspaces, V Avenue brings daily needs and social
            experiences closer together.
          </p>
          <div className="vAvenueExperiencePoints">
            <span>Walkable connections</span>
            <span>Flexible commercial spaces</span>
            <span>Active day-to-evening environment</span>
          </div>
        </div>
      </section>

      <section className="vAvenueOpportunities" id="v-avenue-opportunities">
        <div className="vAvenueOpportunitiesHeading">
          <p className="vAvenueSectionLabel">EXPLORE THE COLLECTION</p>
          <h2>Opportunities within V Avenue</h2>
        </div>

        <div className="vAvenueGrid">
          {opportunities.map((item) => (
            <article className="vAvenueCard" key={item.href}>
              <a href={item.href} aria-label={`Explore ${item.title}`}>
                <div
                  className="vAvenueCardImage"
                  style={{ backgroundImage: `url("${item.image}")` }}
                >
                  <span className="vAvenueCardNumber">{item.number}</span>
                </div>
                <div className="vAvenueCardBody">
                  <p className="vAvenueCardCategory">{item.category}</p>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <span className="vAvenueCardLink">Explore opportunity →</span>
                </div>
              </a>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
