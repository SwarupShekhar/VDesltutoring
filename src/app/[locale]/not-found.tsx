import Link from 'next/link'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  return {
    robots: 'noindex, follow'
  }
}

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center py-20">
            <h2 className="text-2xl font-bold">Page Not Found</h2>
            <p className="mb-4">Could not find requested resource</p>
            <Link href="/" className="text-electric hover:underline">Return Home</Link>
        </div>
    )
}
