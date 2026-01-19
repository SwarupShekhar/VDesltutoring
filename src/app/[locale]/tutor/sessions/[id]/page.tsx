import { getDictionary, type Locale } from "@/i18n/getDictionary"
import { TutorSessionContent } from "@/components/TutorSessionContent"

export default async function TutorSessionPage({
    params
}: {
    params: Promise<{ id: string; locale: Locale }>
}) {
    const { id, locale } = await params
    const dict = await getDictionary(locale)

    // Fallback if tutorSession keys are missing
    const tutorSessionDict = dict.tutorSession || {
        prepTitle: "Session Preparation",
        prepSubtitle: "Review CEFR blockers before starting with {studentName}",
        backToDashboard: "Back to Dashboard",
        startSession: "Start Session",
        completeChecklist: "Complete the coaching checklist above, then click Start Session"
    };

    return (
        <TutorSessionContent
            dict={tutorSessionDict}
            locale={locale}
        />
    )
}
