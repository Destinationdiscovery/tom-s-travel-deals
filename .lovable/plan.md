

# Widen Search Bar Container for Better Input Space

## Problem

The current `max-w-xl` (36rem / 576px) container is too narrow to fit three elements (selector, input, button) in one row comfortably. The input field gets squeezed and placeholder text is cut off.

## Solution

Widen the search bar container from `max-w-xl` to `max-w-3xl` (48rem / 768px). This gives the input field significantly more room while keeping the same single-row layout on desktop.

## Technical Detail

**File: `src/components/HeroSection.tsx`**

One-line change on line 132:
- Change `max-w-xl` to `max-w-3xl`

This single change gives the flex container roughly 200px more horizontal space, which all flows into the `flex-1` input field since the selector and button have fixed widths (`shrink-0` / `w-auto`).

No other files are affected.
