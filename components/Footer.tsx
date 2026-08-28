import { Heart, LockKeyhole } from "lucide-react";

export default function Footer() {
  return (
    <footer className=" border-slate-200 bg-white px-6 py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <div>
          <p className="text-sm font-medium text-slate-700">
            A simpler way to track, plan, and save for what matters.
          </p>

          <p className="mt-1 flex items-center justify-center gap-1 text-xs text-slate-500 sm:justify-start">
            Made with
            <Heart
              size={12}
              className="fill-(--pocket-blue-medium) text-(--pocket-blue)"
            />
            by Sophie Plante
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <LockKeyhole size={13} />
          <span>Private personal finance</span>
        </div>
      </div>
    </footer>
  );
}
