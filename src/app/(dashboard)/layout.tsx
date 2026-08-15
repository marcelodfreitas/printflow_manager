"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNavProvider } from "@/contexts/MobileNavContext";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/ui";
import { ThemeProvider } from "@/contexts/ThemeContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--app-background)] text-[var(--app-foreground)]">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
     <ThemeProvider>
    <MobileNavProvider>
      <div className="relative min-h-screen bg-[var(--app-background)] text-[var(--app-foreground)]">

        <div className="relative flex min-h-screen">
          <Sidebar />

          <div className="flex min-w-0 flex-1 flex-col">
  <Header />

  <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
    {children}
  </main>
</div>
        </div>
      </div>
    </MobileNavProvider>
    </ThemeProvider>
  );
}