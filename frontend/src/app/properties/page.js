import PropertyCollectionPage from "../components/PropertyCollectionPage";

export const metadata = {
  title: "Properties | ONIRIA City",
  description:
    "Explore villas, residences, apartments and commercial spaces at ONIRIA City.",
};

const properties = [
  {
    title: "Signature Four-Bedroom Villa",
    collection: "ONIRIA VILLAS",
    location: "Fumba, Zanzibar",
    image:
      "/media/oniria/villa-pool-rear.png",
    bedrooms: "4 bedrooms",
    bathrooms: "4 bathrooms",
    area: "320 m²",
    priceLabel: "Availability",
    price: "Register interest",
    status: "Featured",
    description:
      "A spacious private villa with tropical gardens, refined interiors and generous family living areas.",
    link: "/villas/signature-villa",
  },
  {
    title: "Three-Bedroom Garden Villa",
    collection: "ONIRIA VILLAS",
    location: "Fumba, Zanzibar",
    image:
      "/media/oniria/villa-front-entry.png",
    bedrooms: "3 bedrooms",
    bathrooms: "3 bathrooms",
    area: "245 m²",
    priceLabel: "Availability",
    price: "Register interest",
    description:
      "A calm contemporary home arranged around garden views, natural light and private outdoor living.",
    link: "/villas/garden-villa",
  },
  {
    title: "Three-Bedroom Garden Residence",
    collection: "RESIDENCES",
    location: "Fumba, Zanzibar",
    image:
      "/media/oniria/residence-parking-garden.png",
    bedrooms: "3 bedrooms",
    bathrooms: "3 bathrooms",
    area: "210 m²",
    priceLabel: "Availability",
    price: "Register interest",
    status: "New",
    description:
      "A refined residence with open-plan living, landscaped views and generous private spaces.",
    link: "/residences/garden-residence",
  },
  {
    title: "Two-Bedroom Island Residence",
    collection: "RESIDENCES",
    location: "Fumba, Zanzibar",
    image:
      "/media/oniria/residence-roundabout.png",
    bedrooms: "2 bedrooms",
    bathrooms: "2 bathrooms",
    area: "145 m²",
    priceLabel: "Availability",
    price: "Register interest",
    description:
      "A modern residence created for comfortable island living, investment and flexible use.",
    link: "/residences/island-residence",
  },
  {
    title: "V Avenue Apartment",
    collection: "V AVENUE",
    location: "Fumba, Zanzibar",
    image:
      "/media/oniria/residence-aerial-masterplan.png",
    bedrooms: "2 bedrooms",
    bathrooms: "2 bathrooms",
    area: "130 m²",
    priceLabel: "Availability",
    price: "Register interest",
    description:
      "A connected apartment close to dining, retail, services and the social heart of ONIRIA City.",
    link: "/v-avenue/apartment",
  },
  {
    title: "V Avenue Retail Space",
    collection: "COMMERCIAL",
    location: "Fumba, Zanzibar",
    image:
      "/media/oniria/v-avenue-commercial.png",
    area: "Flexible layouts",
    priceLabel: "Leasing",
    price: "Enquire now",
    description:
      "A flexible retail opportunity positioned within ONIRIA City’s planned commercial and lifestyle destination.",
    link: "/commercial/retail-space",
  },
];

export default function PropertiesPage() {
  return (
    <PropertyCollectionPage
      hero={{
        eyebrow: "ONIRIA PROPERTIES",
        title: "Find Your Place in ONIRIA City",
        description:
          "Explore private villas, modern residences, apartments and commercial opportunities in Fumba, Zanzibar.",
        image:
          "/media/oniria/villa-gated-entry.png",
      }}
      introduction={{
        label: "PROPERTY COLLECTIONS",
        title: "Homes and spaces designed for different ways of life",
        description:
          "Each ONIRIA collection offers its own balance of comfort, privacy, convenience and connection to the wider community.",
      }}
      features={[
        {
          title: "Villas",
          description:
            "Private homes with generous layouts, gardens and tropical indoor-outdoor living.",
        },
        {
          title: "Residences",
          description:
            "Modern homes designed for convenience, natural light and community living.",
        },
        {
          title: "V Avenue",
          description:
            "Apartments, retail and commercial opportunities within the social heart of the destination.",
        },
      ]}
      properties={properties}
    />
  );
}
