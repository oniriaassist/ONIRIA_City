import PropertyCollectionPage from "../components/PropertyCollectionPage";

export const metadata = {
  title: "Residences | ONIRIA City",
  description:
    "Explore modern residences and apartments at ONIRIA City.",
};

const residences = [
  {
    title: "Three-Bedroom Garden Residence",
    collection: "RESIDENCES",
    location: "Fumba, Zanzibar",
    image:
      "/media/oniria/residence-aerial-masterplan.png",
    bedrooms: "3 bedrooms",
    bathrooms: "3 bathrooms",
    area: "210 m²",
    priceLabel: "Availability",
    price: "Register interest",
    status: "Featured",
    description:
      "A spacious residence with natural light, open-plan living and views across landscaped community spaces.",
    link: "/residences/garden-residence",
  },
  {
    title: "Two-Bedroom Island Residence",
    collection: "RESIDENCES",
    location: "Fumba, Zanzibar",
    image:
      "/media/oniria/v-avenue-commercial.png",
    bedrooms: "2 bedrooms",
    bathrooms: "2 bathrooms",
    area: "145 m²",
    priceLabel: "Availability",
    price: "Register interest",
    description:
      "A refined residence created for everyday comfort, flexible ownership and modern island living.",
    link: "/residences/island-residence",
  },
  {
    title: "One-Bedroom Studio Residence",
    collection: "RESIDENCES",
    location: "Fumba, Zanzibar",
    image:
      "/media/oniria/villa-pool-rear.png",
    bedrooms: "1 bedroom",
    bathrooms: "1 bathroom",
    area: "82 m²",
    priceLabel: "Availability",
    price: "Register interest",
    description:
      "A compact and elegant residence suited to individuals, couples and investment-focused ownership.",
    link: "/residences/studio-residence",
  },
];

export default function ResidencesPage() {
  return (
    <PropertyCollectionPage
      hero={{
        eyebrow: "RESIDENCES",
        title: "Contemporary Homes for Connected Living",
        description:
          "Modern residences offering comfort, convenience, natural light and access to the wider ONIRIA lifestyle.",
        image:
          "/media/oniria/villa-front-entry.png",
      }}
      introduction={{
        label: "THE RESIDENCE COLLECTION",
        title: "Modern homes shaped around daily life",
        description:
          "Residences combine efficient layouts, refined interiors and convenient access to landscaped spaces, amenities and V Avenue.",
      }}
      features={[
        {
          title: "Efficient layouts",
          description:
            "Thoughtful floor plans balance comfort, storage, circulation and flexible living.",
        },
        {
          title: "Community access",
          description:
            "Residents remain close to amenities, landscaped spaces and everyday services.",
        },
        {
          title: "Flexible ownership",
          description:
            "A range of property sizes supports different lifestyle and investment goals.",
        },
      ]}
      properties={residences}
    />
  );
}
