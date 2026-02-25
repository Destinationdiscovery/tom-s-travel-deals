

# Plan: Add Dismiss to Dashboard Notifications

Add dismiss buttons to the "Today's Events" and "Urgent Deadlines" notification cards so you can close them for the current session.

## Approach
- Add a `dismissedCards` state (session-only, resets on page reload) tracking which cards are dismissed
- Add an X button to the top-right of both the "Today" card and the "Urgent — Due Within 3 Days" card
- Clicking X hides that card for the session

## File Changes

| File | Change |
|------|--------|
| `src/components/dashboard/DashboardOverview.tsx` | Add `X` import from lucide-react, add `dismissedCards` state, add dismiss buttons to Today and Urgent cards, wrap each in dismiss check |

### Details
- Import `X` from lucide-react
- Add `const [dismissedCards, setDismissedCards] = useState<Set<string>>(new Set())`
- Helper: `const dismissCard = (id: string) => setDismissedCards(prev => new Set(prev).add(id))`
- Wrap Today card: `{!dismissedCards.has("today") && todayEvents.length > 0 && ...}`
- Wrap Urgent card: `{!dismissedCards.has("urgent") && urgentDeadlines.length > 0 && ...}`
- Add a small X button next to the Outlook button on urgent card, and top-right of today card

