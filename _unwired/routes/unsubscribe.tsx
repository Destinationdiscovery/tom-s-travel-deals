import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { unsubscribe } from "@/lib/subscribers.functions";
import { processProspectUnsubscribe } from "@/lib/prospect-unsubscribe.functions";
import { CONTACT_EMAIL } from "@/lib/legal-copy";

export const Route = createFileRoute("/unsubscribe")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: (search["token"] as string) || "",
    e: (search["e"] as string) || "",
    t: (search["t"] as string) || "",
    id: (search["id"] as string) || "",
  }),
  head: () => ({
    meta: [
      { title: "Unsubscribe | Aventura Sports Media" },
      { name: "description", content: "Stop receiving email from Aventura Sports Media." },
      { property: "og:title", content: "Unsubscribe | Aventura Sports Media" },
      { property: "og:description", content: "One click and we stop emailing you." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: UnsubscribePage,
});

function UnsubscribePage() {
  const { token, e, t, id } = Route.useSearch();
  const run = useServerFn(unsubscribe);
  const runLead = useServerFn(processProspectUnsubscribe);
  const [state, setState] = useState<"working" | "done" | "missing" | "invalid" | "error">("working");

  useEffect(() => {
    // A link from an outreach email carries the address, the lead and a signature.
    if (e && t && id) {
      runLead({ data: { email: e, prospectId: id, token: t } })
        .then((r) => setState(r.ok ? "done" : "invalid"))
        .catch(() => setState("error"));
      return;
    }
    if (!token) {
      setState("missing");
      return;
    }
    run({ data: { token } })
      .then((r) => setState(r.found ? "done" : "missing"))
      .catch(() => setState("error"));
  }, [token, e, t, id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="phead" style={{ paddingBottom: 90 }}>
      <div className="wrap" style={{ maxWidth: 680 }}>
        <h1>Unsubscribe</h1>
        <div className="fill" style={{ marginTop: 22 }}>
          {state === "working" && <p>Working on it.</p>}
          {state === "done" && <p>Done. We have noted it, and we will not email you again.</p>}
          {state === "missing" && (
            <p>
              We could not match that link to a subscription. You may already be unsubscribed. If you still get email
              from us, write to {CONTACT_EMAIL} and we will remove you by hand.
            </p>
          )}
          {state === "invalid" && (
            <p>
              That link did not work. It may have been cut off when it was copied. Write to {CONTACT_EMAIL} and we will
              remove you by hand.
            </p>
          )}
          {state === "error" && (
            <p>Something went wrong. Email {CONTACT_EMAIL} and we will take you off the list by hand.</p>
          )}
        </div>
        <p style={{ marginTop: 22 }}>
          <Link className="btn btn-ghost" to="/">
            Back to home
          </Link>
        </p>
      </div>
    </section>
  );
}
