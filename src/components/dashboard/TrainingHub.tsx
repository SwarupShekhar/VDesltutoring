"use client"

import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Clock, Volume2, BookOpen, Search, Zap } from "lucide-react"

export function TrainingHub() {
    const router = useRouter()
    const params = useParams()
    const locale = params.locale as string || 'en'

    const buttons = [
        { label: "Speed Response", mode: "speed", icon: Clock, color: "text-blue-600 bg-blue-50 border-blue-100" },
        { label: "Sound Practice", mode: "pronunciation", icon: Volume2, color: "text-purple-600 bg-purple-50 border-purple-100" },
        { label: "Sentence Builder", mode: "grammar", icon: BookOpen, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
        { label: "Word Expansion", mode: "vocabulary", icon: Search, color: "text-amber-600 bg-amber-50 border-amber-100" },
    ]

    return (
        <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">
                    Targeted Training
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {buttons.map((btn) => (
                        <Button
                            key={btn.mode}
                            variant="outline"
                            onClick={() => router.push(`/${locale}/practice?mode=${btn.mode}`)}
                            className={`h-auto py-4 flex flex-col gap-2 rounded-2xl border transition-all hover:scale-[1.02] active:scale-[0.98] ${btn.color}`}
                        >
                            <btn.icon className="w-6 h-6" />
                            <span className="text-xs font-bold">{btn.label}</span>
                        </Button>
                    ))}
                </div>

                <Button
                    variant="primary"
                    onClick={() => router.push(`/${locale}/practice?mode=auto`)}
                    className="w-full mt-4 py-6 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold flex gap-2 items-center justify-center uppercase tracking-widest text-xs"
                >
                    <Zap className="w-4 h-4" />
                    Try Now (Daily Mix)
                </Button>
            </CardContent>
        </Card>
    )
}
