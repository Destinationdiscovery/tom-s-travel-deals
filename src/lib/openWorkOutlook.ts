/**
 * Opens Outlook Web (Office 365) compose window with pre-filled fields.
 * Works on Linux and all platforms via browser.
 */
export const openWorkOutlook = (to: string, subject: string, body: string) => {
  const params = new URLSearchParams();
  if (to) params.append('to', to);
  if (subject) params.append('subject', subject);
  if (body) params.append('body', body);
  const url = `https://outlook.office.com/mail/deeplink/compose?${params.toString()}`;
  window.open(url, '_blank');
};

/**
 * Opens Outlook Web inbox.
 */
export const openOutlookInbox = () => {
  window.open('https://outlook.office.com/mail', '_blank');
};
