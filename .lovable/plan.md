
User wants:
1. Ensure 3 most recent Compass articles appear on the homepage (BlogPreviewSection already exists - need to verify it pulls from DB and shows latest 3).
2. Move the blog/Compass section on the homepage to appear right under the Tools section (ToolsDirectorySection).

Let me check current order in Index.tsx:
- ToolsDirectorySection
- TravelDealsSection
- BlogPreviewSection  ← currently here
- TestimonialsSection
- AboutPreviewSection
- HomepageFAQ

Target order:
- ToolsDirectorySection
- BlogPreviewSection  ← move here
- TravelDealsSection
- TestimonialsSection
- AboutPreviewSection
- HomepageFAQ

I should also verify BlogPreviewSection actually fetches from DB and shows the 3 most recent articles (mixing DB + static, sorted by date). Let me check it.
