import { notFound } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import PropertyDetailPage from "../../components/PropertyDetailPage";
import { getPropertyDetails } from "../../data/properties";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const property = getPropertyDetails("commercial", slug);

  if (!property) {
    return {
      title: "Commercial Property Not Found | MALǓA",
    };
  }

  return {
    title: `${property.title} | MALǓA`,
    description: property.description,
  };
}

function RetailSpacePage({ property }) {
  const propertyName = encodeURIComponent(property.title);
  const inquiryHref = `/register-interest?collection=commercial&property=${propertyName}`;
  const visitHref = `/arrange-site-visit?collection=commercial&property=${propertyName}`;
  const brochureHref = `/request-brochure?collection=commercial&property=${propertyName}`;

  return (
    <main className="retailSpacePage">
      <Header />

      <section
        className="retailSpaceHero"
        style={{ backgroundImage: `url("${property.heroImage}")` }}
      >
        <div className="retailSpaceHeroOverlay" />
        <div className="retailSpaceHeroInner">
          <div className="retailSpaceHeroCopy">
            <p className="retailSpaceEyebrow">V AVENUE · COMMERCIAL OPPORTUNITY</p>
            <h1>V Avenue Retail Space</h1>
            <p className="retailSpaceHeroLead">
              Positioned for visibility. Planned for everyday demand.
            </p>
            <p className="retailSpaceHeroDescription">
              A flexible retail opportunity within MALǓA&apos;s commercial and lifestyle
              heart, connecting businesses with residents, visitors and the wider Fumba
              community.
            </p>

            <div className="retailSpaceHeroActions">
              <a href={inquiryHref} className="retailSpacePrimaryAction">
                Request availability <span aria-hidden="true">→</span>
              </a>
              <a href={visitHref} className="retailSpaceSecondaryAction">
                Arrange a private visit
              </a>
            </div>
          </div>

          <div className="retailSpaceHeroFacts" aria-label="Retail opportunity facts">
            {property.facts.map((fact) => (
              <div key={fact.label}>
                <span>{fact.label}</span>
                <strong>{fact.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="retailSpaceIntro" id="property-overview">
        <div className="retailSpaceIntroCopy">
          <p className="sectionLabel">RETAIL OPPORTUNITY</p>
          <h2>A commercial address at the heart of daily life.</h2>
          <p>
            V Avenue is planned as MALǓA&apos;s social and commercial centre: a place where
            homes, dining, services and everyday experiences meet. The retail space is
            designed for selected businesses seeking a visible position within that
            growing destination.
          </p>
        </div>

        <div
          className="retailSpaceIntroImage"
          style={{ backgroundImage: 'url("/media/oniria/residence-roundabout.png")' }}
          role="img"
          aria-label="MALǓA community setting and arrival"
        >
          <div className="retailSpaceImageShade" />
          <div className="retailSpaceImageCaption">
            <span>V AVENUE</span>
            <strong>Commerce connected to community.</strong>
          </div>
        </div>
      </section>

      <section className="retailSpaceAdvantages">
        <div className="retailSpaceSectionHeading">
          <p className="sectionLabel">WHY V AVENUE</p>
          <h2>Designed around the conditions that support everyday trade.</h2>
          <p>
            The opportunity combines a growing residential audience, a central mixed-use
            setting and a flexible commercial format without over-prescribing how the
            space must be used.
          </p>
        </div>

        <div className="retailSpaceAdvantageGrid">
          <article>
            <span>RESIDENT DEMAND</span>
            <h3>A community on the doorstep.</h3>
            <p>
              Position your business close to residents, visitors and the wider Fumba
              community as MALǓA develops.
            </p>
          </article>
          <article>
            <span>VISIBLE LOCATION</span>
            <h3>Part of the destination&apos;s social heart.</h3>
            <p>
              V Avenue is planned as a natural meeting point for services, dining,
              commerce and everyday activity.
            </p>
          </article>
          <article>
            <span>FLEXIBLE FORMAT</span>
            <h3>Space that can respond to your concept.</h3>
            <p>
              Final configuration can support selected retail and service concepts,
              subject to unit selection and approved commercial arrangements.
            </p>
          </article>
          <article>
            <span>MIXED-USE CONTEXT</span>
            <h3>More reasons for people to stay.</h3>
            <p>
              Nearby homes, landscaped public areas and lifestyle uses help create a
              destination with regular reasons to visit and return.
            </p>
          </article>
        </div>
      </section>

      <section className="retailSpaceContext">
        <div
          className="retailSpaceContextImage"
          style={{ backgroundImage: 'url("/media/oniria/residence-aerial-masterplan.png")' }}
          role="img"
          aria-label="MALǓA masterplan and wider destination context"
        />

        <div className="retailSpaceContextCopy">
          <p className="sectionLabel">BUILT INTO MALǓA</p>
          <h2>Retail that benefits from the wider destination.</h2>
          <p>
            The opportunity is not planned as an isolated shopfront. It sits within a
            residential and lifestyle destination where movement between homes,
            landscape, social spaces and V Avenue is designed to feel natural.
          </p>

          <div className="retailSpaceContextFacts">
            <div>
              <span>SETTING</span>
              <strong>Mixed-use V Avenue</strong>
            </div>
            <div>
              <span>AUDIENCE</span>
              <strong>Residents · Visitors · Fumba</strong>
            </div>
            <div>
              <span>FORMAT</span>
              <strong>Flexible retail opportunity</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="retailSpacePlan">
        <div className="retailSpacePlanHeading">
          <p className="sectionLabel">SPACE &amp; USE</p>
          <h2>Flexible by design.</h2>
          <p>
            Final layouts depend on the selected unit and approved commercial
            arrangements, allowing the conversation to start with the requirements of
            the business rather than a fixed one-size-fits-all plan.
          </p>
        </div>

        <div className="retailSpaceUseGrid" aria-label="Potential retail space components">
          {[
            "Customer area",
            "Retail display",
            "Storage provision",
            "Service access",
            "Visible shopfront",
            "V Avenue connection",
          ].map((item) => (
            <div key={item}>{item}</div>
          ))}
        </div>

        <a href={brochureHref} className="retailSpaceDetailsLink">
          Request full details <span aria-hidden="true">→</span>
        </a>
      </section>

      <section className="retailSpaceVisualPair" aria-label="V Avenue commercial context">
        <article
          style={{ backgroundImage: 'url("/media/oniria/v-avenue-commercial.png")' }}
        >
          <div className="retailSpaceImageShade" />
          <div>
            <span>COMMERCIAL FRONTAGE</span>
            <h3>A visible place within the destination.</h3>
          </div>
        </article>
        <article
          style={{ backgroundImage: 'url("/media/oniria/residence-parking-garden.png")' }}
        >
          <div className="retailSpaceImageShade" />
          <div>
            <span>COMMUNITY CONTEXT</span>
            <h3>Connected to the people who live around it.</h3>
          </div>
        </article>
      </section>

      <section className="retailSpaceInquiry">
        <div>
          <p className="sectionLabel">COMMERCIAL ENQUIRIES</p>
          <h2>Bring your concept to V Avenue.</h2>
          <p>
            Request current availability, discuss your commercial requirements or arrange
            a private introduction to the opportunity with the MALǓA property team.
          </p>
        </div>
        <div className="retailSpaceInquiryActions">
          <a href={inquiryHref} className="retailSpacePrimaryAction retailSpacePrimaryActionDark">
            Register interest <span aria-hidden="true">→</span>
          </a>
          <a href={visitHref} className="retailSpaceInquiryVisit">
            Arrange site visit
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default async function CommercialDetailPage({ params }) {
  const { slug } = await params;
  const property = getPropertyDetails("commercial", slug);

  if (!property) {
    notFound();
  }

  if (slug === "retail-space") {
    return <RetailSpacePage property={property} />;
  }

  return <PropertyDetailPage property={property} collectionSlug="commercial" />;
}
