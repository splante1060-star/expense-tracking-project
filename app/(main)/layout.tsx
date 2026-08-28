import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import AppSidebar from "@/components/app-sidebar";
import AppHeader from "@/components/app-header";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AppSidebar />

      <div className="min-w-0 flex-1">
        <AppHeader />

        <main className="px-6 pb-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
