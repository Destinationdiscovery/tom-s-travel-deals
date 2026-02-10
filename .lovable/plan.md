

## Migrate from Netlify to Lovable Cloud Hosting

Since your project already runs on Lovable Cloud, this is mostly cleanup -- removing Netlify-specific config and updating your deployment workflow.

### What to do

1. **Delete `public/_redirects`** -- This file is a Netlify-specific SPA routing rule. Lovable's hosting handles client-side routing natively, so this file is unnecessary.

2. **Update project knowledge** -- The project has two memory notes referencing Netlify:
   - `infrastructure/deployment-lock-config` (auto-deployments locked on Netlify)
   - `infrastructure/netlify-routing` (SPA fallback via `_redirects`)
   
   Both should be updated or removed since Netlify will no longer be part of the workflow. You can do this in **Project Settings → Knowledge**.

3. **Custom domain (if applicable)** -- If you have a custom domain currently pointing at Netlify:
   - Go to **Project Settings → Domains → Connect Domain**
   - Update your DNS provider:
     - A record for `@` → `185.158.133.1`
     - A record for `www` → `185.158.133.1`
     - TXT record as instructed by Lovable
   - SSL is provisioned automatically
   - Remove the domain from your Netlify dashboard

4. **Deployment workflow going forward** -- Instead of pushing to Netlify, just click **Publish** in Lovable (top-right on desktop, or `...` menu on mobile). Backend changes (edge functions, database) already deploy automatically.

### Files to change

| File | Change |
|---|---|
| `public/_redirects` | Delete entirely -- not needed on Lovable hosting |

### Manual steps (outside code)

- Update or remove the two Netlify-related knowledge entries in Project Settings → Knowledge
- If using a custom domain: update DNS records at your registrar and remove the site from Netlify
- Decommission your Netlify project once DNS has propagated

