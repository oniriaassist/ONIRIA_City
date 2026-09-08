import PropertyCollectionPage from "../components/PropertyCollectionPage";

export const metadata = {
  title: "Commercial | Roho",
  description:
    "Explore commercial and retail opportunities at Roho.",
};

const commercialSpaces = [
  {
    title: "V Avenue Retail Space",
    collection: "COMMERCIAL",
    location: "V Avenue, Roho",
    image:
      "/media/oniria/residence-parking-garden.png",
    area: "Flexible layouts",
    priceLabel: "Leasing",
    price: "Enquire now",
    status: "Opportunity",
    description:
      "A retail space positioned within the planned social, dining and commercial centre of Roho.",
    link: "/commercial/retail-space",
  },
  {
    title: "Restaurant and Café Space",
    collection: "FOOD & BEVERAGE",
    location: "V Avenue, Roho",
    image:
      "/media/oniria/residence-roundabout.png",
    area: "Flexible layouts",
    priceLabel: "Leasing",
    price: "Enquire now",
    description:
      "A hospitality opportunity designed for cafés, restaurants and social dining experiences.",
    link: "/commercial/restaurant-space",
  },
  {
    title: "Professional Office Space",
    collection: "OFFICES",
    location: "V Avenue, Roho",
    image:
      "/media/oniria/residence-aerial-masterplan.png",
    area: "Flexible layouts",
    priceLabel: "Leasing",
    price: "Enquire now",
    description:
      "Modern office space for businesses seeking a well-designed address within a connected Zanzibar destination.",
    link: "/commercial/office-space",
  },
];

export default function CommercialPage() {
  return (
    <PropertyCollectionPage
      hero={{
        eyebrow: "COMMERCIAL OPPORTUNITIES",
        title: "Build Your Business within Roho",
        description:
          "Retail, dining, office and service opportunities positioned within a growing residential and lifestyle destination.",
        image:
          "/media/oniria/v-avenue-commercial.png",
      }}
      introduction={{
        label: "V AVENUE BUSINESS",
        title: "A destination for commerce, dining and connection",
        description:
          "Commercial spaces at ROHO are planned to support residents, visitors and businesses through a connected mixed-use environment.",
      }}
      features={[
        {
          title: "Resident demand",
          description:
            "Businesses benefit from proximity to the wider ROHO residential community.",
        },
        {
          title: "Flexible spaces",
          description:
            "Layouts can support retail, dining, offices and selected professional services.",
        },
        {
          title: "Destination setting",
          description:
            "V Avenue is planned as a social and commercial centre for ROHO."
        },
      ]}
      properties={commercialSpaces}
    />
  );
}