"use client";

import { useState } from "react";
import { isValidPhoneNumber } from "react-phone-number-input";
import Header from "../components/Header";
import BrandLogo from "../components/BrandLogo";
import InternationalPhoneInput from "../components/InternationalPhoneInput";
import Footer from "../components/Footer";
import { buildWhatsAppLink, contactDetails } from "../data/contactDetails";
import {
  getAnonymousSessionId,
  getCampaignAttribution,
  formatSubmissionSuccess,
  submitEnquiry,
} from "../services/api";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState({
    type: "",
    message: "",
  });
  const [phoneError, setPhoneError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setPhoneError("");

    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
      setStatus({
        type: "error",
        message: "Please complete your name, email and message.",
      });

      return;
    }

    if (formData.phone && !isValidPhoneNumber(formData.phone)) {
      setPhoneError("Please enter a valid phone number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const isCommercial = formData.subject === "commercial";
      const result = await submitEnquiry(
        {
          enquiry_type: isCommercial ? "commercial" : "general",
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone || null,
          message: formData.message,
          anonymous_session_id: getAnonymousSessionId(),
          consent: true,
          campaign: getCampaignAttribution(),
        },
        isCommercial ? "/commercial-enquiries" : "/enquiries"
      );

      setStatus({
        type: "success",
        message: formatSubmissionSuccess(
          result,
          "Thank you. Your message has been received."
        ),
      });

      setFormData({
        fullName: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="contactPage maluaContactPage">
      <Header />

      <section
        className="maluaContactExperience"
        id="page-content"
        style={{
          backgroundImage: 'url("/media/malua/interior-staircase.webp")',
        }}
      >
        <div className="maluaContactOverlay" />

        <div className="maluaContactExperienceInner">
          <div className="maluaContactSplit">
            <div className="maluaContactStory">
              <p className="maluaContactEyebrow">PRIVATE SALES ENQUIRIES</p>

              <h1
                className="maluaContactStoryTitle"
                aria-label="BEGIN YOUR MALǓA STORY"
              >
                <span>BEGIN YOUR</span>
                <span className="maluaContactStoryBrandLine" aria-hidden="true">
                  <BrandLogo className="maluaContactStoryBrand" />
                  <em>STORY</em>
                </span>
              </h1>

              <p className="maluaContactStoryDescription">
                A private conversation about ownership, visits and opportunities.
                Tell us what you are looking for and our team will guide you through
                the MALǓA collection.
              </p>

              <div className="maluaContactAvailability" aria-label="Sales support">
                <span>Property information</span>
                <span>Private site visits</span>
                <span>Investment enquiries</span>
              </div>

              <div className="maluaContactFacts">
                <article>
                  <small>Visit</small>
                  <strong>Fumba · Zanzibar, Tanzania</strong>
                </article>

                <article>
                  <small>Email</small>
                  <a href={`mailto:${contactDetails.email}`}>
                    {contactDetails.email}
                  </a>
                </article>

                <article>
                  <small>Telephone</small>
                  <a href={contactDetails.phoneHref}>
                    {contactDetails.phoneDisplay}
                  </a>
                </article>

                <article>
                  <small>WhatsApp</small>
                  <a
                    href={buildWhatsAppLink(
                      "Hello MALǓA, I would like to speak with your sales team."
                    )}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Start a private conversation →
                  </a>
                </article>
              </div>
            </div>

            <form
              className="contactForm maluaContactForm"
              id="contact-form"
              onSubmit={handleSubmit}
            >
              <div className="contactFormHeading maluaContactFormHeading">
                <p className="sectionLabel">PRIVATE ENQUIRY</p>
                <h2>Tell us what you&apos;re looking for.</h2>
                <p>
                  Share a few details and the MALǓA team will respond with the
                  relevant property, visit or investment information.
                </p>
              </div>

              <div className="formGrid">
                <div className="formField">
                  <label htmlFor="fullName">Full name *</label>

                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Your full name"
                  />
                </div>

                <div className="formField">
                  <label htmlFor="email">Email address *</label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                  />
                </div>

                <div className="formField">
                  <label htmlFor="phone">Phone / WhatsApp</label>

                  <InternationalPhoneInput
                    id="phone"
                    value={formData.phone}
                    onChange={(phone) => {
                      setFormData((current) => ({
                        ...current,
                        phone,
                      }));
                      if (!phone || isValidPhoneNumber(phone)) {
                        setPhoneError("");
                      }
                    }}
                    error={phoneError}
                  />
                </div>

                <div className="formField">
                  <label htmlFor="subject">I would like to</label>

                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                  >
                    <option value="">Select an enquiry</option>
                    <option value="general">Make a general enquiry</option>
                    <option value="property">Explore property information</option>
                    <option value="investment">Discuss investment</option>
                    <option value="commercial">Explore a commercial opportunity</option>
                    <option value="site-visit">Arrange a site visit</option>
                  </select>
                </div>

                <div className="formField formFieldFull">
                  <label htmlFor="message">Message *</label>

                  <textarea
                    id="message"
                    name="message"
                    rows="6"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us what you would like to know."
                  />
                </div>
              </div>

              {status.message && (
                <div
                  className={`formStatus ${
                    status.type === "success"
                      ? "formStatusSuccess"
                      : "formStatusError"
                  }`}
                >
                  {status.message}
                </div>
              )}

              <button
                type="submit"
                className="formSubmitButton"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Submit enquiry"}
                <span aria-hidden="true">→</span>
              </button>

              <p className="maluaContactPrivacyNote">
                Your details are used only to respond to this enquiry.
              </p>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
