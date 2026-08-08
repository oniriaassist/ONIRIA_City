import EditorialPage from "../components/EditorialPage";

export const metadata = {
  title: "Architecture | ONIRIA City",
  description:
    "Discover the architectural vision and design language of ONIRIA City.",
};

export default function ArchitecturePage() {
  return (
    <EditorialPage
      hero={{
        eyebrow: "ARCHITECTURE & DESIGN",
        title: "Contemporary Living with a Zanzibar Soul",
        description:
          "Architecture shaped by tropical climate, natural materials, modern comfort and the character of Zanzibar.",
        image:
          "/media/oniria/residence-aerial-masterplan.png",
      }}
      introduction={{
        label: "DESIGN PHILOSOPHY",
        title: "Modern architecture connected to place",
        description:
          "ONIRIA City combines contemporary design with ideas inspired by Zanzibar’s climate, landscape, craftsmanship and way of life.",
      }}
      sections={[
        {
          title: "Tropical modern design",
          description:
            "Homes are designed for natural light, airflow and a strong relationship between indoor and outdoor living.",
          image:
            "/media/oniria/v-avenue-commercial.png",
          points: [
            "Large windows and shaded openings",
            "Natural ventilation",
            "Indoor and outdoor living areas",
            "Climate-conscious layouts",
          ],
        },
        {
          title: "Natural materials and textures",
          description:
            "Warm finishes, stone, timber and soft neutral colours create interiors that feel elegant, calm and connected to Zanzibar.",
          image:
            "/media/oniria/villa-pool-rear.png",
          points: [
            "Warm natural textures",
            "Stone-inspired surfaces",
            "Timber details",
            "Soft coastal colour palette",
          ],
        },
        {
          title: "Spaces designed for daily life",
          description:
            "Each home balances beauty with practical layouts, privacy, storage and flexible areas for families and guests.",
          image:
            "/media/oniria/villa-front-entry.png",
          points: [
            "Open-plan living spaces",
            "Private bedrooms",
            "Functional kitchens",
            "Flexible family areas",
          ],
        },
        {
          title: "A consistent community identity",
          description:
            "Buildings, landscapes and public spaces share a unified design language while allowing each collection to maintain its own character.",
          image:
            "/media/oniria/villa-gated-entry.png",
          points: [
            "Coordinated architectural language",
            "Integrated landscape design",
            "Distinct property collections",
            "High-quality public spaces",
          ],
          link: {
            label: "Explore ONIRIA properties",
            href: "/properties#available-collection",
          },
        },
      ]}
    />
  );
}
