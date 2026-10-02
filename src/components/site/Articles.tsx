import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ARTICLES } from "@/lib/articles-data";
import { formatDate, relatedArticles, type Article } from "@/lib/articles";

const STATUS_LABEL = { ok: "In force", unc: "Unconfirmed", sched: "Scheduled" } as const;
const KIND_LABEL = { guide: "Guide", update: "Update" } as const;

export function ArticleCards({ items }: { items: Article[] }) {
  return (
    <ul className="article-grid">
      {items.map((a) => (
        <li key={a.slug}>
          <a href={`/articles/${a.slug}`}>
            <span className="kind">{KIND_LABEL[a.kind]}</span>
            <h3>{a.title}</h3>
            <p>{a.description}</p>
            <span className="meta">Checked {formatDate(a.checked)}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export function ArticleList() {
  const guides = ARTICLES.filter((a) => a.kind === "guide");
  const updates = ARTICLES.filter((a) => a.kind === "update");
  return (
    <main>
      <div className="wrap toolhead">
        <p className="eyebrow">Articles</p>
        <h1>Travel rules, explained and sourced</h1>
        <p className="lede">
          Guides and dated updates on flight compensation, EES, ETIAS and travel insurance appeals. Each one opens with
          its source, shows the day we checked it, and links to the matching tool. Legal information, not legal advice.
        </p>
      </div>
      {guides.length > 0 ? (
        <section className="band" id="guides">
          <div className="wrap">
            <h2 className="s">Guides.</h2>
            <p className="sub">Evergreen explainers. We change the checked date only after re-reading the sources.</p>
            <ArticleCards items={guides} />
          </div>
        </section>
      ) : null}
      {updates.length > 0 ? (
        <section className="band" id="updates">
          <div className="wrap">
            <h2 className="s">Updates.</h2>
            <p className="sub">Dated explainers on events and rule changes, with what is confirmed and what is not.</p>
            <ArticleCards items={updates} />
          </div>
        </section>
      ) : null}
      {ARTICLES.length === 0 ? (
        <div className="wrap">
          <p className="note">No articles have been published yet.</p>
        </div>
      ) : null}
    </main>
  );
}

export function ArticleView({ article }: { article: Article }) {
  const related = relatedArticles(ARTICLES, article);
  return (
    <main>
      <article>
        <div className="wrap toolhead">
          <nav className="crumbs" aria-label="Breadcrumb">
            <a href="/">Home</a>
            <span aria-hidden="true"> / </span>
            <a href="/articles">Articles</a>
          </nav>
          <p className="eyebrow">{KIND_LABEL[article.kind]}</p>
          <h1>{article.title}</h1>
          <p className="lede">{article.description}</p>
          <p className="art-meta">
            <span className={`chip ${article.status}`}>{STATUS_LABEL[article.status]}</span>
            <span>Checked {formatDate(article.checked)}</span>
            <span>Published {formatDate(article.published)}</span>
            <span>{article.minutes} min read</span>
          </p>
          <p className="notice">
            We are not lawyers. This is legal information, not legal advice, and we are not liable for how you use it.
            Official sources and the decisions of regulators and courts come first. Read the{" "}
            <a href="/disclaimer">disclaimer</a>.
          </p>
        </div>
        <div className="wrap">
          <div className="prose">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children }) =>
                  href && /^https?:\/\//.test(href) ? (
                    <a href={href} rel="noopener noreferrer" target="_blank">
                      {children}
                    </a>
                  ) : (
                    <a href={href}>{children}</a>
                  ),
                table: ({ children }) => (
                  <div className="scroll">
                    <table>{children}</table>
                  </div>
                ),
              }}
            >
              {article.body}
            </ReactMarkdown>
          </div>
        </div>
        <section className="band" id="sources">
          <div className="wrap">
            <h2 className="s">Sources.</h2>
            <p className="sub">Checked {formatDate(article.checked)}. Where we could only find press reports, the text says so.</p>
            <ul className="plain-list">
              {article.sources.map((s) => (
                <li key={s.href}>
                  <a href={s.href} rel="noopener noreferrer" target="_blank">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
            {article.tool ? (
              <p>
                <a className="btn solid" href={article.tool.href}>
                  {article.tool.label}
                </a>
              </p>
            ) : null}
          </div>
        </section>
        {related.length > 0 ? (
          <section className="band" id="more">
            <div className="wrap">
              <h2 className="s">More articles.</h2>
              <ArticleCards items={related} />
            </div>
          </section>
        ) : null}
      </article>
    </main>
  );
}
