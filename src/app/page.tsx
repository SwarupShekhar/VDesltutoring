'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { HomeNavbar } from '@/components/HomeNavbar';
import { FluencyMirror } from '@/components/FluencyMirror';
import { SpeakingMomentsGrid } from '@/components/SpeakingMomentsGrid';
import { FloatingConversation } from '@/components/FloatingConversation';
import { TutorCard } from '@/components/TutorCard';
import { Button } from '@/components/ui/Button';
import { ArrowRight, MessageCircle, Zap, Users } from 'lucide-react';

const tutors = [
  { name: "Sarah J.", specialty: "Business English", style: "Former HR Director. Helps you navigate interviews and presentations." },
  { name: "David L.", specialty: "Conversation Fluency", style: "Casual, supportive chats that help you find your natural rhythm." },
  { name: "Elena R.", specialty: "Academic Writing", style: "Precise and structured. Perfect for thesis defense or exam preparation." },
  { name: "Michael C.", specialty: "Accent Reduction", style: "Phonetics expert. Helps you hear the sounds you are missing." },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-electric/30 selection:text-electric-foreground relative">
      <FloatingConversation />
      <HomeNavbar />

      <main className="relative z-10">
        {/* 1. HERO SECTION */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
          {/* Abstract background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-electric/10 rounded-full blur-[120px] pointer-events-none opacity-50" />


          <div className="w-full max-w-6xl mx-auto text-center relative z-10 glass-card p-8 md:p-12 rounded-3xl bg-background/20 backdrop-blur-md border border-white/10 shadow-2xl">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="font-serif text-5xl md:text-7xl font-medium tracking-tight mb-8 leading-[1.1] text-foreground"
            >
              Stop translating in your head.<br />
              <span className="text-electric italic">Start speaking like yourself.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 font-light"
            >
              The boutique approach to fluency. For professionals who feel stuck in the silence between thought and speech.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link href="/sign-up">
                <Button size="lg" className="rounded-full bg-electric hover:bg-electric/90 text-white font-medium px-8 h-12 text-base shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all hover:scale-105">
                  Start Your Assessment
                </Button>
              </Link>
              <Link href="#method">
                <Button variant="ghost" size="lg" className="rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/10 px-8 h-12 text-base">
                  Our Methodology
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* 2. THE FLUENCY MIRROR (Unified Activity) */}
        <section id="practice">
          <FluencyMirror />
        </section>

        {/* 3. SPEAKING MOMENTS (Empathy Grid) */}
        <SpeakingMomentsGrid />

        {/* 4. THE INTERMEDIATE PLATEAU (Education) */}
        <section id="approach" className="py-24 border-t border-border">
          <div className="container mx-auto px-6 max-w-6xl glass-card p-12 rounded-3xl bg-background/20 backdrop-blur-md border border-white/10 shadow-2xl">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <span className="text-electric font-bold tracking-widest uppercase text-sm mb-2 block">The Problem</span>
                <h2 className="font-serif text-3xl md:text-5xl mb-6 text-foreground">Why apps can't teach you this.</h2>
                <div className="space-y-6 text-lg text-muted-foreground font-light leading-relaxed">
                  <p>
                    Most language apps teach you <strong>vocabulary</strong> (what to say). But in a real meeting, you don't struggle because you lack words.
                  </p>
                  <p>
                    You struggle because of <strong>pressure</strong>.
                  </p>
                  <p>
                    When the stakes go up, your brain reverts to safety: <span className="text-foreground italic">translating from your native language</span>. This delay is what kills your confidence, not your grammar.
                  </p>
                </div>
              </div>
              <div className="relative h-[400px] bg-card border border-border rounded-2xl p-8 flex flex-col justify-center items-center text-center shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-electric/5 to-transparent rounded-2xl pointer-events-none" />
                <div className="w-full max-w-sm space-y-4 relative z-10">
                  <motion.div
                    animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.98, 1, 0.98] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="flex items-center gap-4 text-left p-4 bg-background/50 rounded-xl border border-dotted border-border opacity-50"
                  >
                    <div className="w-10 h-10 rounded-full bg-muted" />
                    <div className="h-2 w-32 bg-muted rounded" />
                  </motion.div>

                  <motion.div
                    animate={{ scale: [1, 1.03, 1], boxShadow: ["0 0 0 rgba(0,0,0,0)", "0 10px 25px -5px rgba(59,130,246,0.3)", "0 0 0 rgba(0,0,0,0)"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex items-center gap-4 text-left p-4 bg-background rounded-xl border border-electric shadow-lg relative z-20"
                  >
                    <div className="w-10 h-10 rounded-full bg-electric text-white flex items-center justify-center font-bold">You</div>
                    <div className="space-y-2">
                      <div className="h-2 w-48 bg-foreground/80 rounded" />
                      <div className="h-2 w-32 bg-foreground/60 rounded" />
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.98, 1, 0.98] }}
                    transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                    className="flex items-center gap-4 text-left p-4 bg-background/50 rounded-xl border border-dotted border-border opacity-50"
                  >
                    <div className="w-10 h-10 rounded-full bg-muted" />
                    <div className="h-2 w-40 bg-muted rounded" />
                  </motion.div>
                </div>
                <p className="mt-8 text-sm font-bold uppercase tracking-widest text-muted-foreground">Real-time pressure simulation</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. WHAT HAPPENS AFTER (Value Icons) */}
        <section className="py-24 bg-background border-t border-border">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid md:grid-cols-3 gap-12 text-center">
              {[
                { icon: MessageCircle, title: "Structured Dialogues", desc: "No random chats. Every session has a precise goal." },
                { icon: Zap, title: "Instant Feedback", desc: "Correction that feels supportive, not critical." },
                { icon: Users, title: "Matched for Chemistry", desc: "We pair you with mentors who match your professional vibe." }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-6 text-electric">
                    <item.icon size={32} />
                  </div>
                  <h3 className="font-serif text-xl mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* 5. IMPACT STORIES (Social Proof) */}
        <section className="py-32 bg-background border-y border-border relative overflow-hidden">
          <div className="container mx-auto px-6 max-w-6xl relative z-10">
            <div className="text-center mb-16">
              <h2 className="font-serif text-3xl md:text-5xl mb-4">Fluency is career leverage.</h2>
              <p className="text-muted-foreground text-lg">Don't just take our word for it.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  quote: "I stopped being the quiet one in strategy meetings. I finally sound like the expert I actually am.",
                  author: "Elena K.",
                  role: "Senior Product Manager, Berlin"
                },
                {
                  quote: "My English was 'good enough', but I wasn't connecting. Now I can joke, interrupt, and lead with nuance.",
                  author: "Marco R.",
                  role: "Tech Lead, São Paulo"
                }
              ].map((story, i) => (
                <div key={i} className="bg-muted/10 p-10 rounded-3xl border border-transparent hover:border-electric/20 transition-colors relative group">
                  <div className="text-electric text-6xl font-serif absolute top-6 left-6 opacity-20 group-hover:opacity-40 transition-opacity">"</div>
                  <p className="text-xl md:text-2xl font-serif leading-relaxed mb-8 relative z-10 text-foreground/90">
                    {story.quote}
                  </p>
                  <div>
                    <p className="font-bold text-foreground">{story.author}</p>
                    <p className="text-muted-foreground text-sm uppercase tracking-wide">{story.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. THE FACULTY (Bento Grid) */}
        <section id="tutors" className="py-24 bg-muted/20">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <h2 className="font-serif text-3xl md:text-4xl mb-4 text-foreground">Mentors, not just teachers.</h2>
                <p className="text-muted-foreground max-w-xl">Curated professionals who understand the psychology of performance.</p>
              </div>
              <Link href="/tutors" className="text-electric hover:text-electric/80 transition-colors flex items-center gap-2 text-sm font-medium tracking-wide uppercase">
                View All Faculty <ArrowRight size={16} />
              </Link>
            </div>

            {/* Simulated Bento Layout by varying sizes in Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <TutorCard {...tutors[0]} />
              </div>
              <div>
                <TutorCard {...tutors[1]} />
              </div>
              <div>
                <TutorCard {...tutors[2]} />
              </div>
              <div className="md:col-span-2">
                <TutorCard {...tutors[3]} />
              </div>
            </div>
          </div>
        </section>

        {/* 6. THE ROADMAP (Process) with Vertical Line */}
        <section id="method" className="py-32 bg-background relative overflow-hidden">

          <div className="container mx-auto px-6 max-w-4xl relative z-10">
            <div className="text-center mb-24">
              <h2 className="font-serif text-3xl md:text-5xl mb-6">A process built for flow</h2>
            </div>

            <div className="relative">
              {/* The Path (Vertical Line) */}
              <div className="absolute left-[30px] md:left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-electric/30 to-transparent -translate-x-1/2">
                <motion.div
                  className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-electric to-transparent w-[2px] -translate-x-[0.5px] blur-[1px]"
                  animate={{ top: ["0%", "100%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              </div>

              {[
                { step: "01", title: "The Audit", desc: "We analyze your hesitation patterns to create your profile." },
                { step: "02", title: "The Roadmap", desc: "A custom plan to bridge your specific processing gaps." },
                { step: "03", title: "Deep Immersion", desc: "Guided conversations where silence is safe and progress is felt." }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className={`flex flex-col md:flex-row items-center gap-8 mb-20 relative ${idx % 2 === 0 ? 'md:flex-row-reverse text-left md:text-left' : 'text-left md:text-right'}`}
                >
                  <div className={`flex-1 ${idx % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}>
                    <h3 className="text-2xl font-serif text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>

                  <div className="w-[60px] flex justify-center z-10 relative">
                    <div className="w-16 h-16 rounded-full bg-background border border-electric flex items-center justify-center font-serif text-xl text-electric shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                      {item.step}
                    </div>
                  </div>

                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>


        {/* 8. METHODOLOGY FAQ */}
        <section className="py-24 bg-muted/20 border-t border-border">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="font-serif text-3xl md:text-4xl mb-4">Common Questions</h2>
            </div>

            <div className="space-y-4">
              {[
                { q: "Is this for beginners?", a: "No. Natural Flow is designed for intermediate to advanced professionals who already know the grammar but struggle with fluency and confidence." },
                { q: "How does scheduling work?", a: "You book sessions directly with your chosen mentor based on their live availability. No fixed weekly slots required." },
                { q: "What if I don't click with my mentor?", a: "Chemistry is everything. If the vibe isn't right in your first session, we'll match you with someone else for free." }
              ].map((item, i) => (
                <div key={i} className="bg-background border border-border p-6 rounded-2xl">
                  <h3 className="font-bold text-lg mb-2 text-foreground">{item.q}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9. FINAL CTA */}
        <section className="py-32 flex justify-center text-center px-6">
          <div className="max-w-3xl">
            <h2 className="font-serif text-4xl md:text-6xl mb-8 leading-tight">Ready to find your flow?</h2>
            <div className="flex flex-col gap-6 items-center">
              <Link href="/sign-up">
                <Button size="lg" className="rounded-full bg-foreground text-background hover:bg-foreground/90 font-medium px-12 h-16 text-lg tracking-wide shadow-2xl">
                  Book Your First Session
                </Button>
              </Link>
              <p className="text-muted-foreground text-sm">No commitment required. 100% money-back guarantee.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}