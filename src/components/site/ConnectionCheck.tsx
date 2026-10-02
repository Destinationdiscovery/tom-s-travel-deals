import { useMemo, useState, type FormEvent } from "react";
import StatStrip from "@/components/site/StatStrip";
import {
  CHECKED,
  PAIN,
  CHECK_REPEAT,
  DEFAULT_GATE_MINUTES,
  FACTS,
  QUEUE,
  REG_FIRST,
  SCENARIOS,
  SCHENGEN_COUNTRIES,
  STEPS,
  estimate,
  formatMinutes,
  validate,
  type Basis,
  type Direction,
  type EesStatus,
  type Inputs,
  type PassportGroup,
  type ScenarioId,
  type Verdict,
} from "@/lib/connection-check";

const BASIS_LABEL: Record<Basis, string> = {
  reported: "Reported",
  assumed: "Our assumption",
  yours: "You entered",
};
const BASIS_CLASS: Record<Basis, string> = {
  reported: "ok",
  assumed: "unc",
  yours: "sched",
};
const VERDICT_TEXT: Record<Verdict, string> = {
  ok: "Looks workable",
  tight: "Tight",
  short: "Likely too short",
};
const VERDICT_CLASS: Record<Verdict, string> = { ok: "ok", tight: "unc", short: "bad" };

function track(name: string, params: Record<string, string | number | boolean>) {
  // Anonymous usage count only. Nothing the visitor types is sent.
  if (typeof window === "undefined") return;
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag === "function") w.gtag("event", name, params);
}

function BasisChip({ basis }: { basis: Basis }) {
  return <span className={`chip ${BASIS_CLASS[basis]}`}>{BASIS_LABEL[basis]}</span>;
}

function Choice({
  name,
  value,
  checked,
  onChange,
  label,
  hint,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  label: string;
  hint?: string;
}) {
  return (
    <label className="choice">
      <input type="radio" name={name} value={value} checked={checked} onChange={() => onChange(value)} />
      <span>
        {label}
        {hint ? <small>{hint}</small> : null}
      </span>
    </label>
  );
}

