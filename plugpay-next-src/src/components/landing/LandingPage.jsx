"use client";

import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Friction } from "@/components/landing/Friction";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Contrast } from "@/components/landing/Contrast";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";
import { FabQuick } from "@/components/quick/FabQuick";

export function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Friction />
      <HowItWorks />
      <Contrast />
      <Pricing />
      <FAQ />
      <Footer />
      <FabQuick />
    </>
  );
}