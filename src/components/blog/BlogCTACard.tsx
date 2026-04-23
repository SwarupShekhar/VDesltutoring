import Link from 'next/link'

interface BlogCTACardProps {
    variant: 'sidebar' | 'bottom'
}

export function BlogCTACard({ variant }: BlogCTACardProps) {
    if (variant === 'sidebar') {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse inline-block" />
                    Premium Tutoring
                </div>
                <h3 className="text-2xl font-black text-white leading-tight">Master the Curriculum.</h3>
                <p className="text-sm text-slate-400">Expert 1-on-1 guidance for English fluency, tailored to your goals.</p>
                <Link
                    href="/pricing"
                    className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors text-sm"
                >
                    Book a Tutor
                </Link>
                <p className="text-center text-[10px] text-slate-500">No credit card required</p>
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest pt-2 border-t border-slate-800">
                    <span>Global Faculty</span>
                    <span>·</span>
                    <span>24/7 Support</span>
                </div>
            </div>
        )
    }

    return (
        <div className="my-12 bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6 not-prose">
            <div className="flex-1 space-y-2">
                <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Premium Tutoring</div>
                <h3 className="text-2xl font-black text-white">Master the Curriculum.</h3>
                <p className="text-sm text-slate-400">Expert 1-on-1 guidance for English fluency, tailored to your goals.</p>
            </div>
            <Link
                href="/pricing"
                className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors text-sm whitespace-nowrap"
            >
                Start Learning
            </Link>
        </div>
    )
}
