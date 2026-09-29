"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

type FormModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  showCloseButton?: boolean;
};

const modalSizes = {
  sm: "max-w-lg",
  md: "max-w-2xl",
  lg: "max-w-3xl",
};

export default function FormModal({
  open,
  onClose,
  children,
  size = "md",
  showCloseButton = true,
}: FormModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`relative max-h-[calc(100vh-2rem)] w-full ${modalSizes[size]} overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-5 top-5 z-20 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        )}

        {children}
      </div>
    </div>
  );
}
