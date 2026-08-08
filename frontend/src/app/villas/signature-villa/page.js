import PropertyDetailPage from "../../components/PropertyDetailPage";

export const metadata = {
  title: "Signature Villa | ONIRIA City",
  description:
    "Explore the Signature Four-Bedroom Villa at ONIRIA City in Fumba, Zanzibar.",
};

const property = {
  collection: "ONIRIA VILLAS",
  title: "Signature Four-Bedroom Villa",
  location: "Fumba, Zanzibar",
  eyebrow: "SIGNATURE VILLA",
  heroImage:
    "/media/oniria/villa-front-entry.png",
  overviewTitle: "A generous private home shaped around family life",
  description:
    "The Signature Villa brings together spacious interiors, private outdoor areas, tropical landscaping and refined finishes. It is designed for owners seeking privacy, flexibility and a strong connection to Zanzibar’s relaxed environment.",
  facts: [
    {
      label: "Bedrooms",
      value: "4",
    },
    {
      label: "Bathrooms",
      value: "4",
    },
    {
      label: "Approximate area",
      value: "320 m²",
    },
    {
      label: "Property type",
      value: "Private villa",
    },
    {
      label: "Availability",
      value: "Register interest",
    },
  ],
  gallery: [
    {
      title: "Villa exterior",
      url:
        "/media/oniria/villa-gated-entry.png",
    },
    {
      title: "Main living room",
      url:
        "/media/oniria/residence-parking-garden.png",
    },
    {
      title: "Private bedroom",
      url:
        "/media/oniria/residence-roundabout.png",
    },
    {
      title: "Outdoor living",
      url:
        "/media/oniria/residence-aerial-masterplan.png",
    },
    {
      title: "Refined interior details",
      url:
        "/media/oniria/v-avenue-commercial.png",
    },
  ],
  features: [
    {
      title: "Private garden",
      description:
        "A landscaped outdoor area creates room for family activities, relaxation and entertaining.",
    },
    {
      title: "Open-plan living",
      description:
        "Generous living and dining areas support comfortable everyday life and social occasions.",
    },
    {
      title: "Natural light",
      description:
        "Large openings bring daylight into the home and strengthen the connection with the landscape.",
    },
    {
      title: "Family privacy",
      description:
        "Private bedrooms and flexible spaces allow residents and guests to enjoy comfort and independence.",
    },
  ],
  layoutImage:
    "/media/oniria/villa-pool-rear.png",
  layoutTitle: "Spaces created for everyday comfort",
  layoutDescription:
    "The villa layout balances shared family areas with private rooms, outdoor spaces and practical circulation.",
  layoutPoints: [
    "Four private bedrooms",
    "Open living and dining area",
    "Modern kitchen",
    "Private garden and terrace",
    "Guest and family spaces",
    "Dedicated storage areas",
  ],
};

export default function SignatureVillaPage() {
  return <PropertyDetailPage property={property} collectionSlug="villas" />;
}
