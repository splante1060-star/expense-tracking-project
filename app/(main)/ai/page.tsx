import { Sparkles } from "lucide-react";

export default function AIPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <Sparkles className="h-7 w-7 text-(--pocket-blue)" />
        <div>
          <h1 className="text-2xl font-semibold">Pocket AI</h1>
          <p className="text-sm text-muted-foreground">
            Your personal finance assistant
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-(--pocket-blue-soft) bg-(--pocket-blue-light) p-6">
        <p className="text-sm text-(--pocket-blue)">
          Welcome to Pocket AI! Your conversation interface will appear here.
        </p>
      </div>
    </div>
  );
}
