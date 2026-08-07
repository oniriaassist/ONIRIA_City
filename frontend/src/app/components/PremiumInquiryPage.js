"use client";

import { useMemo, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import {
  formatSubmissionSuccess,
  getAnonymousSessionId,
  getCampaignAttribution,
  submitEnquiry,
} from "../services/api";

const COUNTRY_OPTIONS = [
  ["TZ", "Tanzania", "+255"], ["KE", "Kenya", "+254"], ["UG", "Uganda", "+256"],
  ["RW", "Rwanda", "+250"], ["BI", "Burundi", "+257"], ["CD", "DR Congo", "+243"],
  ["ZM", "Zambia", "+260"], ["MW", "Malawi", "+265"], ["MZ", "Mozambique", "+258"],
  ["ZA", "South Africa", "+27"], ["BW", "Botswana", "+267"], ["ZW", "Zimbabwe", "+263"],
  ["NA", "Namibia", "+264"], ["AO", "Angola", "+244"], ["ET", "Ethiopia", "+251"],
  ["SO", "Somalia", "+252"], ["DJ", "Djibouti", "+253"], ["ER", "Eritrea", "+291"],
  ["SD", "Sudan", "+249"], ["SS", "South Sudan", "+211"], ["EG", "Egypt", "+20"],
  ["NG", "Nigeria", "+234"], ["GH", "Ghana", "+233"], ["CM", "Cameroon", "+237"],
  ["CI", "Côte d’Ivoire", "+225"], ["SN", "Senegal", "+221"], ["MA", "Morocco", "+212"],
  ["DZ", "Algeria", "+213"], ["TN", "Tunisia", "+216"], ["LY", "Libya", "+218"],
  ["AE", "United Arab Emirates", "+971"], ["SA", "Saudi Arabia", "+966"], ["QA", "Qatar", "+974"],
  ["OM", "Oman", "+968"], ["BH", "Bahrain", "+973"], ["KW", "Kuwait", "+965"],
  ["JO", "Jordan", "+962"], ["LB", "Lebanon", "+961"], ["TR", "Türkiye", "+90"],
  ["IN", "India", "+91"], ["PK", "Pakistan", "+92"], ["BD", "Bangladesh", "+880"],
  ["LK", "Sri Lanka", "+94"], ["CN", "China", "+86"], ["JP", "Japan", "+81"],
  ["KR", "South Korea", "+82"], ["SG", "Singapore", "+65"], ["MY", "Malaysia", "+60"],
  ["ID", "Indonesia", "+62"], ["TH", "Thailand", "+66"], ["PH", "Philippines", "+63"],
  ["AU", "Australia", "+61"], ["NZ", "New Zealand", "+64"], ["GB", "United Kingdom", "+44"],
  ["IE", "Ireland", "+353"], ["FR", "France", "+33"], ["DE", "Germany", "+49"],
  ["IT", "Italy", "+39"], ["ES", "Spain", "+34"], ["PT", "Portugal", "+351"],
  ["NL", "Netherlands", "+31"], ["BE", "Belgium", "+32"], ["CH", "Switzerland", "+41"],
  ["AT", "Austria", "+43"], ["SE", "Sweden", "+46"], ["NO", "Norway", "+47"],
  ["DK", "Denmark", "+45"], ["FI", "Finland", "+358"], ["PL", "Poland", "+48"],
  ["GR", "Greece", "+30"], ["RU", "Russia", "+7"], ["UA", "Ukraine", "+380"],
  ["US", "United States", "+1"], ["CA", "Canada", "+1"], ["MX", "Mexico", "+52"],
  ["BR", "Brazil", "+55"], ["AR", "Argentina", "+54"], ["CL", "Chile", "+56"],
  ["CO", "Colombia", "+57"], ["OTHER", "Other", "+"],
].map(([code, name, dial]) => ({ code, name, dial }));

const CONFIG = {
  brochure: {
    title: ["DISCOVER", "ONIRIA"],
    description:
      "The vision, collections and lifestyle—curated for you.",
    image: "/media/oniria/residence-aerial-masterplan.png",
    sectionLabel: "YOUR PRIVATE PROJECT INTRODUCTION",
    formTitle: "Request the ONIRIA brochure",
    formDescription:
      "Choose what interests you most. We will send the latest approved information and help you understand the next step.",
    requestLabel: "A PRIVATE BROCHURE REQUEST",
    requestTitle: "Let us curate your introduction to ONIRIA.",
    requestDescription:
      "Share your interests and our sales team will prepare the most relevant approved project information for you.",
    submitLabel: "Send my brochure request",
    successMessage:
      "Thank you. Your brochure request has been received and the ONIRIA team will contact you with the available project information.",
    inquiryType: "brochure",
    endpoint: "/brochure-requests",
    highlights: [
      ["01", "The vision", "Understand the idea, location and lifestyle behind ONIRIA City."],
      ["02", "The collections", "Explore villas, contemporary residences and opportunities within V Avenue."],
      ["03", "Your next step", "Move from project discovery to availability, consultation or a private site visit."],
    ],
  },
  interest: {
    title: ["FIND YOUR", "PLACE"],
    description:
      "A private path to the right ONIRIA opportunity.",
    image: "/media/oniria/villa-pool-rear.png",
    sectionLabel: "A PERSONALISED PROPERTY CONVERSATION",
    formTitle: "Tell us what matters to you",
    formDescription:
      "Your preferences help our team guide you towards the most relevant villa, residence or V Avenue opportunity.",
    requestLabel: "YOUR PRIVATE PROPERTY REQUEST",
    requestTitle: "Let us understand the way you want to live or invest.",
    requestDescription:
      "Tell us your priorities and our team will guide you towards the most suitable ONIRIA collection and next step.",
    submitLabel: "Begin my ONIRIA journey",
    successMessage:
      "Thank you. Your interest has been registered and a member of the ONIRIA team will contact you using the details provided.",
    inquiryType: "property-information",
    endpoint: "/enquiries",
    highlights: [
      ["01", "Live privately", "Explore generous villas created for space, privacy and tropical living."],
      ["02", "Live connected", "Consider contemporary residences close to community life and everyday convenience."],
      ["03", "Build a presence", "Discover residential, retail, dining and professional opportunities within V Avenue."],
    ],
  },
  "site-visit": {
    title: ["EXPERIENCE", "ONIRIA"],
    description:
      "See the setting, explore the collections and meet our team.",
    image: "/media/oniria/villa-gated-entry.png",
    sectionLabel: "YOUR PRIVATE SITE VISIT",
    formTitle: "Plan your visit with our team",
    formDescription:
      "Choose a preferred date and tell us what you would like to explore. We will contact you to confirm the appointment and practical details.",
    requestLabel: "A PERSONALISED SITE EXPERIENCE",
    requestTitle: "Let us prepare a visit around your interests.",
    requestDescription:
      "Share your preferred date and priorities so our team can arrange a focused introduction to ONIRIA in Fumba.",
    submitLabel: "Request my site visit",
    successMessage:
      "Thank you. Your site-visit request has been received. The ONIRIA team will contact you to confirm the date and visit arrangements.",
    inquiryType: "site-visit",
    endpoint: "/site-visits",
    highlights: [
      ["01", "A guided introduction", "Meet the team and receive a clear introduction to the ONIRIA vision and location."],
      ["02", "A focused experience", "Shape the visit around villas, residences, V Avenue or commercial interests."],
      ["03", "A clear next step", "Discuss approved information, availability and the most suitable follow-up."],
    ],
  },
};

const EMPTY_FORM = {
  fullName: "",
  email: "",
  countryCode: "TZ",
  dialCode: "+255",
  phone: "",
  propertyCollection: "",
  bedrooms: "",
  budget: "",
  preferredContact: "",
  preferredDate: "",
  numberOfGuests: "1",
  brochureDelivery: "email",
  buyingPurpose: "",
  purchaseTimeline: "",
  message: "",
  consent: false,
};

function mapInquiryType(value) {
  return {
    "property-information": "property",
    "site-visit": "site_visit",
    brochure: "brochure",
  }[value] || "general";
}

function cleanPhone(value) {
  return value.replace(/[^0-9 ()-]/g, "");
}

export default function PremiumInquiryPage({ mode }) {
  const config = CONFIG[mode] || CONFIG.interest;
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [status, setStatus] = useState({ type: "", message: "", reference: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCountry = useMemo(
    () => COUNTRY_OPTIONS.find((item) => item.code === formData.countryCode) || COUNTRY_OPTIONS[0],
    [formData.countryCode]
  );

  function clearStatus() {
    if (status.message) setStatus({ type: "", message: "", reference: "" });
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
    clearStatus();
  }

  function handleCountryChange(event) {
    const country = COUNTRY_OPTIONS.find((item) => item.code === event.target.value) || COUNTRY_OPTIONS[0];
    setFormData((current) => ({
      ...current,
      countryCode: country.code,
      dialCode: country.dial,
    }));
    clearStatus();
  }

  function handleDialCodeChange(event) {
    const dialCode = event.target.value;
    const country = COUNTRY_OPTIONS.find((item) => item.dial === dialCode);
    setFormData((current) => ({
      ...current,
      dialCode,
      countryCode: country?.code || current.countryCode,
    }));
    clearStatus();
  }

  function buildMessage() {
    const details = [];
    if (mode === "brochure") details.push(`Preferred brochure delivery: ${formData.brochureDelivery || "email"}`);
    if (mode === "interest" && formData.buyingPurpose) details.push(`Buying purpose: ${formData.buyingPurpose}`);
    if (mode === "interest" && formData.purchaseTimeline) details.push(`Purchase timeline: ${formData.purchaseTimeline}`);
    if (mode === "site-visit") details.push(`Guests: ${formData.numberOfGuests || "1"}`);
    if (formData.message.trim()) details.push(formData.message.trim());
    return details.join("\n") || config.formTitle;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.consent) {
      setStatus({
        type: "error",
        message: "Please complete your full name, email, phone number and communication consent.",
        reference: "",
      });
      return;
    }

    if (mode === "site-visit" && !formData.preferredDate) {
      setStatus({ type: "error", message: "Please choose a preferred visit date.", reference: "" });
      return;
    }

    setIsSubmitting(true);
    try {
      const fullPhone = `${formData.dialCode}${formData.phone.trim().replace(/^0+/, "")}`;
      const result = await submitEnquiry(
        {
          enquiry_type: mapInquiryType(config.inquiryType),
          name: formData.fullName,
          email: formData.email,
          phone: fullPhone,
          country: selectedCountry.name,
          message: buildMessage(),
          collection_slug: formData.propertyCollection || null,
          bedroom_preference: formData.bedrooms || null,
          budget: formData.budget || null,
          buying_purpose: formData.buyingPurpose || null,
          purchase_timeline: formData.purchaseTimeline || null,
          preferred_contact_method:
            mode === "brochure" ? formData.brochureDelivery : formData.preferredContact || null,
          ...(mode === "brochure" ? { delivery_method: formData.brochureDelivery } : {}),
          anonymous_session_id: getAnonymousSessionId(),
          consent: formData.consent,
          campaign: getCampaignAttribution(),
          preferred_date: formData.preferredDate || null,
          number_of_guests: mode === "site-visit" ? Number(formData.numberOfGuests || 1) : null,
        },
        config.endpoint
      );

      setStatus({
        type: "success",
        message: mode === "brochure"
          ? result.message
          : formatSubmissionSuccess(result, config.successMessage),
        reference: result.reference_number,
      });
      setFormData(EMPTY_FORM);
    } catch (error) {
      setStatus({ type: "error", message: error.message, reference: "" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={`premiumInquiryPage premiumInquiryPage--${mode}`}>
      <Header />

      <section className="premiumInquiryHero" style={{ backgroundImage: `url('${config.image}')` }}>
        <div className="premiumInquiryHeroOverlay" />
        <div className="premiumInquiryHeroContent">
          <h1>{config.title.map((line) => <span key={line}>{line}</span>)}</h1>
          <p>{config.description}</p>
          <a href="#request-form">Continue to your request ↓</a>
        </div>
      </section>

      <section className="premiumInquiryIntro">
        <div className="premiumInquiryIntroHeading">
          <p className="sectionLabel">{config.sectionLabel}</p>
          <h2>{config.formTitle}</h2>
        </div>
        <p className="premiumInquiryIntroCopy">{config.formDescription}</p>
      </section>

      <section className="premiumInquiryHighlights" aria-label={`${config.title.join(" ")} benefits`}>
        {config.highlights.map(([number, title, text]) => (
          <article key={number}>
            <div className="premiumHighlightNumber" aria-hidden="true">{number}</div>
            <div className="premiumHighlightContent">
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="premiumInquiryFormSection" id="request-form">
        <div className="premiumInquiryFormAside">
          <p className="sectionLabel">{config.requestLabel}</p>
          <h2>{config.requestTitle}</h2>
          <p>{config.requestDescription}</p>
          <p className="premiumInquiryPrivacyNote">
            Your information is sent securely to the ONIRIA sales team and is used only to respond to this request.
          </p>
          <div className="premiumInquiryContactNote">
            <span>Prefer a direct conversation?</span>
            <a href="https://wa.me/255000000000" target="_blank" rel="noopener noreferrer">
              Continue on WhatsApp →
            </a>
          </div>
        </div>

        <form className="premiumInquiryForm" onSubmit={handleSubmit}>
          <div className="premiumFormSection">
            <p>01 · YOUR DETAILS</p>
            <div className="premiumFormGrid">
              <label>
                <span>Full name *</span>
                <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Enter your full name" required />
              </label>
              <label>
                <span>Email address *</span>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email address" required />
              </label>
              <label>
                <span>Country *</span>
                <select name="countryCode" value={formData.countryCode} onChange={handleCountryChange} required>
                  {COUNTRY_OPTIONS.map((country) => (
                    <option value={country.code} key={country.code}>{country.name}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Phone number *</span>
                <span className="premiumPhoneField">
                  <select aria-label="Country calling code" value={formData.dialCode} onChange={handleDialCodeChange}>
                    {COUNTRY_OPTIONS.map((country) => (
                      <option value={country.dial} key={`${country.code}-${country.dial}`}>{country.dial}</option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={(event) => {
                      setFormData((current) => ({ ...current, phone: cleanPhone(event.target.value) }));
                      clearStatus();
                    }}
                    placeholder="Phone number"
                    inputMode="tel"
                    required
                  />
                </span>
              </label>
            </div>
          </div>

          <div className="premiumFormSection">
            <p>02 · {mode === "brochure" ? "YOUR BROCHURE" : mode === "site-visit" ? "YOUR VISIT" : "YOUR PREFERENCE"}</p>
            <div className="premiumFormGrid">
              {mode !== "brochure" && (
                <label>
                  <span>Collection of interest</span>
                  <select name="propertyCollection" value={formData.propertyCollection} onChange={handleChange}>
                    <option value="">Select a collection</option>
                    <option value="villas">ONIRIA Villas</option>
                    <option value="residences">ONIRIA Residences</option>
                    <option value="v-avenue">V Avenue</option>
                    <option value="commercial">Commercial spaces</option>
                  </select>
                </label>
              )}

              {mode === "brochure" && (
                <fieldset className="premiumDeliveryField premiumFormFull">
                  <legend>Send the brochure by</legend>
                  <div className="premiumDeliveryOptions">
                    <label className={formData.brochureDelivery === "email" ? "isSelected" : ""}>
                      <input
                        type="radio"
                        name="brochureDelivery"
                        value="email"
                        checked={formData.brochureDelivery === "email"}
                        onChange={handleChange}
                      />
                      <span className="premiumDeliveryIcon" aria-hidden="true">@</span>
                      <span>
                        <strong>Email</strong>
                        <small>Receive the approved brochure in your inbox.</small>
                      </span>
                    </label>
                    <label className={formData.brochureDelivery === "whatsapp" ? "isSelected" : ""}>
                      <input
                        type="radio"
                        name="brochureDelivery"
                        value="whatsapp"
                        checked={formData.brochureDelivery === "whatsapp"}
                        onChange={handleChange}
                      />
                      <span className="premiumDeliveryIcon" aria-hidden="true">WA</span>
                      <span>
                        <strong>WhatsApp</strong>
                        <small>Receive the brochure through a direct conversation.</small>
                      </span>
                    </label>
                  </div>
                </fieldset>
              )}

              {mode === "interest" && (
                <>
                  <label>
                    <span>Preferred bedrooms</span>
                    <select name="bedrooms" value={formData.bedrooms} onChange={handleChange}>
                      <option value="">Any</option>
                      <option value="1">1 bedroom</option>
                      <option value="2">2 bedrooms</option>
                      <option value="3">3 bedrooms</option>
                      <option value="4">4 bedrooms</option>
                      <option value="5-plus">5+ bedrooms</option>
                    </select>
                  </label>
                  <label>
                    <span>Buying purpose</span>
                    <select name="buyingPurpose" value={formData.buyingPurpose} onChange={handleChange}>
                      <option value="">Select a purpose</option>
                      <option value="primary-home">Primary home</option>
                      <option value="holiday-home">Holiday home</option>
                      <option value="investment">Investment property</option>
                      <option value="business">Business or commercial use</option>
                    </select>
                  </label>
                  <label>
                    <span>Purchase timeline</span>
                    <select name="purchaseTimeline" value={formData.purchaseTimeline} onChange={handleChange}>
                      <option value="">Select a timeline</option>
                      <option value="immediately">Immediately</option>
                      <option value="1-3_months">Within 1–3 months</option>
                      <option value="3-6_months">Within 3–6 months</option>
                      <option value="6+_months">More than 6 months</option>
                      <option value="exploring">I am exploring</option>
                    </select>
                  </label>
                  <label>
                    <span>Budget preference</span>
                    <select name="budget" value={formData.budget} onChange={handleChange}>
                      <option value="">Prefer not to say</option>
                      <option value="entry">Entry collection</option>
                      <option value="premium">Premium collection</option>
                      <option value="signature">Signature collection</option>
                      <option value="commercial">Commercial opportunity</option>
                    </select>
                  </label>
                </>
              )}

              {mode === "site-visit" && (
                <>
                  <label>
                    <span>Preferred visit date *</span>
                    <input type="date" name="preferredDate" value={formData.preferredDate} onChange={handleChange} required />
                  </label>
                  <label>
                    <span>Number of guests</span>
                    <select name="numberOfGuests" value={formData.numberOfGuests} onChange={handleChange}>
                      {[1, 2, 3, 4, 5, 6].map((count) => <option value={count} key={count}>{count}</option>)}
                    </select>
                  </label>
                  <label>
                    <span>Preferred contact method</span>
                    <select name="preferredContact" value={formData.preferredContact} onChange={handleChange}>
                      <option value="">Select method</option>
                      <option value="email">Email</option>
                      <option value="whatsapp">WhatsApp</option>
                    </select>
                  </label>
                </>
              )}

              {mode !== "brochure" && (
                <label className="premiumFormFull">
                  <span>{mode === "site-visit" ? "What would you like to explore?" : "Tell us more about your ideal property"}</span>
                  <textarea
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={
                      mode === "site-visit"
                        ? "Tell us which collections you would like to focus on during your visit"
                        : "Share your priorities, questions or preferred way of living"
                    }
                  />
                </label>
              )}
            </div>
          </div>

          <label className="premiumConsent">
            <input type="checkbox" name="consent" checked={formData.consent} onChange={handleChange} required />
            <span>I agree that the ONIRIA team may contact me regarding this request. *</span>
          </label>

          {status.message && (
            <div className={`premiumFormStatus ${status.type === "success" ? "isSuccess" : "isError"}`}>
              <p>{status.message}</p>
              {status.reference && <strong>Reference: {status.reference}</strong>}
            </div>
          )}

          <button type="submit" className="premiumInquirySubmit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : config.submitLabel}
          </button>
        </form>
      </section>

      <Footer />
    </main>
  );
}
