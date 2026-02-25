/**
 * Opens a URL in a new tab, fully detached from the current browsing context
 * to avoid Cross-Origin-Opener-Policy blocks (e.g. Microsoft Outlook).
 */
export const openExternal = (url: string) => {
  const w = window.open('about:blank', '_blank');
  if (w) {
    w.opener = null;
    w.location.href = url;
  } else {
    // Fallback if popup blocked
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};
