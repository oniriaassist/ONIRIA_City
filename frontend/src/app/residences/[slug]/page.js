import { notFound } from "next/navigation";
import PropertyDetailPage from "../../components/PropertyDetailPage";
import { getPropertyDetails } from "../../data/properties";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const property = getPropertyDetails("residences", slug);

  if (!property) {
    return {
      title: "Residence Not Found | Roho",
    };
  }

  return {
    title: `${property.title} | Roho`,
    description: property.description,
  };
}

export default async function ResidenceDetailPage({ params }) {
  const { slug } = await params;
  const property = getPropertyDetails("residences", slug);

  if (!property) {
    notFound();
  }

  return <PropertyDetailPage property={property} collectionSlug="residences" />;
}
