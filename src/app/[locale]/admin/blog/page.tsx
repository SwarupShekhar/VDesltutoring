import { getPostsAdmin, deletePost } from "@/actions/blog";
import Link from "next/link";
import { Plus, CheckCircle, Clock, Eye, MessageSquare } from "lucide-react";
import { RecomputeButton } from "@/components/blog/RecomputeButton";
import { AdminBlogTable } from "@/components/blog/AdminBlogTable";

export const dynamic = 'force-dynamic';

export default async function AdminBlogPage() {
    const posts = await getPostsAdmin();

    const stats = {
        total: posts.length,
        published: posts.filter(p => p.status === 'published').length,
        submitted: posts.filter(p => p.status === 'submitted').length,
        rework: posts.filter(p => p.status === 'needs_rework').length,
    };

    async function deletePostAction(id: string) {
        'use server'
        return await deletePost(id)
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Content Pipeline</h1>
                    <RecomputeButton />
                </div>
                <Link href="/admin/blog/new" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20 font-bold active:scale-95">
                    <Plus size={20} />
                    New Admin Post
                </Link>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Live on Site" value={stats.published} icon={<CheckCircle className="text-green-500" />} />
                <StatCard label="Review Queue" value={stats.submitted} icon={<Clock className="text-blue-500" />} colorClass="text-blue-600 dark:text-blue-400" />
                <StatCard label="Needs Rework" value={stats.rework} icon={<MessageSquare className="text-orange-500" />} colorClass="text-orange-600 dark:text-orange-400" />
                <StatCard label="Total Content" value={stats.total} icon={<Eye className="text-slate-400" />} />
            </div>

            <AdminBlogTable initialPosts={posts} deletePostAction={deletePostAction} />
        </div>
    );
}

function StatCard({ label, value, icon, colorClass = "text-slate-900 dark:text-white" }: { label: string, value: number, icon: React.ReactNode, colorClass?: string }) {
    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex justify-between items-start hover:shadow-md transition-all">
            <div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{label}</div>
                <div className={`text-3xl font-black ${colorClass}`}>{value}</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                {icon}
            </div>
        </div>
    )
}
