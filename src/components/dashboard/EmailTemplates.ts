export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export const emailTemplates: EmailTemplate[] = [
  {
    id: "quote",
    name: "Quote Email",
    subject: "Your Vacation Quote, {resortName}",
    body: `Hi {clientName},

Thank you for reaching out! I'm excited to share your personalized vacation quote.

Resort: {resortName}
Destination: {destination}
Dates: {checkIn} to {checkOut}
Travellers: {numTravellers}
Total Price: {totalPrice}

{quoteLink}

Please review the details and let me know if you'd like to make any adjustments or if you have any questions.

Looking forward to helping you book the perfect getaway!

Best regards`,
  },
  {
    id: "followup",
    name: "Follow-Up",
    subject: "Following Up on Your Vacation Quote, {resortName}",
    body: `Hi {clientName},

I wanted to follow up on the vacation quote I sent over recently for {resortName}.

Have you had a chance to review it? I'd love to answer any questions or make adjustments to better fit your plans.

Just a reminder, availability and pricing can change, so it's best to lock in your dates soon!

Let me know how you'd like to proceed.

Best regards`,
  },
  {
    id: "pre_departure",
    name: "Pre-Departure",
    subject: "Your Trip to {destination}. Everything You Need to Know!",
    body: `Hi {clientName},

Your trip is almost here! Here are some important reminders before you go:

✈️ Flight Details: Please double-check your flight times and ensure your travel documents are ready.
🏨 Hotel: {resortName}
📅 Dates: {checkIn} to {checkOut}

A few tips:
- Arrive at the airport at least 2-3 hours before your flight
- Keep a copy of your booking confirmation handy
- Don't forget travel insurance documents

Have an amazing trip! Feel free to reach out if you need anything.

Best regards`,
  },
  {
    id: "after_trip",
    name: "After-Trip Feedback",
    subject: "Welcome Back! How Was Your Trip to {destination}?",
    body: `Hi {clientName},

Welcome home! I hope you had an incredible time at {resortName} in {destination}.

I'd love to hear how everything went, your feedback helps me continue to provide the best travel experiences.

A few quick questions:
- How was the resort and room?
- Did the flights go smoothly?
- Would you recommend this destination to others?

Also, if you're already thinking about your next getaway, I'm here to help plan it!

Best regards`,
  },
];

export function fillTemplate(template: EmailTemplate, data: Record<string, string>): { subject: string; body: string } {
  let subject = template.subject;
  let body = template.body;
  for (const [key, value] of Object.entries(data)) {
    const placeholder = `{${key}}`;
    subject = subject.split(placeholder).join(value);
    body = body.split(placeholder).join(value);
  }
  return { subject, body };
}
