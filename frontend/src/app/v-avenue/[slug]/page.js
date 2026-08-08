import { notFound } from "next/navigation";
import PropertyDetailPage from "../../components/PropertyDetailPage";
import { getPropertyDetails } from "../../data/properties";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const property = getPropertyDetails("v-avenue", slug);

  if (!property) {
    return {
      title: "V Avenue Property Not Found | ONIRIA City",
    };
  }

  return {
    title: `${property.title} | ONIRIA City`,
    description: property.description,
  };
}

export default async function VAvenueDetailPage({ params }) {
  const { slug } = await params;
  const property = getPropertyDetails("v-avenue", slug);

  if (!property) {
    notFound();
  }

  return <PropertyDetailPage property={property} collectionSlug="v-avenue" />;
}
