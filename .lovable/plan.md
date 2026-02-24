
# Add "News" and "Other" Categories to Blog Post Creator

## Changes

**File:** `src/components/dashboard/BlogPostCreator.tsx`

1. Add "News" to the existing CATEGORIES array
2. Add an "Other" option that, when selected, shows a text input so you can type a custom category name
3. Add a `customCategory` state variable that stores the typed value when "Other" is selected

## How It Works

- The category dropdown will now include: Guides, Packing, Budget, Insurance, Timing, Travel Tips, **News**, **Other**
- When you pick any preset category, it works exactly as before
- When you pick "Other", a text input appears below the dropdown where you can type your own category name (e.g. "Luxury", "Adventure", etc.)
- The custom category will be saved to the database just like the preset ones
- A default color (`bg-gray-500`) will be used for custom categories

## Technical Details

- Add `{ label: "News", color: "bg-rose-500" }` and `{ label: "Other", color: "bg-gray-500" }` to the `CATEGORIES` array
- Add `const [customCategory, setCustomCategory] = useState("")` state
- When "Other" is selected, show an `<Input>` field for the custom name
- In `handlePublish`, resolve the final category: if category is "Other", use `customCategory` instead
- Reset `customCategory` in `resetForm()`
