"use client";

import { useState } from "react";
import { isValidPhoneNumber } from "react-phone-number-input";
import Header from "../components/Header";
import InternationalPhoneInput from "../components/InternationalPhoneInput";
import PublicPageHero from "../components/PublicPageHero";
import Footer from "../components/Footer";
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
        message: formatSubmissionSuccess(result, "Thank you. Your message has been received."),
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
    <main>
      <Header />

      <PublicPageHero
        title={["BEGIN YOUR", "ONIRIA STORY"]}
        description="A private conversation about ownership, visits and opportunities."
        image="/media/oniria/residence-aerial-masterplan.png"
      />

      <section className="contactPageSection" id="page-content">
        <div className="contactPageIntroduction">
          <div>
            <p className="sectionLabel">CONTACT OUR TEAM</p>

            <h2>We are here to help you explore ONIRIA City</h2>
          </div>

          <p>
            Contact us for verified information about property collections,
            availability, site visits, investment opportunities and commercial
            spaces.
          </p>
        </div>

        <div className="contactPageGrid">
          <div className="contactInformation">
            <article>
              <span>01</span>
              <h3>Visit</h3>
              <p>
                Fumba
                <br />
                Zanzibar, Tanzania
              </p>
            </article>

            <article>
              <span>02</span>
              <h3>Email</h3>
              <a href="mailto:hello@oniriacity.com">
                hello@oniriacity.com
              </a>
            </article>

            <article>
              <span>03</span>
              <h3>Telephone</h3>
              <a href="tel:+255000000000">
                +255 000 000 000
              </a>
            </article>

            <article>
              <span>04</span>
              <h3>WhatsApp</h3>
              <a
                href="https://wa.me/255000000000"
                target="_blank"
                rel="noreferrer"
              >
                Start a WhatsApp conversation
              </a>
            </article>
          </div>

          <form className="contactForm" onSubmit={handleSubmit}>
            <div className="contactFormHeading">
              <p className="sectionLabel">SEND A MESSAGE</p>
              <h2>How can we help?</h2>
            </div>

            <div className="formGrid">
              <div className="formField">
                <label htmlFor="fullName">Full name *</label>

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="formField">
                <label htmlFor="email">Email address *</label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                />
              </div>

              <div className="formField">
                <label htmlFor="phone">Phone number</label>

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
                <label htmlFor="subject">Subject</label>

                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                >
                  <option value="">Select a subject</option>
                  <option value="general">General question</option>
                  <option value="property">Property information</option>
                  <option value="investment">Investment</option>
                  <option value="commercial">Commercial opportunity</option>
                  <option value="site-visit">Site visit</option>
                </select>
              </div>

              <div className="formField formFieldFull">
                <label htmlFor="message">Message *</label>

                <textarea
                  id="message"
                  name="message"
                  rows="7"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help you"
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
              {isSubmitting ? "Sending..." : "Send message"}
            </button>
          </form>
        </div>
      </section>


      <Footer />
    </main>
  );
}
