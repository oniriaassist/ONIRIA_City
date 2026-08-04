import PremiumInquiryPage from "../components/PremiumInquiryPage";

export const metadata = {
  title: "Request the ONIRIA City Brochure",
  description: "Request the latest approved ONIRIA City project and property information.",
};

export default function RequestBrochurePage() {
  return <PremiumInquiryPage mode="brochure" />;
}
