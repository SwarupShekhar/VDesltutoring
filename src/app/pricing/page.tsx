import { HomeNavbar } from '@/components/HomeNavbar';
import { Button } from '@/components/ui/Button';
import { Check } from 'lucide-react';

const plans = [
    {
        name: "Basic",
        price: "$299",
        period: "/ month",
        description: "Self-paced foundation for building fluency habits.",
        features: [
            "Access to Fluency Mirror",
            "Weekly recorded prompts",
            "Async tutor feedback (text)",
            "Community access"
        ],
        buttonText: "Start Basic",
        highlight: false
    },
    {
        name: "Standard",
        price: "$599",
        period: "/ month",
        description: "The core Natural Flow experience. Best for professionals.",
        features: [
            "Everything in Basic",
            "4 Live 1:1 Sessions / month",
            "Personalized Roadmap",
            "Priority feedback (audio)"
        ],
        buttonText: "Join Standard",
        highlight: true
    },
    {
        name: "Premium",
        price: "$1,299",
        period: "/ month",
        description: "Intensive executive coaching for high-stakes roles.",
        features: [
            "Everything in Standard",
            "12 Live 1:1 Sessions / month",
            "Unlimited Async Coaching",
            "Presentation Review",
            "24/7 Mentor Access"
        ],
        buttonText: "Apply for Premium",
        highlight: false
    }
];

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <HomeNavbar />
            <main className="container mx-auto px-6 py-32 max-w-7xl">
                <div className="text-center mb-20">
                    <h1 className="font-serif text-5xl md:text-6xl mb-6">Invest in your voice.</h1>
                    <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                        Select the pacing that fits your goals. Upgrade or pause anytime.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`flex flex-col p-8 rounded-3xl border transition-all duration-300 ${plan.highlight ? 'border-electric bg-electric/5 shadow-xl scale-105 z-10' : 'border-border bg-card hover:border-electric/50'}`}
                        >
                            <div className="mb-8">
                                <h3 className="font-serif text-2xl mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mb-4">
                                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                                </div>
                                <p className="text-muted-foreground text-sm leading-relaxed">{plan.description}</p>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 text-sm text-foreground/80">
                                        <Check size={18} className="text-electric shrink-0 mt-0.5" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                className={`w-full rounded-full h-12 ${plan.highlight ? 'bg-electric hover:bg-electric/90 text-white' : ''}`}
                                variant={plan.highlight ? 'primary' : 'outline'}
                                size="lg"
                            >
                                {plan.buttonText}
                            </Button>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
