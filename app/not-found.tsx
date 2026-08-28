import Image from "next/image";
import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-16 text-center">
      <div className="mx-auto flex max-w-2xl flex-col items-center">
        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-full bg-(--pocket-blue-light) blur-3xl" />

          <Image
            src="/not-found-logo.png"
            alt="Confused Pocket mascot"
            width={420}
            height={420}
            className="h-auto w-64 sm:w-80 lg:w-96 animate-bounce"
            priority
          />
        </div>

        <p className="mt-4 text-sm font-semibold uppercase tracking-[0.25em] text-(--pocket-blue-medium)">
          Looks like this page went missing
        </p>

        <h1 className="mt-3 text-6xl font-bold tracking-tight text-(--pocket-blue)">
          404
        </h1>

        <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          Page Not Found
        </h2>

        <p className="mt-4 max-w-md text-base leading-relaxed text-slate-600">
          The page you&apos;re looking for doesn&apos;t exist, may have moved,
          or wandered out of Pocket.
        </p>

        <Link
          href="/"
          className="group mt-8 inline-flex h-14 items-center justify-center gap-3 rounded-full bg-(--pocket-blue) px-8 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-(--pocket-blue-dark) hover:shadow-lg"
        >
          <Home size={18} />
          Return Home
        </Link>
      </div>
    </div>
  );
}
