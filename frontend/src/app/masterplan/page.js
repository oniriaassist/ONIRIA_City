import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata = {
  title: "Masterplan | MALǓA",
  description:
    "Explore the connected MALǓA masterplan in Fumba, Zanzibar — villas, residences, V Avenue and landscaped community spaces planned as one destination.",
};

const masterplanZones = [
  {
    eyebrow: "PRIVATE LIVING",
    title: "Villas",
    statement: "Private neighbourhoods with room to breathe.",
    description:
      "Generous homes, private gardens and calm landscaped surroundings create a more secluded way to live while remaining connected to the wider MALǓA destination.",
    image: "/media/oniria/villa-pool-rear.png",
    href: "/villas#available-collection",
    linkLabel: "Explore villas",
    className: "maluaMasterplanZoneVillas",
  },
  {
    eyebrow: "CONNECTED LIVING",
    title: "Residences",
    statement: "Contemporary homes close to everyday life.",
    description:
      "Thoughtfully planned residences bring natural light, efficient layouts and convenient access to landscape, lifestyle spaces and the services of the community.",
    image: "/media/oniria/residence-parking-garden.png",
    href: "/residences#residence-collection",
    linkLabel: "Explore residences",
    className: "maluaMasterplanZoneResidences",
  },
  {
    eyebrow: "LIFESTYLE & COMMERCE",
    title: "V Avenue",
    statement: "The social and commercial heart of MALǓA.",
    description:
      "Dining, retail, services and commercial opportunities come together in an active mixed-use destination designed to make everyday convenience part of the neighbourhood.",
    image: "/media/oniria/v-avenue-commercial.png",
    href: "/v-avenue#v-avenue-opportunities",
    linkLabel: "Explore V Avenue",
    className: "maluaMasterplanZoneAvenue",
  },
  {
    eyebrow: "LANDSCAPE & WELLBEING",
    title: "Green & social spaces",
    statement: "Landscape that connects the whole destination.",
    description:
      "Green routes, shaded outdoor spaces and places to pause, move and meet create a softer rhythm between home, community and the wider island lifestyle.",
    image: "/media/oniria/residence-roundabout.png",
    href: "/lifestyle",
    linkLabel: "Explore the lifestyle",
    className: "maluaMasterplanZoneLandscape",
  },
];

export default function MasterplanPage() {
  return (
    <main className="maluaMasterplanPage">
      <Header />

      <section
        className="maluaMasterplanHero"
        style={{
          backgroundImage:
            'url("/media/oniria/residence-aerial-masterplan.png")',
        }}
      >
        <div className="maluaMasterplanHeroOverlay" />

        <div className="maluaMasterplanHeroInner">
          <h1>
            One connected
            <em> vision.</em>
          </h1>
          <p className="maluaMasterplanHeroCopy">
            Homes, landscape, lifestyle and everyday convenience planned as one
            complete destination.
          </p>

        </div>

        <div className="maluaMasterplanHeroFacts" aria-label="MALǓA masterplan summary">
          <div>
            <small>Living</small>
            <strong>Villas · Residences</strong>
          </div>
          <div>
            <small>Lifestyle</small>
            <strong>Landscape · Wellbeing</strong>
          </div>
          <div>
            <small>Commerce</small>
            <strong>V Avenue</strong>
          </div>
          <div>
            <small>Location</small>
            <strong>Fumba, Zanzibar</strong>
          </div>
        </div>
      </section>

      <section className="maluaMasterplanIntro" id="page-content">
        <div className="maluaMasterplanIntroHeading">
          <p className="sectionLabel">THE BIG PICTURE</p>
          <h2>Everything connected by one clear vision.</h2>
        </div>

        <div className="maluaMasterplanIntroCopy">
          <p>
            MALǓA is planned as one connected place rather than a collection of
            separate buildings. Private homes, contemporary residences,
            landscaped spaces, lifestyle destinations and everyday services are
            brought together so daily life feels convenient, calm and naturally
            connected.
          </p>
          <p>
            The result is a destination where the journey between home, nature,
            community and commerce is part of the experience itself.
          </p>
        </div>
      </section>

      <section className="maluaMasterplanZones">
        <div className="maluaMasterplanZonesHeading">
          <div>
            <p className="sectionLabel">THE DESTINATION</p>
            <h2>Four parts of one connected way of living.</h2>
          </div>
          <p>
            Each area has its own character, while landscape, movement and
            everyday convenience tie the wider MALǓA experience together.
          </p>
        </div>

        <div className="maluaMasterplanZoneGrid">
          {masterplanZones.map((zone) => (
            <article
              className={`maluaMasterplanZoneCard ${zone.className}`}
              key={zone.title}
            >
              <Link
                href={zone.href}
                className="maluaMasterplanZoneImageLink"
                aria-label={`${zone.linkLabel}: ${zone.title}`}
              >
                <div
                  className="maluaMasterplanZoneImage"
                  style={{ backgroundImage: `url("${zone.image}")` }}
                >
                  <div className="maluaMasterplanZoneImageOverlay" />
                  <span className="maluaMasterplanZoneExplore">
                    {zone.linkLabel} <span aria-hidden="true">→</span>
                  </span>
                </div>
              </Link>

              <div className="maluaMasterplanZoneContent">
                <p>{zone.eyebrow}</p>
                <h3>{zone.title}</h3>
                <strong>{zone.statement}</strong>
                <span>{zone.description}</span>
                <Link href={zone.href}>
                  {zone.linkLabel} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="maluaMasterplanConnection">
        <div
          className="maluaMasterplanConnectionImage"
          role="img"
          aria-label="Landscaped entrance and tropical community setting at MALǓA"
          style={{
            backgroundImage: 'url("/media/oniria/villa-gated-entry.png")',
          }}
        />

        <div className="maluaMasterplanConnectionCopy">
          <p className="sectionLabel">PLANNED AS ONE PLACE</p>
          <h2>Connected by landscape, convenience and a sense of arrival.</h2>
          <p>
            The masterplan brings different ways of living into one coherent
            destination, with green connections and shared places helping the
            community feel welcoming from the moment you arrive.
          </p>
          <Link href="/vision" className="maluaMasterplanTextLink">
            Discover the MALǓA vision <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
