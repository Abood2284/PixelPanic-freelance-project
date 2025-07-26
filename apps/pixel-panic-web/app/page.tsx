import BrandSelector from "@/components/features/landing/BrandSelector";
import { HeroSection } from "@/components/features/landing/HeroSection";
import { ProcessStepper } from "@/components/features/landing/process-stepper";
import SocialProof from "@/components/features/landing/SocialProof";
import Footer from "@/components/shared/Footer";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#16202C]">
      <main className="flex-1">
        <HeroSection />
        <BrandSelector />
        <SocialProof />
        <ProcessStepper />
        {/* We will build the next sections here */}
      </main>
      <Footer />
    </div>
  );
}
