import Link from "next/link";
import Header from "../components/Header";
import PublicPageHero from "../components/PublicPageHero";
import Footer from "../components/Footer";

export const metadata = {
  title: "Lifestyle | MALǓA",
  description:
    "Discover a MALǓA lifestyle shaped by nature, wellbeing, community and the rhythm of Zanzibar.",
};

const lifestyleExperiences = [
  {
    eyebrow: "NATURE",
    title: "Live closer to the landscape.",
    description:
      "Tropical planting, shaded paths and open-air spaces bring greenery into the everyday, creating a calmer setting for morning walks, quiet pauses and time outdoors.",
    image: "/media/oniria/villa-gated-entry.png",
    className: "maluaLifestyleExperienceNature",
  },
  {
    eyebrow: "WELLNESS",
    title: "Wellbeing, built into the everyday.",
    description:
      "Movement, swimming and places to slow down are woven naturally into the destination, making it easier to create a daily rhythm that feels active, restorative and unhurried.",
    image: "/media/malua/villa-pool.webp",
    className: "maluaLifestyleExperienceWellness",
  },
  {
    eyebrow: "DINING & SOCIAL LIFE",
    title: "Places made for connection.",
    description:
      "Dining, cafés, welcoming public spaces and the energy of V Avenue create opportunities to meet, linger and enjoy the social side of island living without leaving the community behind.",
    image: "/media/oniria/v-avenue-commercial.png",
    className: "maluaLifestyleExperienceSocial",
  },
  {
    eyebrow: "OCEAN",
    title: "The island is always part of the picture.",
    description:
      "Zanzibar’s coastline, warm light and easy relationship with the sea shape the wider MALǓA experience, giving everyday life a sense of openness that feels distinctly of the island.",
    image: "/media/malua/shoreline.webp",
    className: "maluaLifestyleExperienceOcean",
  },
];

export default function LifestylePage() {
  return (
    <main className="maluaLifestylePage">
      <Header />

      <PublicPageHero
        title={["LIFE COMES", "TOGETHER"]}
        description="A considered island lifestyle where nature, wellbeing, dining and community come together around home."
        image="/media/malua/malua-living-premium.webp"
      />

      <section className="maluaLifestyleIntro" id="page-content">
        <div className="maluaLifestyleIntroHeading">
          <p className="sectionLabel">LIVE DIFFERENTLY</p>
          <h2>A fuller way to live, shaped by Zanzibar.</h2>
        </div>

        <div className="maluaLifestyleIntroCopy">
          <p>
            At MALǓA, daily life extends beyond the front door. Homes, tropical
            landscape, wellbeing, dining and social spaces are brought together
            so the destination feels effortless to live in and distinctly Zanzibar.
          </p>

          <div className="maluaLifestyleIntroActions">
            <Link href="/residences" className="maluaLifestylePrimaryLink">
              Explore residences <span aria-hidden="true">→</span>
            </Link>
            <Link href="/arrange-site-visit" className="maluaLifestyleTextLink">
              Arrange a private visit <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="maluaLifestyleExperiences" aria-label="MALǓA lifestyle experiences">
        <div className="maluaLifestyleExperiencesIntro">
          <p className="sectionLabel">EVERYDAY EXPERIENCES</p>
          <h2>The everyday, considered as carefully as the home.</h2>
          <p>
            From quiet mornings among tropical greenery to movement, dining,
            conversation and time near the sea, MALǓA is designed around the
            experiences that make a place rewarding to return to every day.
          </p>
        </div>

        <div className="maluaLifestyleExperienceGrid">
          {lifestyleExperiences.map((experience) => (
            <article
              className={`maluaLifestyleExperienceCard ${experience.className}`}
              key={experience.title}
            >
              <div
                className="maluaLifestyleExperienceImage"
                style={{ backgroundImage: `url("${experience.image}")` }}
                role="img"
                aria-label={experience.title}
              />
              <div className="maluaLifestyleExperienceCopy">
                <p>{experience.eyebrow}</p>
                <h3>{experience.title}</h3>
                <span>{experience.description}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="maluaLifestyleRhythm">
        <div
          className="maluaLifestyleRhythmImage maluaLifestyleRhythmImagePrimary"
          role="img"
          aria-label="MALǓA tropical residential setting"
        />

        <div className="maluaLifestyleRhythmCopy">
          <p className="sectionLabel">THE RHYTHM OF THE ISLAND</p>
          <h2>From first light to slow evenings.</h2>
          <p>
            Mornings begin with light, greenery and open air. Afternoons stay close
            to home, water and the spaces that support everyday ease. Evenings move
            naturally toward dining, conversation and the slower pace of the island.
          </p>
          <p>
            This is the value of a complete destination: the moments between home,
            leisure and community feel connected rather than added on.
          </p>
          <Link href="/vision" className="maluaLifestyleTextLink">
            Discover the MALǓA vision <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div
          className="maluaLifestyleRhythmImage maluaLifestyleRhythmImageSecondary"
          role="img"
          aria-label="Zanzibar shoreline"
        />
      </section>

      <Footer />
    </main>
  );
}
