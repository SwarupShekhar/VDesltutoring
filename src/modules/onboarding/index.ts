/**
 * Onboarding Module
 * 
 * Handles new user onboarding flow.
 */

// Types
export interface OnboardingStep {
    id: string
    title: string
    description: string
    completed: boolean
}

export interface OnboardingProgress {
    userId: string
    currentStep: number
    steps: OnboardingStep[]
    completedAt?: Date
}

// Default onboarding steps
export const ONBOARDING_STEPS: Omit<OnboardingStep, 'completed'>[] = [
    {
        id: 'fluency-check',
        title: 'Take Fluency Check',
        description: 'See how we measure your speaking fluency'
    },
    {
        id: 'first-practice',
        title: 'Complete First Practice',
        description: 'Practice speaking with AI coaching'
    },
    {
        id: 'view-progress',
        title: 'View Your Progress',
        description: 'See your CEFR level and skill breakdown'
    }
]

/**
 * Get onboarding progress for a user
 */
export function getOnboardingProgress(completedStepIds: string[]): OnboardingProgress {
    const steps = ONBOARDING_STEPS.map(step => ({
        ...step,
        completed: completedStepIds.includes(step.id)
    }))

    const currentStep = steps.findIndex(s => !s.completed)

    return {
        userId: '',
        currentStep: currentStep === -1 ? steps.length : currentStep,
        steps,
        completedAt: currentStep === -1 ? new Date() : undefined
    }
}
