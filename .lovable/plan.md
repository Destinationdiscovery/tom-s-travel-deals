
# Fix Mobile Dashboard Sidebar

## Problem
On mobile, the sidebar always shows and takes up half the screen, pushing the main content off to the right. There's no way to collapse or dismiss it.

## Solution
On mobile (below 768px), replace the always-visible sidebar with a hamburger menu button that opens the sidebar as a slide-in Sheet overlay. On desktop, the sidebar stays as-is.

## What Changes

### `src/components/dashboard/DashboardSidebar.tsx`
- Import `Sheet`, `SheetContent`, `SheetTrigger` from the existing UI components and `useIsMobile` hook
- Accept a new `open` / `onOpenChange` prop pair for controlling the sheet
- On mobile: render sidebar content inside a `Sheet` with a hamburger (`Menu`) icon trigger
- On desktop: render the sidebar as it is today
- When a tab is tapped on mobile, auto-close the sheet

### `src/pages/GearAdmin.tsx`
- Add `sidebarOpen` state
- Pass it to `DashboardSidebar`
- On mobile, the main content area gets full width and a bit of top padding for the floating menu button

No new dependencies needed -- `Sheet` and `useIsMobile` already exist in the project.
