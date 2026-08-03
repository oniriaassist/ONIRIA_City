import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import IntroductionSection from "./components/IntroductionSection";
import FeaturedCollections from "./components/FeaturedCollections";
import MasterplanPreview from "./components/MasterplanPreview";
import FinalSalesCTA from "./components/FinalSalesCTA";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="homePage">
      <Header />
      <HeroSection />
      <IntroductionSection />
      <FeaturedCollections />
      <MasterplanPreview />
      <FinalSalesCTA />
      <Footer />
    </main>
  );
}