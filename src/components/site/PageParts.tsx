import type { FaqItem, Term } from "@/lib/faq";

export function QuickAnswers({ items }: { items: string[] }) {
  return (
    <aside className="quick" aria-label="Quick answers">
      <p className="lab">Quick answers</p>
      <ul>
        {items.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </aside>
  );
}

export function Faq({ title, intro, items }: { title: string; intro?: string; items: FaqItem[] }) {
  return (
    <section className="band" id="faq" aria-labelledby="faq-title">
      <div className="wrap">
        <h2 className="s" id="faq-title">
          {title}
        </h2>
        {intro ? <p className="sub">{intro}</p> : null}
        <div className="faq">
          {items.map((f) => (
            <div className="faq-item" key={f.q}>
              <h3>{f.q}</h3>
              <p>{f.a}</p>
              {f.sources && f.sources.length > 0 ? (
                <span className="src">
                  Sources:{" "}
                  {f.sources.map((s, i) => (
                    <span key={s.href}>
                      {i > 0 ? ", " : ""}
                      <a href={s.href} rel="noopener noreferrer" target="_blank">
                        {s.label}
                      </a>
                    </span>
                  ))}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Glossary({ title = "Terms used on this page.", terms }: { title?: string; terms: Term[] }) {
  return (
    <section className="band" id="terms" aria-labelledby="terms-title">
      <div className="wrap">
        <h2 className="s" id="terms-title">
          {title}
        </h2>
        <dl className="glossary">
          {terms.map((t) => (
            <div key={t.term}>
              <dt>{t.term}</dt>
              <dd>{t.meaning}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

const ALL: { path: string; name: string; text: string }[] = [
  { path: "/flight-claims", name: "Flight claim guide", text: "Delayed or cancelled flight: rules, amounts, deadlines and wording." },
  { path: "/insurance-appeal", name: "Insurance appeal pack", text: "Travel insurer denied your costs: build an appeal from your policy wording." },
  { path: "/connection-check", name: "Connection check", text: "Changing planes in Schengen: how much time EES checks may need." },
  { path: "/articles", name: "Articles", text: "Guides and dated updates, each with its source." },
  { path: "/#ledger", name: "Rules ledger", text: "Every rule with its source, status and the day we checked it." },
  { path: "/corrections", name: "Corrections", text: "What we got wrong and when we fixed it." },
];

export function Related({ current }: { current: string }) {
  const items = ALL.filter((i) => i.path !== current);
  return (
    <section className="band" id="related" aria-labelledby="related-title">
      <div className="wrap">
        <h2 className="s" id="related-title">
          More on reviewthengo.
        </h2>
        <ul className="related">
          {items.map((i) => (
            <li key={i.path}>
              <a href={i.path}>{i.name}</a>
              <span>{i.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
