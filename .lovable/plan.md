

The user wants to ensure affiliate links (and any other markdown links) render as clickable hyperlinks in published blog articles, without showing raw markdown syntax like `[text](url)`.

Let me check the current renderer to understand what needs patching.

From the CompassArticle.tsx code I already have in context, the `renderContentBlock` function for `text` type is:

```tsx
case "text":
default:
  return (
    <p key={index} className="text-foreground/90 leading-relaxed mb-6">
      {text}
    </p>
  );
```

This dumps raw text — so `[book this resort](https://...)` would display as literal markdown. Same for headings (though links in headings are less common).

I also need to handle:
- **Bold** `**text**` 
- *Italic* `*text*`
- Links `[text](url)` — must render as `<a target="_blank" rel="sponsored noopener">`

Let me design this concisely.

# Make Markdown Links Clickable in Blog Articles

## Problem
Currently `CompassArticle.tsx` renders text blocks as raw strings inside a `<p>`. So when the AI writes `[book this resort](https://expedia.com/...)`, readers see literal brackets and parentheses instead of a clickable link.

## Fix
Add a small markdown-to-React parser to the `renderContentBlock` text/heading branches that converts:
- `[anchor text](url)` → `<a href="url" target="_blank" rel="sponsored noopener">anchor text</a>`
- `**bold**` → `<strong>bold</strong>`
- `*italic*` → `<em>italic</em>`

Affiliate links (the most important case) get `rel="sponsored noopener"` for Google compliance. Internal links (relative `/...` URLs) get `rel="noopener"` only.

## Files Changed

| File | Change |
|------|--------|
| `src/pages/CompassArticle.tsx` | Add `renderInlineMarkdown()` helper that parses links + bold + italic. Use it inside the `text` and `heading` branches of `renderContentBlock`. |

## Implementation Notes
- Use a simple regex tokenizer (no heavy markdown library needed) that walks the string and emits React fragments
- Links open in new tab with `target="_blank"`
- Affiliate-style external URLs get `rel="sponsored noopener noreferrer"`
- Styled with `text-primary underline underline-offset-2 hover:opacity-80` to match site theme

That's it — single file, focused fix. After this, every affiliate link the Content Studio injects will render as a proper clickable, SEO-compliant hyperlink.

