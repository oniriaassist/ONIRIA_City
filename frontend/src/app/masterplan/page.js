import EditorialPage from "../components/EditorialPage";

export const metadata = {
  title: "Masterplan | ONIRIA City",
  description:
    "Explore the connected masterplan of ONIRIA City in Fumba, Zanzibar.",
};

export default function MasterplanPage() {
  return (
    <EditorialPage
      showFinalCTA={false}
      hero={{
        eyebrow: "ONE CONNECTED COMMUNITY",
        title: "The ONIRIA City Masterplan",
        description:
          "Villas, residences, commerce, nature and community spaces arranged as one complete destination.",
        image:
          "/media/oniria/v-avenue-commercial.png",
      }}
      introduction={{
        label: "THE BIG PICTURE",
        title: "Everything connected by one clear vision",
        description:
          "The ONIRIA masterplan is designed to make daily life convenient, comfortable and inspiring. Residential areas are connected to landscaped spaces, social destinations and everyday services.",
      }}
      sections={[
        {
          title: "ONIRIA Villas",
          description:
            "Private villa neighbourhoods offer generous homes, gardens, quiet surroundings and a close relationship with nature.",
          image:
            "/media/oniria/villa-pool-rear.png",
          points: [
            "Private residential plots",
            "Landscaped surroundings",
            "Family-focused environments",
            "Contemporary tropical architecture",
          ],
          link: {
            label: "Explore villas",
            href: "/villas",
          },
        },
        {
          title: "ONIRIA Residences",
          description:
            "Modern residences provide accessible community living with natural light, efficient layouts and shared amenities.",
          image:
            "/media/oniria/villa-front-entry.png",
          points: [
            "One to four-bedroom options",
            "Modern communal facilities",
            "Secure residential access",
            "Views across landscaped areas",
          ],
          link: {
            label: "Explore residences",
            href: "/residences",
          },
        },
        {
          title: "V Avenue",
          description:
            "A vibrant mixed-use avenue provides shops, dining, offices, services and places for the community to meet.",
          image:
            "/media/oniria/villa-gated-entry.png",
          points: [
            "Retail and dining",
            "Commercial opportunities",
            "Community events",
            "Convenient everyday services",
          ],
          link: {
            label: "Explore V Avenue",
            href: "/v-avenue",
          },
        },
        {
          title: "Green and social spaces",
          description:
            "Parks, walking paths and wellness spaces create room for relaxation, movement and social connection.",
          image:
            "/media/oniria/residence-parking-garden.png",
          points: [
            "Community park",
            "Walking and cycling paths",
            "Children’s areas",
            "Outdoor wellness spaces",
          ],
        },
      ]}
    />
  );
}