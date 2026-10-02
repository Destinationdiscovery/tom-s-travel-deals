import { useEffect, useRef, useState, type FormEvent } from "react";
import StatStrip from "@/components/site/StatStrip";
import { Faq, Glossary, QuickAnswers, Related } from "@/components/site/PageParts";
import { FAQ_CLAIMS, GLOSSARY_CLAIMS, QUICK_CLAIMS } from "@/lib/faq";
import {
  CHECKED,
  DEFAULT_FINDER,
  DELAY_LABEL,
  DISTANCE_LABEL,
  EMPTY_DETAILS,
  ISSUE_LABEL,
  PAIN,
  PLACE_LABEL,
  REGIMES,
  RULES,
  amountLines,
  buildScripts,
  regimesFor,
  scriptToText,
  validateFinder,
  type DelayBand,
  type Details,
  type Distance,
  type Finder,
  type Issue,
  type Place,
  type RegimeId,
  type Script,
  type Size,
} from "@/lib/claims";

const STATUS_LABEL = { ok: "In force", unc: "Unconfirmed", sched: "Scheduled" } as const;

function track(name: string, params: Record<string, string | number | boolean>) {
  // Anonymous usage count only. Nothing the visitor types is sent.
  if (typeof window === "undefined") return;
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag === "function") w.gtag("event", name, params);
}

function Select<T extends string>({
  id,
  label,
  value,
  onChange,
  options,
  hint,
}: {
  id: string;
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  hint?: string;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint ? <p className="hint">{hint}</p> : null}
    </div>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} type="text" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

const PLACES: Place[] = ["ca", "us", "eu", "uk", "other"];

