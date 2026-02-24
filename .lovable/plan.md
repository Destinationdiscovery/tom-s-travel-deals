

# Wider Public Quote + Simplified Email with Link

## Two Changes

### 1. Make the Public Quote page wider
The public quote at `/quote/:token` currently uses `max-w-2xl` (672px), which squishes the review and trip details card. This will be changed to `max-w-5xl` (1024px) so it displays at a width much closer to what you see in the builder preview.

### 2. Simplify all email options to a brief intro + "Click Here" link
Instead of dumping the full quote details into the email body, all email methods (Outlook, Gmail, Yahoo, Send Direct) will send a short, friendly message like:

> Hi Pat & Holly,
>
> Your vacation quote for **Hotel Sonya** in **Rome, Italy** is ready!
>
> **[View Your Quote](link)**
>
> Let me know if you have any questions!
>
> Best regards,
> Tom Laracy - TravelOnly

The quote must be saved first (to generate a share link) before sending -- if not saved yet, the user will be prompted to save first.

## Technical Details

### File: `src/pages/PublicQuote.tsx`
- Change `max-w-2xl` to `max-w-5xl` on the container div (line 62)

### File: `src/components/dashboard/QuotePreview.tsx`
- Simplify `emailBody` (plain text) to a brief 3-4 line message with the share URL
- Simplify `buildHtmlEmail()` to a clean, branded HTML email with just the resort name, destination, dates summary, and a prominent "View Your Quote" button linking to the share URL
- Remove all the detailed pricing tables, line items, and inclusions from the email
- Add a guard on all email actions: if the quote hasn't been saved yet (no `shareUrl`), show a toast prompting to save first instead of sending
