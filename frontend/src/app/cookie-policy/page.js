import Header from "../components/Header";
import PublicPageHero from "../components/PublicPageHero";
import Footer from "../components/Footer";

export const metadata = {
  title: "Cookie Policy | Roho",
};

export default function CookiePolicyPage() {
  return (
    <main>
      <Header />
      <PublicPageHero
        eyebrow="COOKIE POLICY"
        title="How Roho Uses Cookies"
        description="A clear summary of the cookies and similar browser storage used by this website."
        image="/media/oniria/villa-front-entry.png"
      />
      <section className="legalContentSection" id="page-content">
        <h2>Necessary website storage</h2>
        <p>Roho may use necessary browser storage for anonymous session identifiers, enquiry form continuity and basic website operation.</p>
        <h2>Campaign attribution</h2>
        <p>When visitors arrive through approved campaigns, the website may preserve source-page and UTM information so enquiries and newsletter subscriptions can be understood by the ROHO team.</p>
        <h2>Staff authentication cookies</h2>
        <p>Authorised staff use a secure HTTP-only session cookie for the private admin dashboard. Public visitors do not need staff cookies or customer accounts.</p>
        <h2>Analytics cookies</h2>
        <p>Analytics or third-party tracking should only be enabled when approved and configured. This page should be updated if additional tracking services are introduced.</p>
        <h2>Your choices</h2>
        <p>You can control cookies through your browser settings. Some necessary features may not work correctly if browser storage is disabled.</p>
      </section>
      <Footer />
    </main>
  );
}
