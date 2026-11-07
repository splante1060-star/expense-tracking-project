"use client";

import { useState } from "react";
import type { SubmitEvent } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function ChatInterface() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    if (isLoading) return;

    event.preventDefault();

    const text = input.trim();

    if (!text) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };

    setMessages((previous) => [...previous, newMessage]);
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        throw new Error("Failed to get a response.");
      }

      const data = await response.json();

      if (typeof data?.message !== "string" || !data.message.trim()) {
        throw new Error("Invalid assistant response");
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.message,
      };

      setMessages((previous) => [...previous, assistantMessage]);
    } catch (error) {
      console.error("Pocket AI request failed:", error);
      setError(
        "Sorry, Pocket AI couldn't respond right now. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="min-h-80 rounded-xl border border-(--pocket-blue-soft) bg-white p-4">
        {messages.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center">
            <p className="text-sm text-(--pocket-blue-medium)">
              How can I help you today?
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap ${
                    message.role === "user"
                      ? "bg-(--pocket-blue) text-white"
                      : "bg-(--pocket-blue-light) text-(--pocket-blue-dark)"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <p className="text-sm text-(--pocket-blue-medium)">
                Pocket AI is thinking...
              </p>
            )}
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask Pocket AI..."
          aria-label="Message Pocket AI"
          className="flex-1 rounded-lg border border-(--pocket-blue-soft) bg-white px-4 py-3 text-sm text-(--pocket-blue-dark)"
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="rounded-lg bg-(--pocket-blue) px-5 py-3 text-white disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
