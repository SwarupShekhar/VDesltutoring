import BlogEditorPage from '@/components/blog/BlogEditorPage'
import { getPost, updatePost } from '@/actions/blog'
import { notFound } from 'next/navigation'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: PageProps) {
    const { id } = await params
    const post = await getPost(id)

    if (!post) {
        notFound()
    }

    async function handleSave(data: any) {
        'use server'
        return await updatePost(id, data)
    }

    return (
        <BlogEditorPage
            initialData={{
                id: post.id,
                title: post.title,
                slug: post.slug,
                content: post.content,
                status: post.status,
                cover: post.cover
            }}
            onSave={handleSave}
        />
    )
}
