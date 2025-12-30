
import { getDictionary, type Locale } from "@/i18n/getDictionary";
import { CheckoutPageContent } from "@/components/CheckoutPageContent";
import { Suspense } from "react";

export default async function CheckoutPage({ params }: { params: Promise<{ locale: Locale }> }) {
    const { locale } = await params;
    const dict = await getDictionary(locale);

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-electric/30 selection:text-electric-foreground relative overflow-hidden font-sans">


            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-electric/5 rounded-full blur-[120px] opacity-30" />
            </div>

            <main className="relative z-10 container mx-auto px-6 pt-32 pb-32">
                <Suspense fallback={<div>Loading...</div>}>
                    <CheckoutPageContent dict={dict.checkoutPage} />
                </Suspense>
            </main>
        </div>
    );
}
