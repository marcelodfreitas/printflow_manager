"use client";

import { BackgroundEffects } from "@/components/login/BackgroundEffects";
import { HeroSection } from "@/components/login/HeroSection";
import { LoginCard } from "@/components/login/LoginCard";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060a12] text-white">
  <BackgroundEffects />

  <div className="relative z-10 mx-auto max-w-6xl px-6">
    <div className="grid min-h-screen grid-cols-1 pb-20 pt-10 lg:grid-cols-[1.05fr_.95fr] lg:py-2">
      <div className="flex items-center">
        <HeroSection />
      </div>

      <div className="flex items-center justify-center lg:justify-end">
        <LoginCard />
      </div>
    </div>
  </div>
</main>
  );
}
