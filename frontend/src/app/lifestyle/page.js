import EditorialPage from "../components/EditorialPage";

export const metadata = {
  title: "Lifestyle | ONIRIA City",
  description:
    "Discover the ocean, nature, wellness and community lifestyle of ONIRIA City.",
};

export default function LifestylePage() {
  return (
    <EditorialPage
      showFinalCTA={false}
      hero={{
        title: ["LIFE COMES", "TOGETHER"],
        description:
          "Nature, wellness and community shape every day.",
        image:
          "/media/oniria/villa-front-entry.png",
      }}
      introduction={{
        label: "LIVE DIFFERENTLY",
        title: "More than a home, a complete way of life",
        description:
          "ONIRIA City creates opportunities to relax, connect, explore and enjoy Zanzibar every day.",
      }}
      sections={[
        {
          title: "Nature",
          description:
            "Tropical landscaping, shaded paths and outdoor spaces allow residents to remain close to nature.",
          image:
            "/media/oniria/villa-gated-entry.png",
          points: [
            "Tropical gardens",
            "Green walking routes",
            "Outdoor gathering areas",
            "Peaceful natural surroundings",
          ],
        },
        {
          title: "Wellness",
          description:
            "Spaces for movement, relaxation and restoration support healthier daily routines.",
          image:
            "/media/oniria/residence-parking-garden.png",
          points: [
            "Fitness and activity spaces",
            "Swimming and relaxation",
            "Walking and cycling",
            "Quiet wellness areas",
          ],
        },
        {
          title: "Dining and social life",
          description:
            "Restaurants, cafés and welcoming public spaces make it easy to meet, celebrate and share experiences.",
          image:
            "/media/oniria/residence-roundabout.png",
          points: [
            "Island-inspired dining",
            "Cafés and social spaces",
            "Community celebrations",
            "Convenient nearby services",
          ],
        },
        {
          title: "Ocean experiences",
          description:
            "Zanzibar’s sea, sunrise and sunset become part of the wider ONIRIA lifestyle.",
          image:
            "/media/oniria/residence-aerial-masterplan.png",
          points: [
            "Coastal experiences",
            "Sunrise and sunset moments",
            "Water activities",
            "Relaxed island living",
          ],
        },
      ]}
    />
  );
}