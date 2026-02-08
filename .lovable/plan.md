

## Update Google Places API Key

A quick one-step change: replace the currently stored API key with your new one.

### What will happen

1. Update the `GOOGLE_PLACES_API_KEY` secret stored in your backend with the new key you provided
2. Test the places autocomplete function to confirm the 403 error is resolved
3. Test the generate-review function to confirm photo fetching works

### Important security note

Your API key is now visible in this chat. After confirming it works, you should consider rotating it later if you share this chat with anyone. For now, the key will be securely stored as a backend secret and never exposed in your frontend code.

### Technical Details

- Tool used: `add_secret` to update `GOOGLE_PLACES_API_KEY` with value `AIzaSyAQM4tiDA5CwsYxVRx4JdnS_HfuG3BjEeU`
- Then call `places-autocomplete` edge function with a test query to verify it returns suggestions instead of a 403 error
- Then call `generate-review` to verify photos are fetched successfully

