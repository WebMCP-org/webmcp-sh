import { CTA } from "@/components/cta";
import { DivideX } from "@/components/divide";
import { FAQs } from "@/components/faqs";
import { Pricing } from "@/components/pricing";
import { PricingTable } from "@/components/pricing-table";

import { getSEOTags } from "@/lib/seo";

export const metadata = getSEOTags({
  title: "Pricing - Notus | Aceternity UI Pro Template",
  description:
    "Notus is a platform for building agentic workflows. It allows you to design, simulate, and launch autonomous agents visually and intuitively.",
});

export default function PricingPage() {
  return (
    <main>
      <DivideX />
      <Pricing />
      <DivideX />
      <PricingTable />
      {/* <DivideX /> */}
      <FAQs />
      <DivideX />
      <CTA />
      <DivideX />
    </main>
  );
}
