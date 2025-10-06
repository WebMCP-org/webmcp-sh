import { AgenticIntelligence } from "@/components/agentic-intelligence";
import { DivideX } from "@/components/divide";
import { Hero } from "@/components/hero";
import { HeroImage } from "@/components/hero-image";
import { HowItWorks } from "@/components/how-it-works";
import { LogoCloud } from "@/components/logo-cloud";
import { UseCases } from "@/components/use-cases";
import { getSEOTags } from "@/lib/seo";

export const metadata = getSEOTags();

export default function PlaygroundPage() {
  return (
    <div className="">
      <DivideX />
      <Hero />
      <DivideX />
      <HeroImage />
      <DivideX />
      <LogoCloud />
      <DivideX />
      <HowItWorks />
      <DivideX />
      <AgenticIntelligence />
      <DivideX />
      <UseCases />
    </div>
  );
}
