import Header from "../components/Header";
import PublicPageHero from "../components/PublicPageHero";
import Footer from "../components/Footer";

export const metadata = {
  title: "Accessibility | Roho",
};

export default function AccessibilityPage() {
  return (
    <main>
      <Header />
      <PublicPageHero
        eyebrow="ACCESSIBILITY"
        title="Accessible Browsing at Roho"
        description="Our public website is designed to be clear, navigable and usable across modern devices."
        image="/media/oniria/residence-roundabout.png"
      />
      <section className="legalContentSection" id="page-content">
        <h2>Our approach</h2>
        <p>Roho aims to provide readable content, clear navigation, accessible forms and responsive layouts for visitors using different devices and input methods.</p>
        <h2>Keyboard navigation</h2>
        <p>Navigation links, form fields, buttons and footer accordions are built with standard interactive elements so they can be reached and activated by keyboard.</p>
        <h2>Readable design</h2>
        <p>The website uses structured headings, visible labels, contrast-conscious colour choices and responsive spacing to support comfortable reading.</p>
        <h2>Contact for accessibility issues</h2>
        <p>If you experience difficulty using the website, contact the ROHO team through the contact page and include the page, device and issue you encountered.</p>
      </section>
      <Footer />
    </main>
  );
}
