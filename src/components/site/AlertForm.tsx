import { useState, type FormEvent } from "react";

type Props = {
  /** Saved with the signup so you can see which button it came from. */
  source: string;
  interests?: string[];
  buttonText?: string;
  inputId: string;
  /** What the visitor sees after signing up. */
  doneText?: string;
};

export default function AlertForm({
  source,
  interests = [],
  buttonText = "Notify me",
  inputId,
  doneText = "Thanks. You are on the list.",
}: Props) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setState("error");
      return;
    }
    setState("sending");
    try {
      // Sent straight to the owner's Google Form (no backend needed).
      void source;
      void interests;
      const body = new URLSearchParams({ "entry.1220368946": trimmed });
      await fetch(
        "https://docs.google.com/forms/d/e/1FAIpQLSddiVYxqrivbBNB9Fb5XAsISZdvJFdANdpJwrFfhxrulflPXw/formResponse",
        { method: "POST", mode: "no-cors", body },
      );
      setState("done");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className="form-done" role="status">
        {doneText}
      </p>
    );
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      <label htmlFor={inputId} className="sr-only">
        Email address
      </label>
      <input
        id={inputId}
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button className="btn" type="submit" disabled={state === "sending"}>
        {state === "sending" ? "Sending..." : buttonText}
      </button>
      {state === "error" ? (
        <p className="form-error" role="alert">
          Something went wrong. Check the address and try again.
        </p>
      ) : null}
    </form>
  );
}