export default function FlightClaims() {
  const [finder, setFinder] = useState<Finder>(DEFAULT_FINDER);
  const [details, setDetails] = useState<Details>(EMPTY_DETAILS);
  const [error, setError] = useState<string | null>(null);
  const [run, setRun] = useState<{ n: number; finder: Finder; regimes: RegimeId[]; scripts: Script[] } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [edited, setEdited] = useState<Record<string, string>>({});
  const resultRef = useRef<HTMLDivElement>(null);

  // After "Show my path", bring the results into view (they sit below the form).
  useEffect(() => {
    if (run) resultRef.current?.scrollIntoView?.({ behavior: "smooth", block: "start" });
  }, [run?.n]);

  function set<K extends keyof Finder>(key: K, value: Finder[K]) {
    setFinder((f) => ({ ...f, [key]: value }));
  }
  function setD<K extends keyof Details>(key: K, value: string) {
    setDetails((d) => ({ ...d, [key]: value }));
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const problem = validateFinder(finder);
    if (problem) {
      setError(problem);
      setRun(null);
      return;
    }
    setError(null);
    const regimes = regimesFor(finder);
    const scripts = buildScripts(finder, regimes, details);
    setEdited({});
    setCopied(null);
    setRun((prev) => ({ n: (prev?.n ?? 0) + 1, finder, regimes, scripts }));
    track("flight_claim_guide_run", {
      issue: finder.issue,
      regimes: regimes.join("+") || "none",
    });
  }

  function onReset() {
    setFinder(DEFAULT_FINDER);
    setDetails(EMPTY_DETAILS);
    setError(null);
    setRun(null);
    setEdited({});
    setCopied(null);
  }

  async function copy(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      track("flight_claim_script_copied", { script: id.replace(/-.*/, "") });
    } catch {
      setCopied("error");
    }
  }

  function download(scripts: Script[]) {
    const text = scripts
      .map((s) => `${s.title}\n${"=".repeat(Math.min(s.title.length, 60))}\n\n${edited[s.id] ?? scriptToText(s)}`)
      .join("\n\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flight-claim-wording.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    track("flight_claim_scripts_downloaded", {});
  }

  const showDistance = finder.from === "eu" || finder.from === "uk" || finder.to === "eu" || finder.to === "uk";
  const showSize = finder.from === "ca" || finder.to === "ca";

  return (
    <main>
      <div className="wrap toolhead">
        <p className="eyebrow">Guide</p>
        <h1>Flight delay and cancellation claim guide</h1>
        <p className="lede">
          Flight delayed, cancelled or overbooked? See which published compensation rules may apply (EU261, UK261,
          Canada's APPR and US rules), the amounts and deadlines, where to file, and wording you can edit and send
          yourself.
        </p>
        <p className="notice">
          We are not lawyers. This is legal information, not legal advice. We do not file, send or negotiate
          anything for you, we cannot tell you that you are owed money, and we are not liable for how you use
          this guide. The airline and the regulator decide. Read the <a href="/disclaimer">disclaimer</a>.
        </p>
        <QuickAnswers items={QUICK_CLAIMS} />
      </div>

      <StatStrip
        title="Why this guide exists."
        intro="Most of these figures come from AirHelp, a company that sells claims services, so it has an interest. They are the best published numbers we found, and each one links to its source."
        stats={PAIN}
        note="Checked 02 Oct 2026. Rules and figures change, and the table further down shows what is in force."
      />

      <div className="wrap tool-grid stacked" id="tool">
        <form className="card tool-form" onSubmit={onSubmit} noValidate>
          <h2>What happened</h2>

          <div className="fgrid">
          <Select<Issue>
            id="fc-issue"
            label="What happened to your flight?"
            value={finder.issue}
            onChange={(v) => set("issue", v)}
            options={(Object.keys(ISSUE_LABEL) as Issue[]).map((k) => ({ value: k, label: ISSUE_LABEL[k] }))}
          />
          <Select<Place>
            id="fc-from"
            label="Where did the flight leave from?"
            value={finder.from}
            onChange={(v) => set("from", v)}
            options={PLACES.map((p) => ({ value: p, label: PLACE_LABEL[p] }))}
            hint="Iceland, Norway and Switzerland are not covered by this guide yet."
          />
          <Select<Place>
            id="fc-to"
            label="Where was it going?"
            value={finder.to}
            onChange={(v) => set("to", v)}
            options={PLACES.map((p) => ({ value: p, label: PLACE_LABEL[p] }))}
          />
          <Select<Place>
            id="fc-airline"
            label="Where is the airline based?"
            value={finder.airline}
            onChange={(v) => set("airline", v)}
            options={PLACES.map((p) => ({ value: p, label: PLACE_LABEL[p] }))}
            hint="This matters for flights arriving in the EU or UK."
          />
          {finder.issue !== "bumped" ? (
            <Select<DelayBand>
              id="fc-delay"
              label={finder.issue === "cancel" ? "How late did you finally arrive?" : "How late did you arrive?"}
              value={finder.delay}
              onChange={(v) => set("delay", v)}
              options={(Object.keys(DELAY_LABEL) as DelayBand[]).map((k) => ({ value: k, label: DELAY_LABEL[k] }))}
              hint="Delay is measured at your final destination, not at departure."
            />
          ) : null}
          {showDistance ? (
            <Select<Distance>
              id="fc-distance"
              label="Flight distance"
              value={finder.distance}
              onChange={(v) => set("distance", v)}
              options={(Object.keys(DISTANCE_LABEL) as Distance[]).map((k) => ({ value: k, label: DISTANCE_LABEL[k] }))}
              hint="EU and UK amounts depend on distance."
            />
          ) : null}
          {showSize ? (
            <Select<Size>
              id="fc-size"
              label="Airline size in Canada"
              value={finder.size}
              onChange={(v) => set("size", v)}
              options={[
                { value: "unsure", label: "Not sure, show both" },
                { value: "large", label: "Large airline" },
                { value: "small", label: "Small airline" },
              ]}
              hint="The Canadian Transportation Agency sets which airlines are large or small."
            />
          ) : null}
          </div>

          <h2 className="gap">Your details, optional</h2>
          <p className="hint">Used only to fill in the sample wording. Leave anything blank and you will see a placeholder to fill in.</p>
          <div className="fgrid">
          <TextField id="fc-name" label="Your name" value={details.name} onChange={(v) => setD("name", v)} />
          <TextField id="fc-air" label="Airline" value={details.airline} onChange={(v) => setD("airline", v)} />
          <TextField id="fc-flight" label="Flight number" value={details.flight} onChange={(v) => setD("flight", v)} />
          <TextField id="fc-date" label="Flight date" value={details.date} onChange={(v) => setD("date", v)} placeholder="for example 12 September 2026" />
          <TextField id="fc-origin" label="From" value={details.from} onChange={(v) => setD("from", v)} />
          <TextField id="fc-dest" label="To" value={details.to} onChange={(v) => setD("to", v)} />
          <TextField id="fc-booking" label="Booking reference" value={details.booking} onChange={(v) => setD("booking", v)} />
          {finder.issue !== "bumped" ? (
            <TextField
              id="fc-arrival"
              label="How late you arrived"
              value={details.arrival}
              onChange={(v) => setD("arrival", v)}
              placeholder="for example 4 hours 10 minutes"
            />
          ) : null}
          <TextField
            id="fc-reason"
            label="Reason the airline gave, if any"
            value={details.reason}
            onChange={(v) => setD("reason", v)}
          />
          <div className="field wide">
            <label htmlFor="fc-costs">Costs you paid while waiting, one per line</label>
            <textarea
              id="fc-costs"
              rows={3}
              value={details.costs}
              placeholder={"Hotel, one night: 180 EUR\nMeals: 45 EUR"}
              onChange={(e) => setD("costs", e.target.value)}
            />
            <p className="hint">Used for the expenses wording. Keep itemised receipts.</p>
          </div>
          </div>

          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="btns">
            <button className="btn solid" type="submit">
              Show my path
            </button>
            <button className="btn" type="button" onClick={onReset}>
              Reset
            </button>
          </div>
          <p className="hint">Nothing you type is sent or saved. It runs in your browser.</p>
        </form>

        <div className="result" aria-live="polite" ref={resultRef}>
          {!run ? (
            <div className="card">
              <h2>Your path</h2>
              <p className="note">
                Answer the questions and press Show my path. You will see which published rules may apply,
                the amounts and deadlines, the order of steps, where to file, and sample wording.
              </p>
            </div>
          ) : (
            <>
              <div className="card">
                <h2>Rules that may apply</h2>
                {run.regimes.length === 0 ? (
                  <p className="note">
                    None of the rule sets we cover appears to apply to this route. Rights exist in other
                    countries. Check the aviation regulator of the airline&apos;s country and of the country you left
                    from.
                  </p>
                ) : (
                  <>
                    {run.regimes.length > 1 ? (
                      <p className="note">
                        More than one set of rules can apply to the same flight. The Canadian rules say you cannot
                        receive compensation if you already received it for the same disruption under another
                        country&apos;s rules. Read each official page before you choose where to claim.
                      </p>
                    ) : null}
                    {run.regimes.map((r) => {
                      const info = REGIMES[r];
                      const lines = amountLines(r, run.finder);
                      return (
                        <section className="regime" key={r}>
                          <h3 className="sub-h">{info.name}</h3>
                          <p className="hint">{info.scope}</p>
                          <dl className="amounts">
                            {lines.map((l) => (
                              <div key={l.label}>
                                <dt>{l.label}</dt>
                                <dd>{l.value}</dd>
                              </div>
                            ))}
                          </dl>
                          <p className="note">
                            <strong>Deadline.</strong> {info.deadline}
                          </p>
                          <p className="note">
                            <strong>If the airline says no.</strong> {info.escalation.text}{" "}
                            <a href={info.escalation.href} rel="noopener noreferrer" target="_blank">
                              {info.escalation.label}
                            </a>
                            .
                          </p>
                          <p className="hint">
                            Official source:{" "}
                            <a href={info.official.href} rel="noopener noreferrer" target="_blank">
                              {info.official.label}
                            </a>
                            . Checked {info.checked}.
                          </p>
                        </section>
                      );
                    })}
                  </>
                )}
              </div>

              <div className="card">
                <h2>Your path, in order</h2>
                <ol className="path">
                  <li>
                    <strong>Keep your evidence.</strong> Booking confirmation, boarding pass, a screenshot of the
                    actual arrival time, messages from the airline, and receipts for any costs.
                  </li>
                  <li>
                    <strong>Ask for the reason in writing.</strong> The cause matters to most of these rules. Use the
                    first sample below.
                  </li>
                  <li>
                    <strong>Make your claim to the airline.</strong> Use its claims form or email. Use the claim
                    wording below and keep the date you sent it.
                  </li>
                  <li>
                    <strong>Wait for the reply period,</strong> then follow up. Canada&apos;s published period is 30
                    days.
                  </li>
                  <li>
                    <strong>If the airline refuses or does not answer,</strong> go to the regulator or dispute body
                    listed above. Use the summary wording as the facts section.
                  </li>
                </ol>
              </div>

              <div className="card">
                <h2>Wording you can edit and send</h2>
                <p className="note">
                  Sample wording, not a legal document. Check every detail, edit it, and send it yourself. Anything in
                  square brackets still needs your information.
                </p>
                {run.scripts.map((s) => {
                  const text = edited[s.id] ?? scriptToText(s);
                  return (
                    <div className="script" key={`${run.n}-${s.id}`}>
                      <h3 className="sub-h">{s.title}</h3>
                      <p className="hint">{s.when}</p>
                      <label className="sr-only" htmlFor={`script-${s.id}`}>
                        {s.title}
                      </label>
                      <textarea
                        id={`script-${s.id}`}
                        rows={Math.min(18, text.split("\n").length + 1)}
                        value={text}
                        onChange={(e) => setEdited((prev) => ({ ...prev, [s.id]: e.target.value }))}
                      />
                      <div className="btns">
                        <button className="btn" type="button" onClick={() => copy(s.id, text)}>
                          {copied === s.id ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>
                  );
                })}
                {copied === "error" ? (
                  <p className="form-error" role="alert">
                    Your browser blocked copying. Select the text and copy it by hand.
                  </p>
                ) : null}
                <div className="btns">
                  <button className="btn solid" type="button" onClick={() => download(run.scripts)}>
                    Download all as a text file
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <section className="band" id="rules">
        <div className="wrap">
          <h2 className="s">The rules behind the guide.</h2>
          <p className="sub">
            Official sources are labelled in the status column. Where we could only find secondary reports, the
            status says Unconfirmed. Checked {CHECKED}.
          </p>
          <div className="card">
            <table>
              <caption>Flight passenger rules by region</caption>
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
              It does not decide whether you are owed anything. Whether the cause was within the airline&apos;s control
              or an extraordinary circumstance is for the airline, and then the regulator or a court, to decide.
            </p>
            <p>
              It does not file, send or negotiate a claim, and it does not use your flight data to check what really
              happened. You keep the evidence and you send the wording.
            </p>
            <p>
              Claims companies exist for people who would rather hand the work over, and they keep a share of any
              payout. You are free to claim directly, and the official pages above are free to use.
            </p>
            <p>
              Nothing you type is sent or saved. The site records only that the guide was used, through Google
              Analytics, as described in the <a href="/privacy-policy">privacy policy</a>.
            </p>
          </div>
        </div>
      </section>

      <Glossary terms={GLOSSARY_CLAIMS} />
      <Faq
        title="Flight compensation questions, answered."
        intro="Short answers, each tied to its source. These are published rules, not advice about your case."
        items={FAQ_CLAIMS}
      />
      <Related current="/flight-claims" />
    </main>
  );
}
