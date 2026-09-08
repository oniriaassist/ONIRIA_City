import { notFound } from "next/navigation";
import PropertyDetailPage from "../../components/PropertyDetailPage";
import { getPropertyDetails } from "../../data/properties";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const property = getPropertyDetails("villas", slug);

  if (!property) {
    return {
      title: "Villa Not Found | Roho",
    };
  }

  return {
    title: `${property.title} | Roho`,
    description: property.description,
  };
}

export default async function VillaDetailPage({ params }) {
  const { slug } = await params;
  const property = getPropertyDetails("villas", slug);

  if (!property) {
    notFound();
  }

  return <PropertyDetailPage property={property} collectionSlug="villas" />;
}
