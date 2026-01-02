export type ComprehensionClip = {
    id: string
    title: string
    scenario: "daily" | "work" | "travel" | "finish" | "confidence" | "smalltalk" | "office"
    audioUrl: string
    prompt: string
}

export const COMPREHENSION_BANK: ComprehensionClip[] = [
    {
        id: "daily-1",
        title: "Daily Life",
        scenario: "daily",
        audioUrl: "https://res.cloudinary.com/de8vvmpip/video/upload/v1767344776/Daily-1_wntyhz.mp3",
        prompt: "What is the person talking about?"
    },
    {
        id: "work-1",
        title: "Work",
        scenario: "work",
        audioUrl: "https://res.cloudinary.com/de8vvmpip/video/upload/v1767344857/Work-1_o98rh1.mp3",
        prompt: "What happened at work?"
    },
    {
        id: "travel-1",
        title: "Travel",
        scenario: "travel",
        audioUrl: "https://res.cloudinary.com/de8vvmpip/video/upload/v1767345066/Travel-1_wsvjsf.mp3",
        prompt: "Where is the person going?"
    },
    {
        id: "finish-1",
        title: "Finish the Thought",
        scenario: "finish",
        audioUrl: "https://res.cloudinary.com/de8vvmpip/video/upload/v1767345306/Finish-1_avso45.mp3",
        prompt: "Finish the sentence in your own way."
    },
    {
        id: "confidence-1",
        title: "Confidence",
        scenario: "confidence",
        audioUrl: "https://res.cloudinary.com/de8vvmpip/video/upload/v1767345444/Confidence_qfwsfk.mp3",
        prompt: "What message did you hear?"
    },
    {
        id: "smalltalk-1",
        title: "Small Talk",
        scenario: "smalltalk",
        audioUrl: "https://res.cloudinary.com/de8vvmpip/video/upload/v1767345920/smalltalk-1_gblmkg.mp3",
        prompt: "What did they talk about?"
    },
    {
        id: "office-1",
        title: "Office",
        scenario: "office",
        audioUrl: "https://res.cloudinary.com/de8vvmpip/video/upload/v1767346149/Office-1_xo981e.mp3",
        prompt: "What happened in the office?"
    },
]