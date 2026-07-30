"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="relative flex min-h-screen bg-[#050914]">
      {/* Ambient background glow — same language as login/dashboard */}
      <div className="pointer-events-none fixed -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#fd6401]/10 blur-[120px]" />
      <div className="pointer-events-none fixed -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#071124]/60 blur-[120px]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-[size:32px_32px]" />

      <Sidebar />

      <main className="relative flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}