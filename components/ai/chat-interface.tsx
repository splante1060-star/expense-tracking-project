"use client";

import { useEffect, useRef, useState } from "react";
import type { SubmitEvent } from "react";
import {
  CalendarDays,
  ChartPie,
  ChevronDown,
  LockKeyhole,
  ReceiptText,
  Sparkles,
  Wallet,
} from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const starterTopics = [
  {
    label: "Monthly spending",
    icon: Wallet,
    questions: [
      "How much have I spent this month?",
      "How much did I spend on groceries this month?",
      "What was my total spending last month?",
    ],
  },
  {
    label: "Upcoming bills",
    icon: CalendarDays,
    questions: [
      "What bills do I have coming up in the next 45 days?",
      "Do I have any overdue bills?",
      "What bills are due in the next 7 days?",
    ],
  },
  {
    label: "Budget status",
    icon: ChartPie,
    questions: [
      "How are my budgets looking this month?",
      "How much do I have left in my dining budget?",
      "Which budgets are getting close to their limits?",
    ],
  },
  {
    label: "Recent transactions",
    icon: ReceiptText,
    questions: [
      "What are my most recent transactions?",
      "Show my expenses from the last 30 days.",
      "Have I received any income in the last 30 days?",
    ],
  },
];

export default function ChatInterface() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);

  const requestInProgress = useRef(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const container = messagesContainerRef.current;

    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, isLoading, error]);

  useEffect(() => {
    if (messages.length === 0 && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0;
    }
  }, [selectedTopic, messages.length]);

  function selectQuestion(question: string) {
    setInput(question);
    inputRef.current?.focus();
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (requestInProgress.current) return;

    const text = input.trim();

    if (!text) return;

    requestInProgress.current = true;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };

    const conversation = [...messages, newMessage]
      .slice(-10)
      .map(({ role, content }) => ({ role, content }));

    setMessages((previous) => [...previous, newMessage]);
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversation }),
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
      requestInProgress.current = false;
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-col gap-4">
      <div
        ref={messagesContainerRef}
        role="log"
        aria-label="Pocket AI conversation"
        aria-live="polite"
        aria-relevant="additions text"
        className="h-[min(64vh,34rem)] min-h-64 overflow-y-auto overscroll-contain rounded-xl border border-(--pocket-blue-soft) bg-white p-4"
      >
        {messages.length === 0 ? (
          <div className="flex min-h-full flex-col items-center justify-center gap-4 py-4">
            {selectedTopic === null && (
              <div
                className={`grid w-full transition-[grid-template-rows,opacity] motion-reduce:transition-none duration-300 ease-in-out ${
                  selectedTopic === null
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
                aria-hidden={selectedTopic !== null}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-(--pocket-blue-light)">
                      <Sparkles size={24} className="text-(--pocket-blue)" />
                    </div>

                    <h2 className="text-lg font-semibold text-(--pocket-blue-dark)">
                      How can I help you today?
                    </h2>

                    <p className="max-w-md text-sm text-(--pocket-blue-medium)">
                      Your money, your questions. Explore your Pocket finances.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-2">
              {starterTopics.map((topic, index) => {
                const Icon = topic.icon;
                const isSelected = selectedTopic === index;

                return (
                  <button
                    key={topic.label}
                    type="button"
                    aria-expanded={isSelected}
                    aria-controls="pocket-ai-suggestions"
                    onClick={() => setSelectedTopic(isSelected ? null : index)}
                    className={`flex items-center gap-3 rounded-xl border p-4 text-left transaction-colors ${
                      isSelected
                        ? "border-(--pocket-blue) bg-(--pocket-blue-light)"
                        : "border-(--pocket-blue-soft) bg-white hover:bg-(--pocket-blue-light)"
                    }`}
                  >
                    <Icon size={20} className="shrink-0 text-(--pocket-blue" />
                    <span className="flex-1 text-sm font-medium text-(--pocket-blue-dark)">
                      {topic.label}
                    </span>

                    <ChevronDown
                      size={16}
                      className={`shrink-0 text-(--pocket-blue-medium) transition-transform ${isSelected ? "rotate-180" : ""}`}
                    />
                  </button>
                );
              })}
            </div>

            {selectedTopic !== null && (
              <div
                className={`grid w-full max-w-xl transition-[grid-template-rows,opacity] motion-reduce:transition-none duration-300 ease-in-out ${
                  selectedTopic !== null
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  {selectedTopic !== null && (
                    <div
                      id="pocket-ai-suggestions"
                      className="flex flex-col gap-2"
                    >
                      <p className="text-sm font-medium text-(--pocket-blue-dark)">
                        Suggested questions
                      </p>

                      {starterTopics[selectedTopic].questions.map(
                        (question) => (
                          <button
                            key={question}
                            type="button"
                            onClick={() => selectQuestion(question)}
                            className="rounded-lg border border-(--pocket-blue-soft) bg-white px-4 py-3 text-left text-sm text-(--pocket-blue-dark) transition-colors hover:bg-(--pocket-blue-light)"
                          >
                            {question}
                          </button>
                        ),
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
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

      <form onSubmit={handleSubmit} className="flex shrink-0 gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
          placeholder="Ask Pocket AI..."
          aria-label="Message Pocket AI"
          className="min-w-0 flex-1 rounded-lg border border-(--pocket-blue-soft) bg-white px-4 py-3 text-sm text-(--pocket-blue-dark)"
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
