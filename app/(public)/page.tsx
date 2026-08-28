import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import HeroSection from "@/components/landing-page/hero-section";
import IntroSection from "@/components/landing-page/intro-section";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <>
      <HeroSection />
      <IntroSection />
    </>
  );
}
