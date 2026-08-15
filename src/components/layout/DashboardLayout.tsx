"use client";

import { ReactNode } from "react";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function DashboardLayout({
  children,
  title,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-[100dvh] bg-[#050914] text-white">
  <Sidebar />

  <div className="min-h-screen lg:pl-[60px]">
    <Header title={title} />

    <main className="min-h-[calc(100vh-72px)]">
      {children}
    </main>
  </div>
</div>
  );
}