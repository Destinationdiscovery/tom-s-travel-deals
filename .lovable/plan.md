
## Add New Compass Article: Canadian At-Par Deal in Las Vegas

### Overview
Add a new article to The Compass section about the Canadian at-par deal in Las Vegas. This involves copying one of the uploaded images to the assets folder and adding the new article to the compassArticles data file.

---

### Task 1: Copy Vegas Image to Assets

**Action:** Copy the uploaded Vegas Strip image (the one with the Bellagio fountains) to the project assets folder.

**File path:** `src/assets/vegas-strip-hero.jpg`

**Source:** The second uploaded image showing the Strip with the Bellagio fountains at night - this is visually striking and perfect for an article about Las Vegas.

---

### Task 2: Add New Article to compassArticles.ts

**File:** `src/data/compassArticles.ts`

**Changes:**

1. Add a new import at the top:
```typescript
import vegasStripImg from "@/assets/vegas-strip-hero.jpg";
```

2. Add a new article object to the `compassArticles` array (as id: 6):

```typescript
{
  id: 6,
  slug: "canadian-at-par-deal-las-vegas",
  title: "The Canadian At-Par Deal in Las Vegas: What It Is, Who It's For, and Why I'm Not Sure It Changes Much",
  category: "Deals",
  categoryColor: "bg-rose-500",
  image: vegasStripImg,
  excerpt: "A few downtown Las Vegas casinos are accepting Canadian dollars at par, but is it really worth changing your travel plans for?",
  author: "Tom Laracy",
  datePublished: "January 26, 2025",
  readTime: "7 min read",
  content: [
    "Every summer or so, a Vegas deal pops up that gets Canadians talking again. This year, it is the Canadian at-par offer in downtown Las Vegas, where a few casinos are accepting Canadian dollars at face value instead of U.S. dollars.",
    "On the surface, it sounds generous. With the Canadian dollar where it is right now, paying 1:1 instead of eating the exchange feels like a win. But once you dig into the details, I am not convinced this deal actually moves the needle for most Canadians, or that it is meant to.",
    "Through August 31, three downtown Las Vegas casinos are accepting Canadian currency at par for certain expenses. The participating properties are Circa Resort and Casino, The D Las Vegas, and Golden Gate Hotel and Casino.",
    "If you are Canadian and show a valid Canadian passport or government-issued ID, those properties will treat your Canadian dollars as if they were U.S. dollars for hotel room rates, drinks, and select slot play up to $500 on participating machines.",
    "With the exchange rate hovering around $1 USD to roughly $1.37 CAD at the time of writing, the potential savings are real, at least on paper. The offer also extends to BarCanada, a hockey-themed bar in Las Vegas that is owned by the same group.",
    "The push is coming from Derek Stevens, the CEO who owns all three properties. He has been open about having personal ties to Canada, including the fact that his father studied at the University of Toronto, and he has said that connection played a role in launching the promotion.",
    "So this is not a city-wide tourism initiative. It is a targeted offer from one ownership group, aimed squarely at Canadian visitors they already know and value.",
    "This is where my skepticism comes in. First, all three casinos are in downtown Las Vegas, not on the Strip. Downtown has its fans, and I have enjoyed it myself, but it is a very specific Vegas experience. If someone already prefers newer Strip resorts, this deal probably does not factor into their decision at all.",
    "Second, I do not see many Canadians deciding to go to Vegas because of this. If someone was not already planning a Vegas trip, I doubt accepting Canadian dollars at par suddenly tips the scales. At best, it makes an existing plan feel a bit easier to justify.",
    "It feels much more like a retention perk for people who already travel to Vegas than a true incentive to bring in new visitors.",
    "There is also a broader reality here. Canadians, in general, are not travelling to the U.S. the way they once did. Exchange rates, higher costs, and changing travel habits have pushed a lot of people toward other destinations entirely.",
    "Vegas is also a very specific kind of trip. If that style of travel is not already appealing, a currency deal alone probably is not enough to overcome the bigger reasons people are staying away.",
    "In that sense, the at-par promotion feels less like a growth strategy and more like a way to soften the blow for Canadians who were already on the fence.",
    "That said, I do not think the deal is pointless. If you are already planning a Vegas trip this summer, comfortable staying downtown, and planning to spend money on drinks or slots anyway, then being able to pay in Canadian dollars at par is a genuine perk.",
    "It simplifies budgeting and can shave a noticeable amount off your overall spend, especially over several days. It is just not something I would chase or let dictate where I travel.",
    "For me, this falls firmly into the nice if it lines up category. I would not plan a Vegas trip around it, and I would not book downtown just for the currency angle. But if I were already going, already staying at one of these properties, and already planning to spend time on the casino floor, I would take advantage of it without hesitation.",
    "The Canadian at-par deal in Las Vegas is a real offer with real savings, but its impact is narrower than the headlines suggest. It is limited to three downtown casinos, runs only through August 31, and is unlikely to convince Canadians who were not already planning a Vegas trip. For the right traveler, at the right time, it is a solid bonus. For everyone else, it is more of an interesting footnote than a reason to book a flight."
  ]
}
```

---

### Article Details

| Field | Value |
|-------|-------|
| **ID** | 6 |
| **Slug** | `canadian-at-par-deal-las-vegas` |
| **Title** | The Canadian At-Par Deal in Las Vegas: What It Is, Who It's For, and Why I'm Not Sure It Changes Much |
| **Category** | Deals |
| **Category Color** | `bg-rose-500` (a warm rose/red that fits Vegas vibes) |
| **Excerpt** | A few downtown Las Vegas casinos are accepting Canadian dollars at par, but is it really worth changing your travel plans for? |
| **Author** | Tom Laracy |
| **Date Published** | January 26, 2025 |
| **Read Time** | 7 min read |
| **Paragraphs** | 17 content paragraphs |

---

### Files to Modify

| File | Action |
|------|--------|
| `src/assets/vegas-strip-hero.jpg` | Copy uploaded Vegas image with Bellagio fountains |
| `src/data/compassArticles.ts` | Add import + new article object to array |

---

### Result
The new article will automatically appear in:
- The Compass carousel on the homepage
- The Compass page listing all articles
- Be accessible at `/compass/canadian-at-par-deal-las-vegas`
- Show in the "Related Articles" section of other Compass articles
