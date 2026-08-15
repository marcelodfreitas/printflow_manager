"use client";

import { Header } from "@/components/layout/Header";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#050914]">
      {/* <Header
        title="Configurações"
        className="border-b border-white/10 bg-[#050914]/80 backdrop-blur-xl"
      /> */}

      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:p-6 lg:flex-row lg:gap-8">
        <SettingsSidebar />

        <main className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}