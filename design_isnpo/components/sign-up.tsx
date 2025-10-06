import React from "react";
import { Container } from "./container";
import { LogoSVG } from "./logo";
import { Heading } from "./heading";
import { SubHeading } from "./subheading";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./button";
import { FacebookIcon, GoogleIcon, AppleIcon } from "@/icons/general";
import Link from "next/link";
import { AuthIllustration } from "./auth-illustration";

export const SignUp = () => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("submitted");
  };
  return (
    <Container className="min-h-[calc(100vh-8rem)] py-10 md:py-20">
      <div className="grid grid-cols-1 gap-10 px-4 md:grid-cols-2 md:px-8 lg:gap-40">
        <div>
          <LogoSVG />
          <Heading className="mt-4 text-left lg:text-4xl">
            Create an account
          </Heading>
          <SubHeading as="p" className="mt-4 max-w-xl text-left">
            We empower developers and technical teams to create, simulate, and
            manage AI-driven workflows visually
          </SubHeading>
          <form className="mt-6 flex flex-col gap-8">
            <div className="h-full w-full rounded-2xl">
              <Label>Name</Label>
              <Input
                type="text"
                className="mt-4 border-none focus:ring-gray-300"
                placeholder="Manu Arora"
              />
            </div>
            <div className="h-full w-full rounded-2xl">
              <Label>Email</Label>
              <Input
                type="email"
                className="mt-4 border-none focus:ring-gray-300"
                placeholder="youremail@yourdomain.com"
              />
            </div>
            <div className="h-full w-full rounded-2xl">
              <Label>Password</Label>
              <Input
                type="password"
                className="mt-4 border-none focus:ring-gray-300"
                placeholder="Create a password"
              />
            </div>
            <Button>Sign up</Button>
            <div className="mt-2 flex items-center">
              <div className="h-px flex-1 bg-gray-200 dark:bg-neutral-700"></div>
              <span className="px-4 text-sm text-gray-500 dark:text-neutral-400">
                or
              </span>
              <div className="h-px flex-1 bg-gray-200 dark:bg-neutral-700"></div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Button
                variant="secondary"
                className="flex w-full justify-center py-4"
              >
                <GoogleIcon />
              </Button>
              <Button
                variant="secondary"
                className="flex w-full justify-center py-4"
              >
                <FacebookIcon />
              </Button>
              <Button
                variant="secondary"
                className="flex w-full justify-center py-4"
              >
                <AppleIcon />
              </Button>
            </div>
          </form>
          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600 dark:text-neutral-400">
              Already have an account?{" "}
            </span>
            <Link
              href="/sign-in"
              className="text-brand text-sm font-medium hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
        <AuthIllustration />
      </div>
    </Container>
  );
};

export default SignUp;
