import EditorialPage from "../components/EditorialPage";

export const metadata = {
  title: "Investment | ONIRIA City",
  description:
    "Learn about the investment opportunity offered by ONIRIA City in Fumba, Zanzibar.",
};

export default function InvestmentPage() {
  return (
    <EditorialPage
      hero={{
        eyebrow: "INVEST IN ONIRIA",
        title: "A New Opportunity in Zanzibar",
        description:
          "Own a home or property within a carefully planned destination designed for long-term value, lifestyle and growth.",
        image:
          "/media/oniria/residence-parking-garden.png",
      }}
      introduction={{
        label: "A STRATEGIC DESTINATION",
        title: "An investment connected to place and potential",
        description:
          "ONIRIA City combines residential quality, lifestyle appeal and a growing Zanzibar location within one integrated development.",
      }}
      sections={[
        {
          title: "A growing Zanzibar market",
          description:
            "Zanzibar continues to attract residents, investors, businesses and visitors seeking distinctive property and lifestyle opportunities.",
          image:
            "/media/oniria/residence-roundabout.png",
          points: [
            "International lifestyle appeal",
            "Strong tourism identity",
            "Growing residential demand",
            "Distinctive island location",
          ],
        },
        {
          title: "Different property opportunities",
          description:
            "ONIRIA offers villas, residences, apartments and commercial spaces for different ownership and investment goals.",
          image:
            "/media/oniria/residence-aerial-masterplan.png",
          points: [
            "Private villas",
            "Modern residences",
            "Apartments",
            "Retail and commercial spaces",
          ],
          link: {
            label: "View property collections",
            href: "/properties#available-collection",
          },
        },
        {
          title: "Long-term community value",
          description:
            "The mixed-use masterplan supports value by combining homes, services, nature, amenities and public spaces.",
          image:
            "/media/oniria/v-avenue-commercial.png",
          points: [
            "Integrated masterplan",
            "Quality amenities",
            "Connected neighbourhoods",
            "Long-term destination vision",
          ],
        },
        {
          title: "Guided purchasing journey",
          description:
            "The ONIRIA sales team will support prospective buyers through property selection, availability, payment information and next steps.",
          image:
            "/media/oniria/villa-pool-rear.png",
          points: [
            "Property consultation",
            "Availability guidance",
            "Payment-plan information",
            "Site-visit arrangements",
          ],
          link: {
            label: "Register your interest",
            href: "/register-interest",
          },
        },
      ]}
    />
  );
}
