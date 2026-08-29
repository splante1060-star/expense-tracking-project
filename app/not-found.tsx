import Image from "next/image";
import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-8 text-center">
      <div className="mx-auto flex max-w-xl flex-col items-center">
        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-full bg-(--pocket-blue-light) blur-3xl" />

          <Image
            src="/not-found-logo.png"
            alt="Confused Pocket mascot"
            width={320}
            height={320}
            className="h-auto w-48 sm:w-56 lg:w-64 animate-bounce"
            priority
          />
        </div>

        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.25em] text-(--pocket-blue-medium)">
          Looks like this page went missing
        </p>

        <h1 className="mt-2 text-5xl font-bold tracking-tight text-(--pocket-blue)">
          404
        </h1>

        <h2 className="mt-1 text-2xl font-bold text-slate-900">
          Page Not Found
        </h2>

        <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600">
          The page you&apos;re looking for doesn&apos;t exist, may have moved,
          or wandered out of Pocket.
        </p>

        <Link
          href="/"
          className="group mt-6 inline-flex h-11 items-center justify-center gap-2.5 rounded-full bg-(--pocket-blue) px-6 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-(--pocket-blue-dark) hover:shadow-lg"
        >
          <Home size={16} />
          Return Home
        </Link>
      </div>
    </div>
  );
}
