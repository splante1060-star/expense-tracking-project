export default function HeroSection() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-20">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl">
          <p className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 mb-6">
            Your money. Your plan. Your future.
          </p>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-slate-900">
            A simpler way to <br />
            <span className="text-blue-600">track</span>,{" "}
            <span className="text-purple-600">plan</span>, and{" "}
            <span className="text-green-600">save</span> for what matters.
          </h2>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
            Pocket helps you understand your spending, plan for upcoming
            expenses, and build realistic savings goals so you can feel
            confident about your financial future.
          </p>
        </div>
      </div>
    </section>
  );
}
