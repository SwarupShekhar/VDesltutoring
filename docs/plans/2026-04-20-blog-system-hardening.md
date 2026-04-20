# Blog System Hardening & Intelligence Expansion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the blog system into a production-grade, AI-augmented workspace with robust SEO, internal linking detection, and operational stability.

**Architecture:** 
- Implement **Magic Scan** as a server action that analyzes editor content to find relevant internal linking opportunities from existing published blogs.
- Upgrade the **SEO Engine** to include SERP previews, keyword density, and internal/external link analysis.
- Stabilize the **Core Foundation** by replacing `<img>` with Next.js `<Image>`, standardizing slugs, and adding XSS sanitization.
- Add **Operational Excellence** features like Autosave, Search, and Scheduled Publishing.

**Tech Stack:**
- Next.js 15 (App Router, Server Actions)
- Prisma (PostgreSQL)
- Tailwind CSS v4
- DOMPurify (Sanitization)
- RSS (Syndication)

---

### Phase 1: Bug Fixes & Security Hardening

#### Task 1: Replace `<img>` with Next.js `<Image>`
**Files:**
- Modify: `src/app/[locale]/(marketing)/blog/page.tsx`
- Modify: `src/app/[locale]/(marketing)/blog/[slug]/page.tsx`
- Modify: `src/components/blog/MarkdownRenderer.tsx`
- Modify: `src/components/blog/BlogEditorPage.tsx`
- Modify: `next.config.ts`

**Steps:**
1. Update `next.config.ts` to include `images.unsplash.com` and `plus.unsplash.com`.
2. Update `BlogListPage` (blog/page.tsx) to use `<Image />`.
3. Update `BlogPostPage` (blog/[slug]/page.tsx) to use `<Image />`.
4. Update `MarkdownRenderer.tsx` to handle images using Next.js `<Image />` where possible or ensure secure rendering.
5. Update `BlogEditorPage.tsx` preview to use `<Image />`.

#### Task 2: Standardize Slug Logic & Clean UI
**Files:**
- Modify: `src/actions/blog.ts`
- Modify: `src/app/[locale]/(marketing)/blog/page.tsx`

**Steps:**
1. Refactor `createPost` and `updatePost` in `src/actions/blog.ts` to enforce a clean slug format (lowercase, no trailing/leading slashes).
2. Remove messy regex cleaning from `BlogListPage` and use standardized slugs directly.

#### Task 3: Hardening Authorization & Sanity
**Files:**
- Modify: `src/actions/blog.ts`
- Modify: `src/components/blog/MarkdownRenderer.tsx`

**Steps:**
1. Update `ensureAdmin` to verify the user role accurately from the database.
2. Implement `isomorphic-dompurify` in `MarkdownRenderer` to prevent XSS.

---

### Phase 2: Intelligence & SEO Power-ups

#### Task 4: Magic Scan Engine (Internal Linking)
**Files:**
- Create: `src/actions/intelligence.ts`
- Modify: `src/components/blog/BlogEditor.tsx`
- Modify: `src/components/blog/SettingsSidebar.tsx`

**Steps:**
1. Create `magicScanContent` server action that scans the current post text for keywords/titles of other published posts.
2. Update `BlogEditor` "Magic Scan" button to call this action.
3. Update `SettingsSidebar` to display the "Internal Linking Suggestions" returned by the scan.

#### Task 5: Advanced SEO Metrics & SERP Preview
**Files:**
- Modify: `src/hooks/useSEOHealth.ts`
- Modify: `src/components/blog/SEOHealthScore.tsx`
- Modify: `src/components/blog/SettingsSidebar.tsx`

**Steps:**
1. Add keyword density, internal/external link count analysis to `useSEOHealth`.
2. Update `SEOHealthScore` UI to display these detailed metrics.
3. Improve `SettingsSidebar` Google Preview with better character count tracking and visual accuracy.

---

### Phase 3: Operational Excellence

#### Task 6: Real-time Autosave
**Files:**
- Modify: `src/components/blog/BlogEditorPage.tsx`
- Modify: `src/components/blog/BlogEditor.tsx`

#### Task 7: Blog Search & RSS
**Files:**
- Create: `src/app/api/blog/search/route.ts`
- Create: `src/app/api/blog/rss/route.ts`
