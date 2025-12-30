"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, CreditCard } from "lucide-react";

export function CheckoutPageContent({ dict }: { dict: any }) {
    const t = dict;
    const searchParams = useSearchParams();
    const planKey = searchParams.get("plan") || "basic";

    // A helper to get plan details from the parent dict (assuming passed correctly or hardcoded for now if structure differs)
    // Since we passed dict.checkoutPage, we need to map plans manually or pass the full dict. 
    // For simplicity, let's assume we can map the plan key to display text here or if the user passed the full dict.
    // Actually, to keep it clean, let's just use the planKey to display "Basic", "Standard", "Premium" capitalized.

    const planName = planKey.charAt(0).toUpperCase() + planKey.slice(1);
    const planPrice = planKey === 'premium' ? '$79' : planKey === 'standard' ? '$39' : '$19';

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [email, setEmail] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsModalOpen(true);
    };

    const handleEarlyAccess = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Early Access Email:", email);
        alert("Thanks! You've been added to the list.");
        setIsModalOpen(false);
    };

    return (
        <>
            <div className="max-w-xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="font-serif text-4xl mb-4">{t.title}</h1>
                    <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        <span>{t.selectedPlan}</span>
                        <span className="font-bold text-foreground">{planName}</span>
                        <span className="text-slate-400">-</span>
                        <span className="font-bold text-foreground">{planPrice} {t.perMonth}</span>
                    </div>
                </div>

                {/* Fake Payment Form */}
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-8 md:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-2xl relative overflow-hidden"
                    onSubmit={handleSubmit}
                >
                    {/* Security Badge */}
                    <div className="absolute top-0 right-0 p-4 opacity-50">
                        <Lock className="w-5 h-5 text-slate-400" />
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">{t.form.name}</label>
                            <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-electric transition-all" placeholder="John Doe" required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">{t.form.email}</label>
                            <input type="email" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-electric transition-all" placeholder="john@example.com" required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">{t.form.cardNumber}</label>
                            <div className="relative">
                                <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-electric transition-all" placeholder="0000 0000 0000 0000" required />
                                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">{t.form.expiry}</label>
                                <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-electric transition-all" placeholder="MM / YY" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">{t.form.cvv}</label>
                                <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-electric transition-all" placeholder="123" required />
                            </div>
                        </div>
                    </div>

                    <div className="mt-10">
                        <button type="submit" className="w-full py-4 rounded-xl bg-electric text-white font-bold text-lg shadow-lg shadow-electric/25 hover:bg-electric/90 transition-all flex items-center justify-center gap-2">
                            <Lock className="w-4 h-4" />
                            {t.button}
                        </button>
                        <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1">
                            <Lock className="w-3 h-3" /> Secure 256-bit SSL Encrypted Payment
                        </p>
                    </div>
                </motion.form>
            </div>

            {/* Early Access Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-md p-8 rounded-3xl relative z-10 text-center border border-white/10 shadow-2xl"
                        >
                            <div className="w-16 h-16 bg-electric/10 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
                                🚀
                            </div>
                            <h3 className="font-serif text-2xl text-foreground mb-2">{t.modal.title}</h3>
                            <p className="text-electric font-medium mb-4">{t.modal.subtitle}</p>
                            <p className="text-slate-500 dark:text-slate-400 mb-8">{t.modal.description}</p>

                            <form onSubmit={handleEarlyAccess} className="space-y-4">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-electric transition-all"
                                    placeholder={t.modal.emailPlaceholder}
                                    required
                                />
                                <button type="submit" className="w-full py-3 rounded-xl bg-foreground text-background font-bold hover:opacity-90 transition-all">
                                    {t.modal.button}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
