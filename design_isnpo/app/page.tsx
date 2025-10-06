import { AgenticIntelligence } from "@/components/agentic-intelligence";
import { Benefits } from "@/components/benefits";
import { CTA, CTAOrbit } from "@/components/cta";
import { DivideX } from "@/components/divide";
import { FAQs } from "@/components/faqs";
import { Hero } from "@/components/hero";
import { HeroImage } from "@/components/hero-image";
import { HowItWorks } from "@/components/how-it-works";
import { LogoCloud } from "@/components/logo-cloud";
import { Pricing } from "@/components/pricing";
import { Security } from "@/components/security";
import { Testimonials } from "@/components/testimonials";
import { UseCases } from "@/components/use-cases";

import { getSEOTags } from "@/lib/seo";

export const metadata = getSEOTags();

export default function Home() {
  return (
    <main>
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
      <DivideX />
      <Benefits />
      <DivideX />
      <Testimonials />
      <DivideX />
      <Pricing />
      <DivideX />
      <Security />
      <DivideX />
      <FAQs />
      <DivideX />
      <CTA />
      <DivideX />
    </main>
  );
}
