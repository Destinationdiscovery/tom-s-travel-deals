PHASE 1: THE NEW REVIEWTHENGO HOME PAGE AND SHELL

What is in this zip (14 files plus this note, all at their repo paths):
  src/styles.css                       new design (replaces the old one)
  src/routes/__root.tsx                new site-wide head, header and footer; old branding removed
  src/routes/index.tsx                 the new home page
  src/routes/privacy-policy.tsx        privacy page (your old text, updated for the new site)
  src/routeTree.gen.ts                 route list (adds /privacy-policy)
  src/components/site/SiteHeader.tsx
  src/components/site/SiteFooter.tsx
  src/components/site/AlertForm.tsx    the email boxes (saves to your existing subscribers list)
  src/lib/site.ts                      one place for your contact email (optional)
  scripts/generate-sitemap.ts          sitemap now lists only pages that exist
  public/sitemap.xml, robots.txt, llms.txt, article-urls.txt   cleaned of old pages

HOW TO APPLY:
  1. Unzip. You will see three folders: src, public, scripts.
  2. In your GitHub repo: Add file > Upload files. Drag the src, public and scripts folders in.
     GitHub keeps the folder paths and replaces files that already exist.
  3. Commit to main.
  4. Wait for Lovable to sync, then look at the PREVIEW (not the published site yet).

WHAT YOU SHOULD SEE IN THE PREVIEW:
  - Pale grey-green page, "Review the rules, then go." headline, a ledger table on the right
  - Clicking "Privacy" in the footer opens a privacy page
  - On the home page, one email box in the dark card and one in each of the two lighter cards

IF IT SHOWS AN ERROR, send me the exact message. To undo, revert the commit in GitHub.

TEST THE EMAIL BOX (about a minute): enter one of your own addresses in the dark card and press
"Notify me". You should see "Thanks. You are on the list." Tell me, and I will check that it was saved.
You will also get your usual "New Subscriber" email.

WHEN THE PREVIEW LOOKS RIGHT: click Publish in Lovable.

LATER (optional): open src/lib/site.ts in GitHub and put a contact email between the quotes.
