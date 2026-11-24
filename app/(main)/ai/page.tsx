import { Sparkles } from "lucide-react";
import ChatInterface from "@/components/ai/chat-interface";

export default function AIPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-(--pocket-blue-dark)">
          Pocket AI
        </h1>
        <p className="mt-1 text-sm text-(--pocket-blue-medium)">
          Your personal finance assistant
        </p>
      </div>

      <ChatInterface />
    </div>
  );
}
