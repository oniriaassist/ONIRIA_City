"use client";

import { useState } from "react";
import Header from "../components/Header";
import PublicPageHero from "../components/PublicPageHero";
import FinalSalesCTA from "../components/FinalSalesCTA";
import Footer from "../components/Footer";

const faqGroups = [
  {
    category: "ABOUT ONIRIA",
    questions: [
      {
        question: "What is ONIRIA City?",
        answer:
          "ONIRIA City is a planned residential and lifestyle destination in Fumba, Zanzibar. It brings together villas, residences, commercial spaces, amenities, landscaped areas and community experiences.",
      },
      {
        question: "Where is ONIRIA City located?",
        answer:
          "ONIRIA City is planned for Fumba, Zanzibar, Tanzania. Detailed directions and location information will be shared through the official sales team.",
      },
      {
        question: "What makes ONIRIA different?",
        answer:
          "ONIRIA combines contemporary architecture, tropical landscape, wellness, commercial activity and community living within one connected masterplan.",
      },
    ],
  },
  {
    category: "PROPERTIES",
    questions: [
      {
        question: "What types of properties will be available?",
        answer:
          "The planned collections include private villas, modern residences, apartments and commercial spaces within V Avenue.",
      },
      {
        question: "Are property prices available?",
        answer:
          "Final prices and payment terms should only be published after approval by the ONIRIA sales and management teams. Prospective buyers can register their interest for verified information.",
      },
      {
        question: "Can international buyers purchase property?",
        answer:
          "Ownership and eligibility depend on the final legal and property structure. Buyers should request verified guidance from the official sales team before making a decision.",
      },
    ],
  },
  {
    category: "PURCHASING",
    questions: [
      {
        question: "How can I register my interest?",
        answer:
          "Use the enquiry page, contact form or WhatsApp button. A sales representative can then contact you with approved information.",
      },
      {
        question: "Can I arrange a site visit?",
        answer:
          "Yes. Site visits can be requested through the enquiry form or by contacting the ONIRIA team directly.",
      },
      {
        question: "Will payment plans be available?",
        answer:
          "Payment terms will depend on the selected property and approved sales arrangements. Official information will be shared by the sales team.",
      },
    ],
  },
  {
    category: "LIFESTYLE",
    questions: [
      {
        question: "What amenities are planned?",
        answer:
          "The concept includes landscaped areas, wellness and recreation spaces, family facilities, retail, dining and everyday community services.",
      },
      {
        question: "Is ONIRIA suitable for families?",
        answer:
          "The community is being planned with family living, safety, outdoor activity, shared spaces and convenient services in mind.",
      },
      {
        question: "Will commercial spaces be available?",
        answer:
          "Yes. V Avenue is planned as a mixed-use destination with retail, dining, services and commercial opportunities.",
      },
    ],
  },
];

export default function FAQsPage() {
  const [openQuestion, setOpenQuestion] = useState(null);

  function toggleQuestion(questionKey) {
    setOpenQuestion((current) =>
      current === questionKey ? null : questionKey
    );
  }

  return (
    <main>
      <Header />

      <PublicPageHero
        eyebrow="FREQUENTLY ASKED QUESTIONS"
        title="How Can We Help?"
        description="Find answers about ONIRIA City, its properties, lifestyle and purchasing journey."
        image="/media/oniria/v-avenue-commercial.png"
      />

      <section className="faqIntroduction" id="page-content">
        <p className="sectionLabel">ONIRIA INFORMATION</p>

        <h2>Answers to common questions</h2>

        <p>
          Information may change as the project develops. Final prices,
          availability, legal terms and delivery details must come from the
          authorized ONIRIA team.
        </p>
      </section>

      <section className="faqGroups">
        {faqGroups.map((group, groupIndex) => (
          <div className="faqGroup" key={group.category}>
            <div className="faqGroupHeading">
              <span>{String(groupIndex + 1).padStart(2, "0")}</span>
              <h2>{group.category}</h2>
            </div>

            <div className="faqQuestions">
              {group.questions.map((item, questionIndex) => {
                const questionKey = `${groupIndex}-${questionIndex}`;
                const isOpen = openQuestion === questionKey;

                return (
                  <article
                    className={`faqItem ${isOpen ? "faqItemOpen" : ""}`}
                    key={item.question}
                  >
                    <button
                      type="button"
                      className="faqQuestion"
                      onClick={() => toggleQuestion(questionKey)}
                      aria-expanded={isOpen}
                    >
                      <span>{item.question}</span>
                      <strong>{isOpen ? "−" : "+"}</strong>
                    </button>

                    <div className="faqAnswer">
                      <p>{item.answer}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <FinalSalesCTA />
      <Footer />
    </main>
  );
}
