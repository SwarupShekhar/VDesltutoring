import Link from 'next/link';
import { BubbleText } from '@/components/BubbleText';
import { Twitter, Linkedin, Instagram } from 'lucide-react';

export function Footer({ dict, locale }: { dict: any; locale: string }) {
    const t = dict || {};
    const columns = t.columns || {};

    return (
        <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="md:col-span-1">
                        <Link href={`/${locale}`} className="inline-block mb-6">
                            <BubbleText />
                        </Link>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
                            {t.description}
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-slate-400 hover:text-electric transition-colors" aria-label="Twitter"><Twitter size={20} /></a>
                            <a href="#" className="text-slate-400 hover:text-electric transition-colors" aria-label="LinkedIn"><Linkedin size={20} /></a>
                            <a href="#" className="text-slate-400 hover:text-electric transition-colors" aria-label="Instagram"><Instagram size={20} /></a>
                        </div>
                    </div>

                    {/* Spacer */}
                    <div className="hidden md:block"></div>

                    {/* Links Columns */}
                    <div className="grid grid-cols-2 md:grid-cols-3 col-span-2 gap-8">
                        {/* Product */}
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">{columns.product?.title || 'Product'}</h3>
                            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                                <li><Link href={`/${locale}/method`} className="hover:text-electric transition-colors">{columns.product?.method || 'Method'}</Link></li>
                                <li><Link href={`/${locale}/pricing`} className="hover:text-electric transition-colors">{columns.product?.pricing || 'Pricing'}</Link></li>
                                <li><Link href={`/${locale}/practice`} className="hover:text-electric transition-colors">{columns.product?.practice || 'Practice'}</Link></li>
                            </ul>
                        </div>

                        {/* Company */}
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">{columns.company?.title || 'Company'}</h3>
                            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                                <li><Link href={`/${locale}/about`} className="hover:text-electric transition-colors">{columns.company?.about || 'About'}</Link></li>
                                <li><a href="#" className="hover:text-electric transition-colors">{columns.company?.careers || 'Careers'}</a></li>
                                <li><a href="#" className="hover:text-electric transition-colors">{columns.company?.contact || 'Contact'}</a></li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">{columns.legal?.title || 'Legal'}</h3>
                            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                                <li><Link href={`/${locale}/privacy`} className="hover:text-electric transition-colors">{columns.legal?.privacy || 'Privacy'}</Link></li>
                                <li><Link href={`/${locale}/terms`} className="hover:text-electric transition-colors">{columns.legal?.terms || 'Terms'}</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-400 text-sm">{t.copyright || '© 2024 Englivo'}</p>
                    <div className="flex gap-6 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span>All Systems Operational</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
