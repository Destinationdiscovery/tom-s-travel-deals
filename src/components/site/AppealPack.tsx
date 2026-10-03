import { useState, type FormEvent } from "react";
import StatStrip from "@/components/site/StatStrip";
import { Faq, Glossary, QuickAnswers, Related } from "@/components/site/PageParts";
import { FAQ_APPEAL, GLOSSARY_APPEAL, QUICK_APPEAL } from "@/lib/faq";
import {
  CHECKED,
  CLAIM_LABEL,
  COUNTRY_LABEL,
  EMPTY_INPUT,
  ENCLOSURE_OPTIONS,
  PAIN,
  REASONS,
  REASON_BY_ID,
  ROUTES,
  RULES,
  addDays,
  addMonthsClamped,
  buildLetter,
  type ClaimType,
  type Country,
  type Input,
  type ReasonId,
} from "@/lib/appeal";

const STATUS_LABEL = { ok: "In force", unc: "Unconfirmed", sched: "Scheduled" } as const;

function track(name: string, params: Record<string, string | number | boolean>) {
  // Anonymous usage count only. Nothing the visitor types is sent.
  if (typeof window === "undefined") return;
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag === "function") w.gtag("event", name, params);
}

function niceDate(iso: string | null): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${d} ${months[(m ?? 1) - 1]} ${y}`;
}

export default function AppealPack() {
  const [input, setInput] = useState<Input>(EMPTY_INPUT);
  const [complaintDate, setComplaintDate] = useState("");
  const [finalDate, setFinalDate] = useState("");
  const [run, setRun] = useState<{ n: number; input: Input; letter: string } | null>(null);
  const [letter, setLetter] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  function set<K extends keyof Input>(key: K, value: Input[K]) {
    setInput((i) => ({ ...i, [key]: value }));
  }

  function toggleEnclosure(name: string, on: boolean) {
    setInput((i) => ({
      ...i,
      enclosures: on ? [...i.enclosures, name] : i.enclosures.filter((e) => e !== name),
    }));
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = buildLetter(input);
    setLetter(text);
    setCopied(false);
    setCopyError(false);
    setRun((prev) => ({ n: (prev?.n ?? 0) + 1, input, letter: text }));
    track("insurance_appeal_built", { country: input.country, reason: input.reason, claim_type: input.claimType });
  }

  function onReset() {
    setInput(EMPTY_INPUT);
    setComplaintDate("");
    setFinalDate("");
    setRun(null);
    setLetter("");
    setCopied(false);
    setCopyError(false);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(letter);
      setCopied(true);
      setCopyError(false);
      track("insurance_appeal_copied", {});
    } catch {
      setCopyError(true);
    }
  }

  function download() {
    const blob = new Blob([letter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "insurance-appeal-letter.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    track("insurance_appeal_downloaded", {});
  }

  const reason = REASON_BY_ID[input.reason];
  const route = run ? ROUTES[run.input.country] : null;
  const runReason = run ? REASON_BY_ID[run.input.reason] : null;
  const eightWeeks = niceDate(addDays(complaintDate, 56));
  const sixMonths = niceDate(addMonthsClamped(finalDate, 6));

  return (
    <main>
      <div className="wrap toolhead">
        <p className="eyebrow">Tool</p>
        <h1>Travel insurance claim denied? Build your appeal</h1>
        <p className="lede">
          Insurer denied trip delay, cancellation or interruption costs? Build an appeal from your own policy
          wording, see the policy words worth checking, and see the published complaint route for Canada, the UK,
          the US and Australia.
        </p>
        <p className="notice">
          We are not lawyers. This is legal information, not legal advice. We do not send anything for you, we do
          not read your policy or decide whether your claim should be paid, and we are not liable for how you use
          this tool. You paste in the wording you rely on, and the insurer, then an ombudsman or regulator,
          decides. Read the <a href="/disclaimer">disclaimer</a>.
        </p>
        <QuickAnswers items={QUICK_APPEAL} />
      </div>

      <StatStrip
        title="Why this pack exists."
        intro="Published complaint data is strongest for the United Kingdom. We did not find comparable figures for Canada or the United States."
        stats={PAIN}
        note="Checked 02 Oct 2026. The first three figures come from trade press summaries of ombudsman and regulator data, so treat them as reported, not official."
      />

      <div className="wrap tool-grid" id="tool">
        <form className="card tool-form" onSubmit={onSubmit} noValidate>
          <h2>Your claim</h2>

          <div className="field">
            <label htmlFor="ap-country">Where would you complain?</label>
            <select id="ap-country" value={input.country} onChange={(e) => set("country", e.target.value as Country)}>
              {(Object.keys(COUNTRY_LABEL) as Country[]).map((c) => (
                <option key={c} value={c}>
                  {COUNTRY_LABEL[c]}
                </option>
              ))}
            </select>
            <p className="hint">The country where the policy was sold, or where you live.</p>
          </div>

          <div className="field">
            <label htmlFor="ap-type">What was the claim for?</label>
            <select id="ap-type" value={input.claimType} onChange={(e) => set("claimType", e.target.value as ClaimType)}>
              {(Object.keys(CLAIM_LABEL) as ClaimType[]).map((c) => (
                <option key={c} value={c}>
                  {CLAIM_LABEL[c]}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="ap-reason">Why did the insurer deny it?</label>
            <select id="ap-reason" value={input.reason} onChange={(e) => set("reason", e.target.value as ReasonId)}>
              {REASONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="check-card" aria-live="polite">
            <p className="lab">Policy words worth checking for this reason</p>
            <p className="hint">
              These are search terms for your own policy document. We cannot tell you which clause applies.
            </p>
            <ul className="tags">
              {reason.lookFor.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
            {input.reason === "recoverable" ? (
              <p className="hint callout">
                Claim from the airline first. The <a href="/flight-claims#tool">flight claim guide</a> has wording for
                the costs you paid while waiting.
              </p>
            ) : null}
            <p className="lab">Evidence that may help</p>
            <ul className="plain-list">
              {reason.evidence.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>

          <h2 className="gap">Details for the letter</h2>
          <div className="field">
            <label htmlFor="ap-name">Your name</label>
            <input id="ap-name" type="text" value={input.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="ap-insurer">Insurer</label>
            <input id="ap-insurer" type="text" value={input.insurer} onChange={(e) => set("insurer", e.target.value)} />
          </div>
          <div className="pair">
            <div className="field">
              <label htmlFor="ap-policy">Policy number</label>
              <input id="ap-policy" type="text" value={input.policy} onChange={(e) => set("policy", e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="ap-claim">Claim number</label>
              <input id="ap-claim" type="text" value={input.claim} onChange={(e) => set("claim", e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="ap-denial-date">Date of the denial</label>
            <input
              id="ap-denial-date"
              type="text"
              value={input.denialDate}
              placeholder="for example 20 September 2026"
              onChange={(e) => set("denialDate", e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="ap-summary">What happened</label>
            <textarea
              id="ap-summary"
              rows={4}
              value={input.summary}
              placeholder="A few sentences with dates and flight numbers."
              onChange={(e) => set("summary", e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="ap-expenses">Your expenses, one per line</label>
            <textarea
              id="ap-expenses"
              rows={4}
              value={input.expenses}
              placeholder={"Hotel, one night: 180 EUR\nMeals: 45 EUR"}
              onChange={(e) => set("expenses", e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="ap-total">Total claimed</label>
            <input id="ap-total" type="text" value={input.total} onChange={(e) => set("total", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="ap-denial-text">The insurer&apos;s stated reason</label>
            <textarea
              id="ap-denial-text"
              rows={3}
              value={input.denialText}
              placeholder="Paste it from the denial letter."
              onChange={(e) => set("denialText", e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="ap-wording">The policy wording you rely on</label>
            <textarea
              id="ap-wording"
              rows={5}
              value={input.wording}
              placeholder="Paste the exact words, with the section name or page."
              onChange={(e) => set("wording", e.target.value)}
            />
            <p className="hint">Use the policy&apos;s own words. Do not paraphrase.</p>
          </div>

          {input.reason === "recoverable" ? (
            <fieldset className="choices">
              <legend>The airline</legend>
              <label className="choice">
                <input
                  type="checkbox"
                  checked={input.airlineAsked}
                  onChange={(e) => set("airlineAsked", e.target.checked)}
                />
                <span>I asked the airline to reimburse these expenses</span>
              </label>
              {input.airlineAsked ? (
                <>
                  <div className="field">
                    <label htmlFor="ap-air-date">Date you asked</label>
                    <input
                      id="ap-air-date"
                      type="text"
                      value={input.airlineDate}
                      onChange={(e) => set("airlineDate", e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="ap-air-reply">What it replied</label>
                    <textarea
                      id="ap-air-reply"
                      rows={3}
                      value={input.airlineReply}
                      onChange={(e) => set("airlineReply", e.target.value)}
                    />
                  </div>
                </>
              ) : null}
            </fieldset>
          ) : null}

          <fieldset className="choices">
            <legend>What you will attach</legend>
            {ENCLOSURE_OPTIONS.map((o) => (
              <label className="choice" key={o}>
                <input
                  type="checkbox"
                  checked={input.enclosures.includes(o)}
                  onChange={(e) => toggleEnclosure(o, e.target.checked)}
                />
                <span>{o}</span>
              </label>
            ))}
          </fieldset>

          <div className="btns">
            <button className="btn solid" type="submit">
              Build my letter
            </button>
            <button className="btn" type="button" onClick={onReset}>
              Reset
            </button>
          </div>
          <p className="hint">Nothing you type is sent or saved. It runs in your browser.</p>
        </form>

        <div className="result" aria-live="polite">
          {!run || !route || !runReason ? (
            <div className="card">
              <h2>Your appeal</h2>
              <p className="note">
                Fill in what you know and press Build my letter. You will get a letter that quotes your own policy
                wording, an evidence list, and the published complaint route for your country. Anything in square
                brackets still needs your information.
              </p>
            </div>
          ) : (
            <>
              <div className="card">
                <h2>Your letter</h2>
                <p className="note">
                  Check every detail, edit it, and send it yourself to the insurer&apos;s claims or complaints address.
                  Keep a copy and the date you sent it.
                </p>
                <label className="sr-only" htmlFor="ap-letter">
                  Letter text
                </label>
                <textarea
                  id="ap-letter"
                  key={run.n}
                  rows={Math.min(30, letter.split("\n").length + 2)}
                  value={letter}
                  onChange={(e) => setLetter(e.target.value)}
                />
                <div className="btns">
                  <button className="btn" type="button" onClick={copy}>
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <button className="btn solid" type="button" onClick={download}>
                    Download as a text file
                  </button>
                </div>
                {copyError ? (
                  <p className="form-error" role="alert">
                    Your browser blocked copying. Select the text and copy it by hand.
                  </p>
                ) : null}
              </div>

              <div className="card">
                <h2>Evidence to attach</h2>
                <ul className="plain-list">
                  {runReason.evidence.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
                <p className="hint">Look in your denial letter for an appeal deadline. If you cannot find one, ask for it in writing.</p>
              </div>

              <div className="card">
                <h2>If the insurer keeps its decision: {route.title}</h2>
                <span className={`chip ${route.status}`}>{STATUS_LABEL[route.status]}</span>
                <ol className="path">
                  {route.steps.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
                {route.caveat ? <p className="note">{route.caveat}</p> : null}
                {route.links.length > 0 ? (
                  <p className="hint">
                    Official pages:{" "}
                    {route.links.map((l, i) => (
                      <span key={l.href}>
                        {i > 0 ? ", " : ""}
                        <a href={l.href} rel="noopener noreferrer" target="_blank">
                          {l.label}
                        </a>
                      </span>
                    ))}
                    . Checked {CHECKED}.
                  </p>
                ) : null}

                {run.input.country === "uk" ? (
                  <div className="dates">
                    <p className="lab">UK date helper</p>
                    <div className="pair">
                      <div className="field">
                        <label htmlFor="ap-complaint-date">Date you sent your complaint</label>
                        <input
                          id="ap-complaint-date"
                          type="date"
                          value={complaintDate}
                          onChange={(e) => setComplaintDate(e.target.value)}
                        />
                      </div>
                      <div className="field">
                        <label htmlFor="ap-final-date">Date on the insurer&apos;s final response</label>
                        <input
                          id="ap-final-date"
                          type="date"
                          value={finalDate}
                          onChange={(e) => setFinalDate(e.target.value)}
                        />
                      </div>
                    </div>
                    {eightWeeks ? (
                      <p className="note">
                        Eight weeks after your complaint is <strong>{eightWeeks}</strong>. After that date you can
                        normally take it to the Financial Ombudsman Service even without a final response.
                      </p>
                    ) : null}
                    {sixMonths ? (
                      <p className="note">
                        Six months after the final response is <strong>{sixMonths}</strong>. That is the published
                        deadline to refer it. Confirm it on the ombudsman&apos;s site.
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>

      <section className="band" id="rules">
        <div className="wrap">
          <h2 className="s">The complaint rules behind the pack.</h2>
          <p className="sub">
            Official sources are labelled in the status column. Checked {CHECKED}.
          </p>
          <div className="card">
            <table>
              <caption>Insurance complaint routes by country</caption>
              <thead>
                <tr>
                  <th scope="col">Rule</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="date">
                    Checked
                  </th>
                </tr>
              </thead>
              <tbody>
                {RULES.map((r) => (
                  <tr key={r.title}>
                    <td>
                      <strong>{r.title}</strong>
                      {r.body}
                      <span className="src">
                        Sources:{" "}
                        {r.sources.map((s, i) => (
                          <span key={s.href + s.label}>
                            {i > 0 ? ", " : ""}
                            <a href={s.href} rel="noopener noreferrer" target="_blank">
                              {s.label}
                            </a>
                          </span>
                        ))}
                      </span>
                    </td>
                    <td>
                      <span className={`chip ${r.status}`}>{STATUS_LABEL[r.status]}</span>
                    </td>
                    <td className="date">{r.checked}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="band" id="limits">
        <div className="wrap funded">
          <div>
            <h2 className="s">What this does not do.</h2>
          </div>
          <div>
            <p>
              It does not read your policy or tell you which clause applies. The words worth checking are search terms
              for your own document, nothing more.
            </p>
            <p>
              It does not judge whether your claim should be paid, and it cannot promise a result. Ombudsman
              figures show some denials are overturned, and many are not.
            </p>
            <p>
              It does not send your letter or contact anyone for you. If your claim is large or complex, a
              licensed professional in your country can advise on your situation.
            </p>
            <p>
              Nothing you type is sent or saved. The site records only that the tool was used, through Google
              Analytics, as described in the <a href="/privacy-policy">privacy policy</a>.
            </p>
          </div>
        </div>
      </section>

      <Glossary terms={GLOSSARY_APPEAL} />
      <Faq
        title="Travel insurance appeal questions, answered."
        intro="Short answers, each tied to its source. These are published processes, not advice about your claim."
        items={FAQ_APPEAL}
      />
      <Related current="/insurance-appeal" />
    </main>
  );
}
