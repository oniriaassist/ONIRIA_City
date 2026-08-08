import Header from "../components/Header";
import PublicPageHero from "../components/PublicPageHero";
import Footer from "../components/Footer";

export const metadata = {
  title: "Terms and Conditions",
  description:
    "Read the terms and conditions for using the ONIRIA City website prototype.",
};

export default function TermsPage() {
  return (
    <main>
      <Header />

      <PublicPageHero
        eyebrow="LEGAL INFORMATION"
        title="Terms and Conditions"
        description="These terms describe the general conditions for accessing and using the ONIRIA City website prototype."
        image="/media/oniria/villa-gated-entry.png"
      />

      <section className="legalPageSection" id="page-content">
        <div className="legalPageLayout">
          <aside className="legalPageSidebar">
            <p className="sectionLabel">TERMS OF USE</p>

            <nav aria-label="Terms and conditions sections">
              <a href="#acceptance">Acceptance</a>
              <a href="#prototype">Prototype status</a>
              <a href="#information">Website information</a>
              <a href="#property">Property information</a>
              <a href="#inquiries">Inquiries</a>
              <a href="#acceptable-use">Acceptable use</a>
              <a href="#ownership">Intellectual property</a>
              <a href="#third-parties">Third-party links</a>
              <a href="#liability">Responsibility</a>
              <a href="#changes">Changes</a>
            </nav>
          </aside>

          <article className="legalPageContent">
            <div className="legalNotice">
              <strong>Prototype notice</strong>

              <p>
                These terms are demonstration content for the ONIRIA City
                website prototype. They must be reviewed and approved by the
                project owner and a qualified legal professional before the
                website is used for real property marketing, sales or customer
                transactions.
              </p>
            </div>

            <section id="acceptance">
              <span>01</span>

              <h2>Acceptance of these terms</h2>

              <p>
                By accessing or using the ONIRIA City website, you agree to use
                it according to these terms. Visitors who do not agree with the
                terms should stop using the website.
              </p>
            </section>

            <section id="prototype">
              <span>02</span>

              <h2>Prototype status</h2>

              <p>
                The current website is a project prototype created to
                demonstrate a possible digital experience for ONIRIA City.
                Certain property information, images, layouts, features,
                availability and services may be conceptual or incomplete.
              </p>

              <p>
                The website should not be treated as a final sales platform,
                binding offer, legal agreement or confirmed property catalogue.
              </p>
            </section>

            <section id="information">
              <span>03</span>

              <h2>Website information</h2>

              <p>
                Reasonable effort may be made to keep information clear and
                accurate. However, the website may contain temporary,
                illustrative or incomplete information while the project is
                being developed.
              </p>

              <p>
                The project team may update, correct or remove website content
                without prior notice.
              </p>
            </section>

            <section id="property">
              <span>04</span>

              <h2>Property descriptions and images</h2>

              <p>
                Property descriptions, sizes, layouts, features, illustrations
                and photographs displayed in this prototype are provided for
                presentation purposes.
              </p>

              <p>
                Final specifications, approved plans, prices, payment terms,
                ownership conditions and availability must be confirmed
                directly with the authorised ONIRIA City team before any
                decision is made.
              </p>
            </section>

            <section id="inquiries">
              <span>05</span>

              <h2>Contact and inquiry forms</h2>

              <p>
                Submitting a contact or inquiry form does not reserve a
                property, create a purchase agreement or guarantee
                availability.
              </p>

              <p>
                A generated prototype reference number only confirms that the
                form interaction was completed in the demonstration interface.
                A real inquiry is confirmed only when the final backend and
                authorised sales workflow are connected.
              </p>
            </section>

            <section id="acceptable-use">
              <span>06</span>

              <h2>Acceptable use</h2>

              <p>Visitors must not use the website to:</p>

              <ul>
                <li>Submit false, misleading or unlawful information</li>
                <li>Attempt to access restricted systems or data</li>
                <li>Introduce harmful software or malicious code</li>
                <li>Disrupt the operation or security of the website</li>
                <li>Copy content for unauthorised commercial use</li>
                <li>Impersonate another person or organisation</li>
              </ul>
            </section>

            <section id="ownership">
              <span>07</span>

              <h2>Intellectual property</h2>

              <p>
                The ONIRIA City name, website design, written content, visual
                identity and project materials may be protected by applicable
                intellectual-property rights.
              </p>

              <p>
                Website content should not be copied, reproduced, modified or
                used commercially without permission from the authorised rights
                holder.
              </p>
            </section>

            <section id="third-parties">
              <span>08</span>

              <h2>Third-party services and links</h2>

              <p>
                The website may link to services such as WhatsApp, maps, social
                media platforms or external websites. Those services operate
                under their own terms and privacy policies.
              </p>

              <p>
                ONIRIA City is not responsible for the availability, security
                or content of an external service that it does not control.
              </p>
            </section>

            <section id="liability">
              <span>09</span>

              <h2>Responsibility and decisions</h2>

              <p>
                Visitors should obtain current official project information and
                appropriate professional advice before making property,
                investment, financial or legal decisions.
              </p>

              <p>
                The prototype is provided for demonstration purposes and should
                not be relied upon as the sole basis for a transaction.
              </p>
            </section>

            <section id="changes">
              <span>10</span>

              <h2>Changes to these terms</h2>

              <p>
                These terms may be updated as the website, project and services
                develop. The latest approved version should display its
                effective date on this page.
              </p>

              <a href="/contact#contact-form" className="legalPageButton">
                Contact ONIRIA City
              </a>
            </section>

            <div className="legalLastUpdated">
              Last updated: Prototype version
            </div>
          </article>
        </div>
      </section>

      <Footer />
    </main>
  );
}
