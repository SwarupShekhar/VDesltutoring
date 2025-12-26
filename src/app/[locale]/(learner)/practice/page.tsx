"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Reorder, motion } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import {
    generateFluencyTask,
    scoreAttempt,
    getFluencyProfile,
    FluencyChunk
} from "@/lib/fluencyEngine"

type RoundResult = {
    sentenceId: string
    accuracy: number
    timeMs: number
    fluencyScore: number
}

export default function PracticePage() {
    const [task, setTask] = useState<any>(null)
    const [chunks, setChunks] = useState<FluencyChunk[]>([])
    const [startTime, setStartTime] = useState<number>(0)
    const [result, setResult] = useState<any>(null)
    const [rounds, setRounds] = useState<RoundResult[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    useEffect(() => {
        startNewRound()
    }, [])

    function startNewRound() {
        const t = generateFluencyTask()
        setTask(t)
        setChunks(t.shuffledChunks)
        setStartTime(Date.now())
        setResult(null)
    }

    function submit() {
        const time = Date.now() - startTime
        const score = scoreAttempt(task.chunks, chunks, time)

        setRounds(prev => [
            ...prev,
            {
                sentenceId: task.sentenceId,
                accuracy: score.accuracy,
                timeMs: time,
                fluencyScore: score.fluencyScore
            }
        ])

        setResult({
            ...score,
            profile: getFluencyProfile(score.fluencyScore)
        })
    }

    async function handleFinish() {
        if (rounds.length === 0) {
            router.push("/dashboard")
            return
        }

        setIsSubmitting(true)
        const average =
            rounds.reduce((s, r) => s + r.fluencyScore, 0) / rounds.length

        try {
            await fetch("/api/fluency/submit", {
                method: "POST",
                body: JSON.stringify({ rounds, average })
            })
            router.push("/dashboard")
        } catch (err) {
            console.error("Failed to submit session", err)
            setIsSubmitting(false)
        }
    }

    if (!task) return null

    const sessionAverage =
        rounds.length > 0
            ? rounds.reduce((s, r) => s + r.fluencyScore, 0) / rounds.length
            : null

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-serif font-bold">Fluency Practice</h1>
                <span className="text-muted-foreground">
                    Round {rounds.length + (result ? 0 : 1)}
                </span>
            </div>

            <p className="text-slate-400">
                Rebuild this sentence as it would be spoken naturally:
            </p>

            <Reorder.Group
                axis="x"
                values={chunks}
                onReorder={setChunks}
                className="flex flex-wrap gap-3"
            >
                {chunks.map(chunk => (
                    <Reorder.Item
                        key={chunk.id}
                        value={chunk}
                        whileDrag={{ scale: 1.05 }}
                        className="px-4 py-2 bg-card border border-border rounded-xl cursor-grab shadow-sm text-foreground"
                    >
                        {chunk.text}
                    </Reorder.Item>
                ))}
            </Reorder.Group>

            {!result && (
                <Button onClick={submit} size="lg">
                    See My Fluency
                </Button>
            )}

            {result && (
                <Card>
                    <CardContent className="p-10 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="text-center">
                                <h2 className="text-3xl font-serif text-foreground">{result.profile}</h2>
                                <p className="text-muted-foreground mt-2">
                                    Accuracy {(result.accuracy * 100).toFixed(0)}% · Time{" "}
                                    {(result.timeMs / 1000).toFixed(1)}s
                                </p>
                            </div>

                            {sessionAverage && (
                                <p className="text-center text-primary font-medium">
                                    Session average fluency: {(sessionAverage * 100).toFixed(0)}%
                                </p>
                            )}

                            <p className="text-center italic text-muted-foreground">
                                “Nothing is wrong with your English. You’re just trying to speak too late.”
                            </p>

                            <div className="flex justify-center gap-4 pt-6">
                                <Button onClick={startNewRound} variant="outline">
                                    Try another sentence
                                </Button>

                                <Button
                                    onClick={handleFinish}
                                    disabled={isSubmitting}
                                    isLoading={isSubmitting}
                                >
                                    Finish practice
                                </Button>
                            </div>
                        </motion.div>
                    </CardContent>
                </Card>
            )}

        </div>
    )
}
