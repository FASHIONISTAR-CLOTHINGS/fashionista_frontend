/**
 * Composer for sending chat messages.
 */

"use client";

import { useState } from "react";
import { SendHorizontal } from "lucide-react";

export interface MessageInputProps {
  onSend: (body: string) => Promise<void> | void;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled = false }: MessageInputProps) {
  const [body, setBody] = useState("");

  const handleSubmit = async () => {
    const trimmed = body.trim();
    if (!trimmed || disabled) {
      return;
    }
    await onSend(trimmed);
    setBody("");
  };

  return (
    <div className="border-t border-black/10 bg-white p-4">
      <div className="flex items-end gap-3">
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void handleSubmit();
            }
          }}
          rows={3}
          placeholder="Write a message..."
          disabled={disabled}
          className="min-h-24 flex-1 resize-none rounded-lg border border-black/10 px-4 py-3 text-sm text-[#141414] outline-none transition focus:border-[#FDA600]"
        />
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={disabled || body.trim().length === 0}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#FDA600] text-[#141414] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Send message"
        >
          <SendHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
