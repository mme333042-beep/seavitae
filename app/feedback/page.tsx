"use client";

import Link from "next/link";
import { useState } from "react";
import {
  FEEDBACK_CATEGORIES,
  FeedbackCategory,
  FeedbackRating,
  validateFeedback,
  submitFeedback,
} from "@/lib/feedback";
import { trackEvent } from "@/lib/analytics";
import { isFeedbackEnabled, getLaunchPhaseLabel } from "@/lib/softLaunch";

export default function FeedbackPage() {
  const [category, setCategory] = useState<FeedbackCategory | "">("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState<FeedbackRating | null>(null);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const feedbackEnabled = isFeedbackEnabled();
  const phaseLabel = getLaunchPhaseLabel();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = validateFeedback(category, message);
    if (!validation.valid) {
      setError(validation.error || "Invalid feedback.");
      return;
    }

    const result = submitFeedback(category as FeedbackCategory, message, {
      rating: rating || undefined,
      pageUrl: window.location.href,
    });

    if (!result.success) {
      setError(result.error || "Failed to submit feedback.");
      return;
    }

    trackEvent("feedback_submitted", {
      metadata: { category: category as string },
    });

    setSubmitted(true);
  }

  if (!feedbackEnabled) {
    return (
      <main>
        <section>
          <h1>Feedback</h1>
          <p>Feedback collection is not currently enabled.</p>
          <Link href="/">Back to Home</Link>
        </section>
      </main>
    );
  }

  if (submitted) {
    return (
      <main>
        <section>
          <h1>Thank You</h1>
          <p>
            Your feedback has been submitted. We read every piece of feedback
            and use it to improve SeaVitae.
          </p>
          <p>
            <small>
              As an {phaseLabel.toLowerCase()} user, your input is especially
              valuable in shaping the platform.
            </small>
          </p>
          <div>
            <button
              type="button"
              onClick={() => {
                setCategory("");
                setMessage("");
                setRating(null);
                setError("");
                setSubmitted(false);
              }}
            >
              Submit More Feedback
            </button>
          </div>
          <div>
            <Link href="/">Back to Home</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <header>
        <h1>Share Your Feedback</h1>
        {phaseLabel && (
          <p>
            <small>
              You are part of our {phaseLabel.toLowerCase()} group. Your
              feedback helps us build a better platform.
            </small>
          </p>
        )}
      </header>

      <section>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="category">What is this about?</label>
            <select
              id="category"
              name="category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as FeedbackCategory);
                setError("");
              }}
              required
            >
              <option value="">Select a category</option>
              {FEEDBACK_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            {category && (
              <p>
                <small>
                  {FEEDBACK_CATEGORIES.find((c) => c.value === category)
                    ?.description || ""}
                </small>
              </p>
            )}
          </div>

          <div>
            <label htmlFor="message">Your Feedback</label>
            <textarea
              id="message"
              name="message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setError("");
              }}
              rows={6}
              placeholder="Tell us what's working, what's not, or what you'd like to see..."
              maxLength={2000}
              required
            />
            <p>
              <small>{message.length}/2000 characters</small>
            </p>
          </div>

          <fieldset>
            <legend>Overall Experience (optional)</legend>
            <p>
              <small>How would you rate your experience so far?</small>
            </p>
            <div>
              {([1, 2, 3, 4, 5] as FeedbackRating[]).map((value) => (
                <label key={value} style={{ marginRight: "1rem" }}>
                  <input
                    type="radio"
                    name="rating"
                    value={value}
                    checked={rating === value}
                    onChange={() => setRating(value)}
                  />
                  {value}
                </label>
              ))}
            </div>
            <p>
              <small>1 = Poor, 5 = Excellent</small>
            </p>
          </fieldset>

          {error && <p role="alert">{error}</p>}

          <div>
            <button type="submit">Submit Feedback</button>
          </div>
        </form>
      </section>

      <aside>
        <h2>Why Your Feedback Matters</h2>
        <p>
          During this early phase, we are focused on learning from real users
          like you. Your insights help us:
        </p>
        <ul>
          <li>Identify and fix issues quickly</li>
          <li>Prioritize the right features</li>
          <li>Make SeaVitae work better for everyone</li>
        </ul>
        <p>
          <small>All feedback is reviewed by our team.</small>
        </p>
      </aside>

      <div>
        <Link href="/">Back to Home</Link>
      </div>
    </main>
  );
}
