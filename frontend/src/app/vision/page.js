import EditorialPage from "../components/EditorialPage";

export const metadata = {
  title: "Vision | ONIRIA City",
  description:
    "Discover the vision behind ONIRIA City in Fumba, Zanzibar.",
};

export default function VisionPage() {
  return (
    <EditorialPage
      hero={{
        title: ["A PLACE TO", "BELONG"],
        description:
          "Thoughtful living, rooted in Zanzibar and designed for generations.",
        image:
          "/media/oniria/residence-aerial-masterplan.png",
      }}
      introduction={{
        label: "OUR PURPOSE",
        title: "Creating a place to live, connect and belong",
        description:
          "ONIRIA City is envisioned as a complete residential and lifestyle community in Fumba. It brings together homes, commerce, wellness, landscape and shared experiences within one carefully considered destination.",
      }}
      sections={[
        {
          title: "Designed around people",
          description:
            "Every part of ONIRIA City is planned to support comfortable living, meaningful connections and a strong sense of belonging.",
          image:
            "/media/oniria/v-avenue-commercial.png",
          points: [
            "Walkable neighbourhoods",
            "Welcoming shared spaces",
            "Homes for different stages of life",
            "A calm and secure environment",
          ],
        },
        {
          title: "Inspired by Zanzibar",
          description:
            "The destination draws inspiration from Zanzibar’s climate, coastline, natural textures, culture and relaxed rhythm of life.",
          image:
            "/media/oniria/villa-pool-rear.png",
          points: [
            "Tropical landscaping",
            "Indoor and outdoor living",
            "Natural materials and warm colours",
            "Ocean-inspired lifestyle",
          ],
        },
        {
          title: "Built for the future",
          description:
            "ONIRIA combines modern infrastructure, responsible planning and investment potential to create lasting value for residents and the wider community.",
          image:
            "/media/oniria/villa-front-entry.png",
          points: [
            "Long-term community planning",
            "Mixed residential and commercial use",
            "Quality public spaces",
            "A destination with enduring value",
          ],
          link: {
            label: "Explore the masterplan",
            href: "/masterplan#page-content",
          },
        },
      ]}
    />
  );
}
