

# Plan: Fix Muted Text in PDF/Print Output

## Root Cause

The quote preview uses Tailwind's `prose dark:prose-invert` classes and `text-muted-foreground` throughout. When you print/save as PDF:

1. **Dark mode issue**: `dark:prose-invert` makes text light gray — the print CSS sets `body { color: black }` but Tailwind's prose classes have higher specificity and override it
2. **Muted foreground**: Elements using `text-muted-foreground` render in gray even in print, since `--muted-foreground` resolves to a washed-out color

The screenshot confirms this — all body text appears in light gray instead of solid black.

## Fix

Add targeted print overrides in `src/index.css` to force all text inside `#quote-preview` to render in high-contrast black:

```css
@media print {
  #quote-preview,
  #quote-preview *,
  .prose,
  .prose * {
    color: black !important;
    -webkit-print-color-adjust: exact;
  }
  
  #quote-preview h1, #quote-preview h2, #quote-preview h3,
  #quote-preview h4, #quote-preview h5, #quote-preview h6 {
    color: black !important;
    font-weight: 700 !important;
  }
}
```

This ensures all prose text, headings, and muted-foreground elements print as solid black regardless of dark/light mode.

| File | Change |
|------|--------|
| `src/index.css` | Add `color: black !important` overrides for `#quote-preview` and `.prose` elements inside `@media print` |

