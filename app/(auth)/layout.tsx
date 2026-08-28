import type { ReactNode } from "react";
import Header from "@/components/header";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="flex min-h-screen items-center justify-center px-6 pt-30 pb-12">
        {children}
      </main>
    </div>
  );
}
