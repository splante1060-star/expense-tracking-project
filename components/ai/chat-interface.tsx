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
  );
}
