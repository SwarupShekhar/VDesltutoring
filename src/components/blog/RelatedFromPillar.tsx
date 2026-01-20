import Link from 'next/link';

export function RelatedFromPillar() {
    return (
        <div className="mt-12 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
            <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
                Want the full picture?
            </h3>
            <p className="text-indigo-700 dark:text-indigo-300 mb-4">
                This article is part of our comprehensive guide to professional English fluency.
            </p>
            <Link
                href="/fluency-guide"
                className="inline-flex items-center text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors"
            >
                Start with the main roadmap <span className="ml-1">→</span>
            </Link>
        </div>
    );
}
