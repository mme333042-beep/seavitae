"use client";

import { FormEvent, useState } from "react";
import { validateMessage } from "@/lib/messaging";

interface MessageComposeProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

/**
 * MessageCompose provides a simple text input for sending messages.
 * Plain text only, no formatting options.
 */
export default function MessageCompose({
  onSend,
  disabled = false,
}: MessageComposeProps) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = validateMessage(content);
    if (!validation.valid) {
      setError(validation.error || "Invalid message.");
      return;
    }

    onSend(content.trim());
    setContent("");
    setError("");
  }

  const characterCount = content.length;
  const isNearLimit = characterCount > 1800;

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="messageContent">Your Message</label>
        <textarea
          id="messageContent"
          name="messageContent"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setError("");
          }}
          rows={4}
          placeholder="Write your message here..."
          disabled={disabled}
          maxLength={2000}
        />
        {error && <p role="alert">{error}</p>}
        <p>
          <small>
            {characterCount}/2000 characters
            {isNearLimit && " (approaching limit)"}
          </small>
        </p>
      </div>

      <div>
        <button type="submit" disabled={disabled || !content.trim()}>
          Send Message
        </button>
      </div>

      <p>
        <small>
          Messages are plain text only. Keep communication professional and
          relevant.
        </small>
      </p>
    </form>
  );
}
