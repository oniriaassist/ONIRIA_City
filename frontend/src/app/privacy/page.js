import Header from "../components/Header";
import PublicPageHero from "../components/PublicPageHero";
import Footer from "../components/Footer";

export const metadata = {
  title: "Privacy Policy",
  description:
    "Read the ONIRIA City website privacy policy and learn how submitted information may be handled.",
};

export default function PrivacyPage() {
  return (
    <main>
      <Header />

      <PublicPageHero
        eyebrow="LEGAL INFORMATION"
        title="Privacy Policy"
        description="This page explains how information submitted through the ONIRIA City website prototype may be collected, used and protected."
        image="/media/oniria/residence-roundabout.png"
      />

      <section className="legalPageSection" id="page-content">
        <div className="legalPageLayout">
          <aside className="legalPageSidebar">
            <p className="sectionLabel">PRIVACY POLICY</p>

            <nav aria-label="Privacy policy sections">
              <a href="#introduction">Introduction</a>
              <a href="#information">Information collected</a>
              <a href="#usage">How information is used</a>
              <a href="#sharing">Information sharing</a>
              <a href="#security">Data security</a>
              <a href="#retention">Data retention</a>
              <a href="#rights">Your choices</a>
              <a href="#cookies">Cookies</a>
              <a href="#contact">Contact</a>
            </nav>
          </aside>

          <article className="legalPageContent">
            <div className="legalNotice">
              <strong>Prototype notice</strong>

              <p>
                This privacy policy is demonstration content for the ONIRIA City
                website prototype. It should be reviewed and approved by the
                project owner and a qualified legal professional before the
                website is published for real customers.
              </p>
            </div>

            <section id="introduction">
              <span>01</span>

              <h2>Introduction</h2>

              <p>
                ONIRIA City respects the privacy of visitors who use this
                website. This policy describes the types of information that
                may be submitted through the website and the general purposes
                for which that information may be used.
              </p>

              <p>
                By using the website or submitting a contact or inquiry form,
                you acknowledge that your information may be handled according
                to this policy.
              </p>
            </section>

            <section id="information">
              <span>02</span>

              <h2>Information we may collect</h2>

              <p>
                Information may be collected when you complete a contact form,
                property inquiry, consultation request, site-visit request or
                newsletter form.
              </p>

              <ul>
                <li>Your full name</li>
                <li>Email address</li>
                <li>Telephone or WhatsApp number</li>
                <li>Country or general location</li>
                <li>Property or commercial interests</li>
                <li>Preferred contact method</li>
                <li>Preferred visit or consultation date</li>
                <li>Messages and questions submitted by you</li>
              </ul>
            </section>

            <section id="usage">
              <span>03</span>

              <h2>How information may be used</h2>

              <p>
                Information submitted through the website may be used to
                respond to requests, provide property information and improve
                communication with interested clients.
              </p>

              <ul>
                <li>Respond to contact and property inquiries</li>
                <li>Arrange consultations or site visits</li>
                <li>Provide requested project information</li>
                <li>Understand client interests and requirements</li>
                <li>Improve website services and user experience</li>
                <li>Send updates when the visitor has agreed to receive them</li>
              </ul>
            </section>

            <section id="sharing">
              <span>04</span>

              <h2>Information sharing</h2>

              <p>
                Personal information should not be sold. Information may be
                shared only with authorised ONIRIA City team members or service
                providers who need it to respond to the visitor&apos;s request
                or operate the website.
              </p>

              <p>
                Information may also be disclosed when required by applicable
                law, regulation or a valid legal request.
              </p>
            </section>

            <section id="security">
              <span>05</span>

              <h2>Data security</h2>

              <p>
                Reasonable technical and organisational measures should be used
                to protect submitted information against unauthorised access,
                loss, misuse or alteration.
              </p>

              <p>
                No internet transmission or storage system can be guaranteed to
                be completely secure. Visitors should avoid submitting highly
                sensitive information through general contact forms.
              </p>
            </section>

            <section id="retention">
              <span>06</span>

              <h2>Data retention</h2>

              <p>
                Information should be kept only for as long as it is reasonably
                needed to respond to an inquiry, maintain business records,
                provide requested services or meet legal obligations.
              </p>

              <p>
                Records that are no longer required should be securely deleted
                or anonymised according to the project&apos;s approved data
                management procedures.
              </p>
            </section>

            <section id="rights">
              <span>07</span>

              <h2>Your choices</h2>

              <p>
                Visitors may contact the ONIRIA City team to ask about personal
                information they previously submitted. Depending on applicable
                requirements, they may also request correction, updating or
                deletion of that information.
              </p>

              <p>
                Visitors may unsubscribe from marketing communications using
                the unsubscribe method included in the communication or by
                contacting the project team.
              </p>
            </section>

            <section id="cookies">
              <span>08</span>

              <h2>Cookies and website analytics</h2>

              <p>
                The final website may use essential cookies or similar
                technologies to operate correctly, remember preferences,
                understand website performance and improve user experience.
              </p>

              <p>
                Details about any analytics, advertising or third-party cookies
                should be added here when those services are officially
                selected and configured.
              </p>
            </section>

            <section id="contact">
              <span>09</span>

              <h2>Contact about privacy</h2>

              <p>
                Questions or requests relating to privacy may be submitted
                through the ONIRIA City contact page.
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
