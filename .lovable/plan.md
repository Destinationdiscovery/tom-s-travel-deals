

## Fix Page Navigation Scroll Position

### The Problem
When you click on links to articles, reviews, contact, or any other page, the browser maintains its current scroll position instead of starting at the top of the new page. This is default React Router behavior that needs to be overridden.

### The Solution
Create a simple `ScrollToTop` component that automatically scrolls to the top of the page whenever you navigate to a new route.

---

### What Will Be Created

**New File: `src/components/ScrollToTop.tsx`**

A small component that:
- Listens for URL changes using React Router's `useLocation` hook
- Instantly scrolls the window to the top when the URL changes
- Renders nothing visible (returns `null`)

---

### What Will Be Modified

**File: `src/App.tsx`**

- Import the new `ScrollToTop` component
- Add it inside the `BrowserRouter` component (required so it can detect route changes)

---

### How It Works

```text
User clicks link → URL changes → ScrollToTop detects change → Window scrolls to top → New page displays from top
```

---

### Result
After this fix, every time you navigate to a new page (articles, reviews, contact, destinations, etc.), the page will automatically start at the top instead of wherever you were scrolled on the previous page.

