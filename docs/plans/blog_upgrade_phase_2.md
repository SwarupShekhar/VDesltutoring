# Blog Pro Hardening & Intelligence Expansion - Phase 2

**Goal:** Upgrade the blog system with enterprise features: version control (rollback), readability analysis, ISR performance, and tracked social engagement.

## Tasks

### Task 1: Database Migration for Post Revisions
**Context:** Need to store snapshots of blog posts to allow rollbacks.
- Modify `prisma/schema.prisma` to add `post_revisions` model.
- Model should include: `id`, `postId` (relation), `content`, `title`, `metadata` (JSON), `authorId`, `createdAt`.
- Run `npx prisma generate` and `npx prisma db push`.

### Task 2: Readability Scoring Engine
**Context:** Improve SEO by analyzing content complexity.
- Update `src/hooks/useSEOHealth.ts`.
- Implement Flesch-Kincaid or similar readability algorithm.
- Add "Readability" check to the results returned by the hook.

### Task 3: Revision History & Rollback UI
**Context:** Allow admins to see previous versions and restore them.
- Add a "History" tab or modal to `BlogEditorPage`.
- Fetch revisions for the current post.
- Implement a "Rollback" function that populates the editor with old data.
- Ensure only "Rollback" (copying data back) is implemented, not complex side-by-side diffs (per user request).

### Task 4: Performance (ISR) & SEO Syndication
**Context:** Ensure the blog is lightning fast and shareable.
- Configure `revalidate` on `[slug]/page.tsx` for Incremental Static Regeneration.
- Implement Social Sharing buttons (X, LinkedIn, Facebook).
- Add a tracking server action `trackShare` in `src/actions/analytics.ts` to log which platforms are performing best.

### Task 5: Middleware & Security Hardening
**Context:** Protect admin endpoints from abuse.
- Implement basic rate limiting in `src/actions/blog.ts` or a custom middleware for `/api/blog` routes.
- Add more granular error boundaries around the editor to prevent crash-loops if malformed markdown is pasted.

## Open Questions
- None. User confirmed Rollback only and Share Tracking is desired.
