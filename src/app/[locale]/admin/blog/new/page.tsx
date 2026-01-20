import BlogEditorPage from '@/components/blog/BlogEditorPage'
import { createPost, updatePost } from '@/actions/blog'

export default function NewPostPage() {
    async function handleSave(data: any) {
        'use server'
        // First create
        const res = await createPost(data.title, data.slug)
        if (!res.success) return res

        // Then update with rest of content
        if (res.id) {
            return await updatePost(res.id, data)
        }
        return res
    }

    return (
        <BlogEditorPage
            onSave={handleSave}
        />
    )
}
