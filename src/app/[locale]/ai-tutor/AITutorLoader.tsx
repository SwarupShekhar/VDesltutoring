'use client';

import dynamic from 'next/dynamic';

const AITutorClient = dynamic(() => import('./AITutorClient'), { ssr: false });

export default function AITutorLoader() {
    return <AITutorClient />;
}
