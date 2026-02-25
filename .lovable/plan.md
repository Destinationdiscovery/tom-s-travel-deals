

# Plan: Improve Blog Image Block Experience

## Current State
The blog post creator **already supports** inline image blocks -- you can click "+ Image" to add an image block, upload a file, and add a caption. Images upload to the `blog-images` storage bucket and render in published articles.

## Problem
Once an image is uploaded to a block, there's no way to **replace** it -- the file input disappears and only the preview shows. This makes editing awkward if you picked the wrong image or want to swap one out.

## Changes

### File: `src/components/dashboard/BlogPostCreator.tsx`

**1. Allow replacing uploaded images in blocks (lines 276-284)**
When an image block already has a value, show the preview AND a "Replace" button that clears the value so the file input reappears. This lets you swap images freely.

**2. Improve image block preview styling**
Make the image preview in the editor taller (`h-48` instead of `h-32`) and add rounded corners + object-cover to better match how it'll look when published.

**3. Add a "clear image" option**
Add a small button overlay or below the image to reset the block value, re-enabling the file picker.

The published article rendering in `CompassArticle.tsx` already matches the hardcoded articles (full-width, rounded-xl, object-cover, captions) so no changes needed there.

