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

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
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
          disabled={!input.trim()}
          className="rounded-lg bg-(--pocket-blue) px-5 py-3 text-white disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
