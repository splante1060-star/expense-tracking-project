import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import "./globals.css";

import Header from "@/components/header";
import Footer from "@/components/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pocket | Personal Finance",
  description:
    "A personal budgeting dashboard for tracking spending, planning for upcoming expenses, and building realistic savings goals.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full">
        <body className={`${inter.className} min-h-screen`}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
