"use client";

import React from "react";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { Globe, Check } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

interface LanguageSelectorProps {
    currentLocale: string;
    align?: 'left' | 'right' | 'center';
}

const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
];

export function LanguageSelector({ currentLocale, align = 'right' }: LanguageSelectorProps) {
    const router = useRouter();
    const pathname = usePathname();

    const switchLocale = (newLocale: string) => {
        const segments = pathname.split("/");
        if (segments.length > 1) {
            segments[1] = newLocale;
            router.push(segments.join("/"));
        } else {
            router.push(`/${newLocale}`);
        }
    };

    return (
        <Dropdown
            trigger={
                <button className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                    <Globe size={18} className="group-hover:text-electric transition-colors" />
                    <span className="uppercase">{currentLocale}</span>
                </button>
            }
            align={align}
        >
            <div className="p-1 min-w-[180px]">
                {languages.map((lang) => (
                    <DropdownItem
                        key={lang.code}
                        onClick={() => switchLocale(lang.code)}
                        className={`flex items-center justify-between gap-3 px-3 py-2 rounded-md transition-colors ${currentLocale === lang.code
                            ? "bg-electric/10 text-electric font-bold"
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-lg leading-none">{lang.flag}</span>
                            <span className="text-sm">{lang.name}</span>
                        </div>
                        {currentLocale === lang.code && <Check size={14} />}
                    </DropdownItem>
                ))}
            </div>
        </Dropdown>
    );
}
