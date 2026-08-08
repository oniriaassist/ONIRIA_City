import Header from "../components/Header";
import PublicPageHero from "../components/PublicPageHero";
import Footer from "../components/Footer";

export const metadata = {
  title: "Sitemap | ONIRIA City",
};

const groups = [
  {
    title: "Discover",
    links: [["Vision", "/vision#page-content"], ["Architecture", "/architecture#page-content"], ["Amenities", "/amenities#page-content"], ["Lifestyle", "/lifestyle#editorial-sections"], ["Masterplan", "/masterplan#page-content"], ["Gallery", "/gallery"], ["Journal", "/journal"]],
  },
  {
    title: "Properties",
    links: [["All Properties", "/properties#available-collection"], ["Villas", "/villas#available-collection"], ["Residences", "/residences#available-collection"], ["Signature Villa", "/villas/signature-villa"], ["V Avenue", "/v-avenue#v-avenue-opportunities"], ["Commercial", "/commercial#available-collection"]],
  },
  {
    title: "Sales",
    links: [["Register Interest", "/register-interest"], ["Request Brochure", "/request-brochure"], ["Book Consultation", "/contact#contact-form"], ["Arrange Site Visit", "/arrange-site-visit"], ["Contact", "/contact#contact-form"]],
  },
  {
    title: "Resources",
    links: [["Investment", "/investment#page-content"], ["FAQs", "/faqs"], ["Properties in Fumba", "/properties#available-collection"], ["V Avenue Commercial Spaces", "/commercial#available-collection"]],
  },
  {
    title: "Legal",
    links: [["Privacy Policy", "/privacy"], ["Terms and Conditions", "/terms"], ["Cookie Policy", "/cookie-policy"], ["Accessibility", "/accessibility"]],
  },
];

export default function SitemapPage() {
  return (
    <main>
      <Header />
      <PublicPageHero
        eyebrow="SITE MAP"
        title="Find Your Way Around ONIRIA City"
        description="Explore public pages, property collections, resources and legal information."
        image="/media/oniria/residence-aerial-masterplan.png"
      />
      <section className="sitemapSection" id="page-content">
        {groups.map((group) => (
          <article key={group.title}>
            <h2>{group.title}</h2>
            <ul>
              {group.links.map(([label, href]) => (
                <li key={href}><a href={href}>{label}</a></li>
              ))}
            </ul>
          </article>
        ))}
      </section>
      <Footer />
    </main>
  );
}
