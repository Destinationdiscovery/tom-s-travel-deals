import { useState } from "react";

type Props = {
  /** Saved with the signup so you can see which button it came from. */
  source: string;
  interests?: string[];
  buttonText?: string;
  inputId: string;
};

export default function AlertForm({ source, interests = [], buttonText = "Notify me", inputId }: Props) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setState("error");
      return;
    }
    setState("sending");
    try {
      // Loaded only in the browser, when someone submits.
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.functions.invoke("subscribe", {
        body: { email: trimmed, source_slug: source, interests },
      });
      if (error) throw error;
      setState("done");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className="form-done" role="status">
        Thanks. You are on the list.
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
