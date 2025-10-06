import { DivideX } from "@/components/divide";
import { SignIn } from "@/components/sign-in";

import { getSEOTags } from "@/lib/seo";

export const metadata = getSEOTags({
  title: "Sign In | Nodus",
  description:
    "Sign in to Nodus and start building your own autonomous agents today.",
});

export default function SignupPage() {
  return (
    <main>
      <DivideX />
      <SignIn />
      <DivideX />
    </main>
  );
}
