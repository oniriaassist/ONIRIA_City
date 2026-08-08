import Header from "../components/Header";
import PublicPageHero from "../components/PublicPageHero";
import FinalSalesCTA from "../components/FinalSalesCTA";
import Footer from "../components/Footer";

export const metadata = {
  title: "Gallery",
  description:
    "Explore the architecture, interiors and Zanzibar lifestyle of ONIRIA City.",
};

const galleryImages = [
  {
    title: "ONIRIA City",
    category: "THE DESTINATION",
    image:
      "/media/oniria/villa-pool-rear.png",
    size: "large",
  },
  {
    title: "Private Villas",
    category: "ARCHITECTURE",
    image:
      "/media/oniria/villa-front-entry.png",
    size: "normal",
  },
  {
    title: "Refined Living Spaces",
    category: "INTERIORS",
    image:
      "/media/oniria/villa-gated-entry.png",
    size: "normal",
  },
  {
    title: "Private Comfort",
    category: "BEDROOMS",
    image:
      "/media/oniria/residence-parking-garden.png",
    size: "normal",
  },
  {
    title: "The Indian Ocean",
    category: "ZANZIBAR",
    image:
      "/media/oniria/residence-roundabout.png",
    size: "large",
  },
  {
    title: "Evenings in Zanzibar",
    category: "SUNSET",
    image:
      "/media/oniria/residence-aerial-masterplan.png",
    size: "normal",
  },
  {
    title: "A New Morning",
    category: "SUNRISE",
    image:
      "/media/oniria/v-avenue-commercial.png",
    size: "normal",
  },
  {
    title: "Tropical Landscapes",
    category: "NATURE",
    image:
      "/media/oniria/villa-pool-rear.png",
    size: "normal",
  },
];

export default function GalleryPage() {
  return (
    <main>
      <Header />

      <PublicPageHero
        eyebrow="ONIRIA GALLERY"
        title="See the Vision Come to Life"
        description="Explore the architecture, interiors, landscape and island lifestyle that shape ONIRIA City."
        image="/media/oniria/villa-front-entry.png"
      />

      <section className="galleryIntroduction" id="page-content">
        <p className="sectionLabel">DISCOVER ONIRIA</p>

        <h2>A visual journey through the destination</h2>

        <p>
          These ONIRIA renders present the architectural, residential,
          commercial and landscape direction for the destination.
        </p>
      </section>

      <section className="galleryGrid">
        {galleryImages.map((item) => (
          <article
            className={`galleryItem ${
              item.size === "large" ? "galleryItemLarge" : ""
            }`}
            key={item.title}
          >
            <div
              className="galleryItemImage"
              style={{ backgroundImage: `url("${item.image}")` }}
            >
              <div className="galleryItemOverlay" />

              <div className="galleryItemContent">
                <p>{item.category}</p>
                <h3>{item.title}</h3>
              </div>
            </div>
          </article>
        ))}
      </section>

      <FinalSalesCTA />
      <Footer />
    </main>
  );
}
