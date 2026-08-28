import { LockKeyhole, Zap, Smartphone, HeartHandshake } from "lucide-react";

export default function IntroSection() {
  return (
    <section className="w-full bg-linear-to-b from-(--pocket-blue-light) via-white to-white px-6 pt-14 pb-20 lg:px-12">
      {" "}
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Everything you need to take control of your finances
        </h2>

        <div className="mt-10 grid grid-cols-2 gap-8 lg:grid-cols-4">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-(--pocket-blue) shadow-sm">
              <LockKeyhole size={24} />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-900">
              Secure & Private
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Your financial data stays protected and private.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-(--pocket-blue) shadow-sm">
              <Zap size={24} />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-900">
              Simple by Design
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              No complicated budgeting math or unnecessary clutter.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-(--pocket-blue) shadow-sm">
              <Smartphone size={24} />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-900">
              Access Anywhere
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Check your finances from desktop or mobile.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-(--pocket-blue) shadow-sm">
              <HeartHandshake size={24} />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-900">
              Built for You
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Focus on the tools that actually help you reach your goals.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
