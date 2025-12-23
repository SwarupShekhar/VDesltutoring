'use client';

import { ESLBackgroundDemo } from '@/components/ESLBackgroundDemo';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function BackgroundDemoPage() {
  return (
    <div className="min-h-screen">
      <ESLBackgroundDemo />
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <Link href="/">
          <Button variant="outline" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}