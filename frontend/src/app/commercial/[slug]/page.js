import { notFound } from "next/navigation";
import PropertyDetailPage from "../../components/PropertyDetailPage";
import { getPropertyDetails } from "../../data/properties";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const property = getPropertyDetails("commercial", slug);

  if (!property) {
    return {
      title: "Commercial Property Not Found | ONIRIA City",
    };
  }

  return {
    title: `${property.title} | ONIRIA City`,
    description: property.description,
  };
}

export default async function CommercialDetailPage({ params }) {
  const { slug } = await params;
  const property = getPropertyDetails("commercial", slug);

  if (!property) {
    notFound();
  }

  return <PropertyDetailPage property={property} collectionSlug="commercial" />;
}
