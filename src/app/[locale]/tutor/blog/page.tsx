import {
    getTutorPosts,
    deletePost,
    submitForReview,
    duplicatePost,
    bulkDeletePosts,
    bulkSubmitForReview,
    getTutorNotifications,
    markNotificationRead,
    getTutorBlogAuditLogs,
    getUnreadNotificationCount
} from "@/actions/blog";
import { TutorBlogDashboard } from "@/components/blog/TutorBlogDashboard";

export const dynamic = 'force-dynamic';

export default async function TutorBlogHub() {
    const posts = await getTutorPosts();
    const notifications = await getTutorNotifications();
    const auditLogs = await getTutorBlogAuditLogs();
    const { count: unreadCount } = await getUnreadNotificationCount();

    // Re-wrap actions to standard format for the client dashboard
    async function handleDeletePost(id: string) {
        'use server'
        try {
            await deletePost(id)
            return { success: true }
        } catch (err: any) {
            return { success: false, error: err?.message || "Failed to delete post" }
        }
    }

    async function handleSubmitForReview(id: string) {
        'use server'
        try {
            await submitForReview(id)
            return { success: true }
        } catch (err: any) {
            return { success: false, error: err?.message || "Failed to submit post" }
        }
    }

    async function handleDuplicatePost(id: string) {
        'use server'
        try {
            const res = await duplicatePost(id)
            return { success: true, id: res.id }
        } catch (err: any) {
            return { success: false, error: err?.message || "Failed to duplicate post" }
        }
    }

    async function handleBulkDelete(ids: string[]) {
        'use server'
        try {
            const res = await bulkDeletePosts(ids)
            return { success: res.success, count: res.count, error: res.error }
        } catch (err: any) {
            return { success: false, error: err?.message || "Bulk delete failed" }
        }
    }

    async function handleBulkSubmit(ids: string[]) {
        'use server'
        try {
            const res = await bulkSubmitForReview(ids)
            return { success: res.success, count: res.count, error: res.error }
        } catch (err: any) {
            return { success: false, error: err?.message || "Bulk submit failed" }
        }
    }

    async function handleMarkRead(id: string) {
        'use server'
        try {
            await markNotificationRead(id)
            return { success: true }
        } catch (err: any) {
            return { success: false }
        }
    }

    return (
        <TutorBlogDashboard
            initialPosts={posts}
            initialNotifications={notifications}
            initialAuditLogs={auditLogs}
            unreadNotificationCount={unreadCount}
            deletePostAction={handleDeletePost}
            submitForReviewAction={handleSubmitForReview}
            duplicatePostAction={handleDuplicatePost}
            bulkDeletePostsAction={handleBulkDelete}
            bulkSubmitAction={handleBulkSubmit}
            markNotificationReadAction={handleMarkRead}
        />
    );
}