function Check({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <label className="choice">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

export default function ConnectionCheck() {
  const [direction, setDirection] = useState<Direction>("arriving");
  const [passport, setPassport] = useState<PassportGroup>("noneu");
  const [ees, setEes] = useState<EesStatus>("first");
  const [party, setParty] = useState("1");
  const [hours, setHours] = useState("2");
  const [minutes, setMinutes] = useState("0");
  const [gate, setGate] = useState(String(DEFAULT_GATE_MINUTES));
  const [bags, setBags] = useState(false);
  const [terminalChange, setTerminalChange] = useState(false);
  const [securityAgain, setSecurityAgain] = useState(false);
  const [needsHelp, setNeedsHelp] = useState(false);
  const [when, setWhen] = useState<ScenarioId>("typical");
  const [separate, setSeparate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [run, setRun] = useState<{ inputs: Inputs; when: ScenarioId; separate: boolean } | null>(null);

  const results = useMemo(() => (run ? estimate(run.inputs) : null), [run]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const h = Number.parseInt(hours === "" ? "0" : hours, 10);
    const m = Number.parseInt(minutes === "" ? "0" : minutes, 10);
    const inputs: Inputs = {
      direction,
      passport,
      ees,
      party: Number.parseInt(party, 10),
      connectionMinutes: h * 60 + m,
      gateCloseMinutes: Number.parseInt(gate === "" ? "0" : gate, 10),
      bags,
      terminalChange,
      securityAgain,
      needsHelp,
    };
    const problem = validate(inputs);
    if (problem) {
      setError(problem);
      setRun(null);
      return;
    }
    setError(null);
    setRun({ inputs, when, separate });
    track("connection_check_estimate", {
      direction,
      passport_group: passport,
      scenario: when,
      separate_tickets: separate,
    });
  }

  function onReset() {
    setDirection("arriving");
    setPassport("noneu");
    setEes("first");
    setParty("1");
    setHours("2");
    setMinutes("0");
    setGate(String(DEFAULT_GATE_MINUTES));
    setBags(false);
    setTerminalChange(false);
    setSecurityAgain(false);
    setNeedsHelp(false);
    setWhen("typical");
    setSeparate(false);
    setError(null);
    setRun(null);
  }

  const chosen = results && run ? results.find((r) => r.id === run.when) : undefined;
  const chosenLabel = chosen ? SCENARIOS.find((s) => s.id === chosen.id)?.label.toLowerCase() : "";
  const showEesQuestion = direction === "arriving" && passport === "noneu";
  const firstTime = run
    ? run.inputs.passport === "noneu" && run.inputs.direction === "arriving" && run.inputs.ees === "first"
    : false;

  return (
    <main>
      <div className="wrap toolhead">
        <p className="eyebrow">Tool</p>
        <h1>Connection check</h1>
        <p className="lede">
          Changing planes into or out of Schengen? Estimate how much time border checks may need, and
          see how your connection holds up if the queue is quiet, typical or busy.
        </p>
        <p className="notice">
          A planning estimate, not a prediction. Queues change by the hour and by airport. Where we
          could not find a reported figure, the page says it is our assumption. Information, not
          travel advice. Your airline&apos;s own minimum connection time is a different figure.
        </p>
      </div>

      <StatStrip
        title="Why this tool exists."
        intro="Border queues at Schengen hubs became the weak point of a connection in 2026. These are the figures that shaped the estimate. They are press reports, not official statistics, and they are labelled that way below."
        stats={PAIN}
        note="Checked 01 Oct 2026."
      />

      <div className="wrap tool-grid" id="tool">
        <form className="card tool-form" onSubmit={onSubmit} noValidate>
          <h2>Your connection</h2>

          <fieldset className="choices">
            <legend>Where is the border check?</legend>
            <Choice
              name="direction"
              value="arriving"
              checked={direction === "arriving"}
              onChange={() => setDirection("arriving")}
              label="Arriving: I enter Schengen at this airport"
              hint="The first Schengen airport you land at."
            />
            <Choice
              name="direction"
              value="leaving"
              checked={direction === "leaving"}
              onChange={() => setDirection("leaving")}
              label="Leaving: I exit Schengen from this airport"
              hint="The last Schengen airport you leave from."
            />
          </fieldset>

          <fieldset className="choices">
            <legend>Your passport</legend>
            <Choice
              name="passport"
              value="noneu"
              checked={passport === "noneu"}
              onChange={() => setPassport("noneu")}
              label="Non-EU passport"
              hint="For example Canada, the US, the UK or Australia."
            />
            <Choice
              name="passport"
              value="eu"
              checked={passport === "eu"}
              onChange={() => setPassport("eu")}
              label="EU, EEA or Swiss passport"
            />
            <Choice
              name="passport"
              value="exempt"
              checked={passport === "exempt"}
              onChange={() => setPassport("exempt")}
              label="Non-EU, but exempt from EES registration"
              hint="For example some residence-permit holders. See the official exemptions list below."
            />
          </fieldset>

          {showEesQuestion ? (
            <fieldset className="choices">
              <legend>Your EES record</legend>
              <Choice
                name="ees"
                value="first"
                checked={ees === "first"}
                onChange={() => setEes("first")}
                label="First time, or a new passport"
                hint="Fingerprints and a photo are taken at the desk."
              />
              <Choice
                name="ees"
                value="returning"
                checked={ees === "returning"}
                onChange={() => setEes("returning")}
                label="Already registered on this passport"
                hint="A registration lasts three years or until the passport expires."
              />
            </fieldset>
          ) : null}

          <div className="field">
            <label htmlFor="cc-party">People travelling together who need the check</label>
            <select id="cc-party" value={party} onChange={(e) => setParty(e.target.value)}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <option key={n} value={String(n)}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <span className="lab" id="cc-time-label">
              Time between landing and your next departure
            </span>
            <div className="pair" role="group" aria-labelledby="cc-time-label">
              <div>
                <label className="sr-only" htmlFor="cc-hours">
                  Hours
                </label>
                <input
                  id="cc-hours"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={47}
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  aria-describedby="cc-time-hint"
                />
                <p className="hint">hours</p>
              </div>
              <div>
                <label className="sr-only" htmlFor="cc-minutes">
                  Minutes
                </label>
                <input
                  id="cc-minutes"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={59}
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  aria-describedby="cc-time-hint"
                />
                <p className="hint">minutes</p>
              </div>
            </div>
            <p className="hint" id="cc-time-hint">
              Use the scheduled landing and departure times. If your first flight runs late, run it
              again with the new time.
            </p>
          </div>

          <div className="field">
            <label htmlFor="cc-gate">Minutes before departure that the gate closes</label>
            <input
              id="cc-gate"
              type="number"
              inputMode="numeric"
              min={0}
              max={180}
              value={gate}
              onChange={(e) => setGate(e.target.value)}
              aria-describedby="cc-gate-hint"
            />
            <p className="hint" id="cc-gate-hint">
              Check your boarding pass or airline. We assume {DEFAULT_GATE_MINUTES} if you leave it.
            </p>
          </div>

          <fieldset className="choices">
            <legend>Extra steps in your connection</legend>
            <Check checked={bags} onChange={setBags} label="I must collect and re-check my bags" />
            <Check checked={terminalChange} onChange={setTerminalChange} label="I must change terminals" />
            <Check checked={securityAgain} onChange={setSecurityAgain} label="I go through security again" />
            <Check
              checked={needsHelp}
              onChange={setNeedsHelp}
              label="Someone in my party needs extra help (young children, reduced mobility)"
            />
          </fieldset>

          <fieldset className="choices">
            <legend>When will you reach the border check?</legend>
            {SCENARIOS.filter((s) => s.id !== "worst").map((s) => (
              <Choice
                key={s.id}
                name="when"
                value={s.id}
                checked={when === s.id}
                onChange={() => setWhen(s.id)}
                label={s.label}
                hint={s.hint}
              />
            ))}
          </fieldset>

          <fieldset className="choices">
            <legend>Your tickets</legend>
            <Choice
              name="tickets"
              value="one"
              checked={!separate}
              onChange={() => setSeparate(false)}
              label="One booking for both flights"
            />
            <Choice
              name="tickets"
              value="separate"
              checked={separate}
              onChange={() => setSeparate(true)}
              label="Separate bookings"
            />
          </fieldset>

          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}

          <div className="btns">
            <button className="btn solid" type="submit">
              Estimate
            </button>
            <button className="btn" type="button" onClick={onReset}>
              Reset
            </button>
          </div>
          <p className="hint">Nothing you type is sent or saved. It runs in your browser.</p>
        </form>

        <div className="card result" aria-live="polite">
          <h2>Estimate</h2>
          {!run || !results || !chosen ? (
            <p className="note">
              Fill in the form and press Estimate. You will see how your connection holds up in a quiet,
              typical and busy case, plus a stress test based on the longest waits reported in 2026.
            </p>
          ) : (
            <>
              <p className={`verdict v-${chosen.verdict}`}>{VERDICT_TEXT[chosen.verdict]}</p>
              <p className="sumline">
                You have <strong>{formatMinutes(run.inputs.connectionMinutes)}</strong>. In a {chosenLabel} case
                you may need about <strong>{formatMinutes(chosen.needed)}</strong>. Margin:{" "}
                <strong>{formatMinutes(chosen.margin)}</strong>.
              </p>

              {chosen.verdict === "ok" ? (
                <p className="note">
                  That leaves a cushion in this case. Check the busy and stress rows below before you rely on it.
                </p>
              ) : null}
              {chosen.verdict === "tight" ? (
                <p className="note">
                  This works only if nothing slips. A later connection, or fewer extra steps, would add room.
                </p>
              ) : null}
              {chosen.verdict === "short" ? (
                <p className="note">
                  The estimate is longer than your connection. Consider a later connection, or ask your
                  airline what it can offer before you travel.
                </p>
              ) : null}

              <div className="scroll">
                <table>
                  <caption>Your connection in each case</caption>
                  <thead>
                    <tr>
                      <th scope="col">Case</th>
                      <th scope="col">Border queue</th>
                      <th scope="col">You may need</th>
                      <th scope="col">Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <strong>{r.label}</strong>
                          <span className={`chip ${VERDICT_CLASS[r.verdict]}`}>{VERDICT_TEXT[r.verdict]}</span>
                        </td>
                        <td className="num">{formatMinutes(r.queue)}</td>
                        <td className="num">{formatMinutes(r.needed)}</td>
                        <td className="num">{formatMinutes(r.margin)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="sub-h">How the {chosenLabel} case adds up</h3>
              <ul className="lines">
                {chosen.lines.map((l) => (
                  <li key={l.label}>
                    <span>{l.label}</span>
                    <span className="m">{formatMinutes(l.minutes)}</span>
                    <BasisChip basis={l.basis} />
                    {l.note ? <small>{l.note}</small> : null}
                  </li>
                ))}
                <li className="total">
                  <span>Total, rounded up to the next 5 minutes</span>
                  <span className="m">{formatMinutes(chosen.needed)}</span>
                  <span />
                </li>
              </ul>

              {firstTime ? (
                <p className="note">
                  A first registration is the slowest trip. Later entries on the same passport are quicker.
                </p>
              ) : null}
              {run.inputs.passport === "eu" ? (
                <p className="note">
                  EU, EEA and Swiss passports are not registered in EES. We found no reliable queue data for
                  those lanes, so those numbers are our assumptions.
                </p>
              ) : null}
              {run.inputs.direction === "leaving" ? (
                <p className="note">
                  Exit checks also take time and come before boarding. We counted one passport check per
                  traveller.
                </p>
              ) : null}
              <p className="note">
                {run.separate
                  ? "On separate bookings, check what each airline will do if you miss the second flight before you rely on this connection."
                  : "On one booking, ask your airline how it handles a missed connection, so you know before you travel."}
              </p>
            </>
          )}
        </div>
      </div>

      <section className="band" id="what-we-know">
        <div className="wrap">
          <h2 className="s">What we know, and where it comes from.</h2>
          <p className="sub">
            Official sources are labelled. Press reports are labelled too, because they are not the same
            thing. Checked {CHECKED}.
          </p>
          <div className="card">
            <table>
              <caption>Facts behind the estimate</caption>
              <thead>
                <tr>
                  <th scope="col">Fact</th>
                  <th scope="col">Source type</th>
                  <th scope="col" className="date">
                    Checked
                  </th>
                </tr>
              </thead>
              <tbody>
                {FACTS.map((f) => (
                  <tr key={f.title}>
                    <td>
                      <strong>{f.title}</strong>
                      {f.body}
                      <span className="src">
                        Sources:{" "}
                        {f.sources.map((s, i) => (
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
                      <span className={`chip ${f.status}`}>{f.status === "ok" ? "Official source" : "Press report"}</span>
                    </td>
                    <td className="date">{CHECKED}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="band" id="assumptions">
        <div className="wrap">
          <h2 className="s">The numbers inside the estimate.</h2>
          <p className="sub">
            Every figure the tool uses is listed here, with whether it is reported or our own assumption.
            Minutes, rounded.
          </p>
          <div className="card">
            <div className="scroll">
              <table>
                <caption>Minutes used by the estimate</caption>
                <thead>
                  <tr>
                    <th scope="col">Step</th>
                    {SCENARIOS.map((s) => (
                      <th scope="col" key={s.id}>
                        {s.label}
                      </th>
                    ))}
                    <th scope="col">Basis</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>Border queue, non-EU lane</strong>
                    </td>
                    {SCENARIOS.map((s) => (
                      <td className="num" key={s.id}>
                        {QUEUE.ees[s.id].minutes}
                      </td>
                    ))}
                    <td>
                      <span className="chip ok">Reported</span> <span className="chip unc">Our assumption</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Border queue, EU, EEA or Swiss lane</strong>
                    </td>
                    {SCENARIOS.map((s) => (
                      <td className="num" key={s.id}>
                        {QUEUE.noees[s.id].minutes}
                      </td>
                    ))}
                    <td>
                      <span className="chip unc">Our assumption</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>First registration, per person</strong>
                    </td>
                    {SCENARIOS.map((s) => (
                      <td className="num" key={s.id}>
                        {REG_FIRST[s.id]}
                      </td>
                    ))}
                    <td>
                      <span className="chip ok">Reported range</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Repeat or exit check, per person</strong>
                    </td>
                    {SCENARIOS.map((s) => (
                      <td className="num" key={s.id}>
                        {CHECK_REPEAT}
                      </td>
                    ))}
                    <td>
                      <span className="chip unc">Our assumption</span>
                    </td>
                  </tr>
                  {Object.values(STEPS).map((st) => (
                    <tr key={st.label}>
                      <td>
                        <strong>{st.label}</strong>
                      </td>
                      <td className="num" colSpan={SCENARIOS.length}>
                        {st.minutes}
                      </td>
                      <td>
                        <span className="chip unc">Our assumption</span>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td>
                      <strong>Gate closes before departure</strong>
                    </td>
                    <td className="num" colSpan={SCENARIOS.length}>
                      {DEFAULT_GATE_MINUTES} unless you enter your own
                    </td>
                    <td>
                      <span className="chip unc">Our assumption</span> <span className="chip sched">You entered</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
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
              It does not know the live queue at your airport. Some third-party services, for example
              FlightQueue, publish live and modelled waits per airport. We do not.
            </p>
            <p>
              It does not know your airline&apos;s minimum connection time, which is the shortest time the
              airline will sell. A connection that meets it can still be too short on a busy day.
            </p>
            <p>
              It does not tell you whether you can stay airside, or whether you need a transit visa. Ask
              your airline, and check the official sources above.
            </p>
            <p>
              Nothing you type is sent or saved. The site records only that the tool was used, through
              Google Analytics, as described in the <a href="/privacy-policy">privacy policy</a>.
            </p>
            <details>
              <summary>Schengen countries ({SCHENGEN_COUNTRIES.length})</summary>
              <p>{SCHENGEN_COUNTRIES.join(", ")}.</p>
              <p>
                Confirm the current list on the{" "}
                <a href="https://www.gov.uk/guidance/eu-entryexit-system" rel="noopener noreferrer" target="_blank">
                  UK government EES page
                </a>
                .
              </p>
            </details>
          </div>
        </div>
      </section>
    </main>
  );
}
