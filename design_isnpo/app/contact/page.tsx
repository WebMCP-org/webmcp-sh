import { Contact } from "@/components/contact";
import { DivideX } from "@/components/divide";
import { SignUp } from "@/components/sign-up";

import { getSEOTags } from "@/lib/seo";

export const metadata = getSEOTags({
  title: "Sign Up | Nodus",
  description:
    "Sign up for Nodus and start building your own autonomous agents today.",
});

export default function SignupPage() {
  return (
    <main>
      <DivideX />
      <Contact />
      <DivideX />
    </main>
  );
}
