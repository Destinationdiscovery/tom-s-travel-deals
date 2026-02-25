/**
 * Opens a URL in a new tab with noopener/noreferrer to avoid
 * Cross-Origin-Opener-Policy blocks (e.g. Microsoft Outlook).
 */
export const openExternal = (url: string) => {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
