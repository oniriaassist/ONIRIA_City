import PropertyCollectionPage from "../components/PropertyCollectionPage";

export const metadata = {
  title: "Villas | ONIRIA City",
  description:
    "Explore private villas designed for tropical living at ONIRIA City.",
};

const villas = [
  {
    title: "Signature Four-Bedroom Villa",
    collection: "ONIRIA VILLAS",
    location: "Fumba, Zanzibar",
    image:
      "/media/oniria/villa-front-entry.png",
    bedrooms: "4 bedrooms",
    bathrooms: "4 bathrooms",
    area: "320 m²",
    priceLabel: "Availability",
    price: "Register interest",
    status: "Featured",
    description:
      "A premium family villa with generous interiors, private gardens and elegant outdoor living spaces.",
    link: "/villas/signature-villa",
  },
  {
    title: "Three-Bedroom Garden Villa",
    collection: "ONIRIA VILLAS",
    location: "Fumba, Zanzibar",
    image:
      "/media/oniria/villa-gated-entry.png",
    bedrooms: "3 bedrooms",
    bathrooms: "3 bathrooms",
    area: "245 m²",
    priceLabel: "Availability",
    price: "Register interest",
    description:
      "A peaceful contemporary villa with landscaped outdoor space and comfortable family rooms.",
    link: "/villas/garden-villa",
  },
  {
    title: "Courtyard Villa",
    collection: "ONIRIA VILLAS",
    location: "Fumba, Zanzibar",
    image:
      "/media/oniria/residence-parking-garden.png",
    bedrooms: "3 bedrooms",
    bathrooms: "3 bathrooms",
    area: "260 m²",
    priceLabel: "Availability",
    price: "Register interest",
    description:
      "A villa arranged around a private courtyard, bringing daylight, greenery and calm into the centre of the home.",
    link: "/villas/courtyard-villa",
  },
];

export default function VillasPage() {
  return (
    <PropertyCollectionPage
      showFinalCTA={false}
      showCardLabels={false}
      hero={{
        title: "Private Homes Inspired by Island Living",
        description:
          "Generous villas combining contemporary design, gardens, privacy and a strong connection to Zanzibar’s tropical environment.",
        image:
          "/media/oniria/residence-roundabout.png",
      }}
      introduction={{
        label: "THE VILLA COLLECTION",
        title: "More space, more privacy, more possibility",
        description:
          "The ONIRIA Villa Collection is designed for families and owners seeking generous living areas, private outdoor spaces and timeless tropical architecture.",
      }}
      features={[
        {
          title: "Private gardens",
          description:
            "Outdoor spaces designed for relaxation, entertaining and everyday family life.",
        },
        {
          title: "Generous interiors",
          description:
            "Open living areas, comfortable bedrooms and flexible spaces for family and guests.",
        },
        {
          title: "Tropical design",
          description:
            "Shade, airflow, natural light and warm materials support comfortable island living.",
        },
      ]}
      properties={villas}
    />
  );
}