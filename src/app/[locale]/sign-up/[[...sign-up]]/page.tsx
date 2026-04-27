import { SignUp } from '@clerk/nextjs'
import { Vortex } from '@/components/ui/vortex'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  return {
    robots: 'noindex, nofollow',
    title: 'Sign Up | Englivo'
  }
}

export default function SignUpPage() {
  return (
    <div className="w-full mx-auto rounded-md h-screen overflow-hidden">
      <Vortex
        backgroundColor="black"
        rangeY={800}
        particleCount={500}
        baseHue={120}
        className="flex items-center flex-col justify-center px-2 md:px-10 py-4 w-full h-full"
      >
        <SignUp />
      </Vortex>
    </div>
  )
}