"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Bot } from "lucide-react";

interface AITutorButtonProps {
    isLoggedIn: boolean;
    locale: string;
}

export const AITutorButton = ({ isLoggedIn, locale }: AITutorButtonProps) => {
    const router = useRouter();

    const handleClick = () => {
        if (isLoggedIn) {
            router.push('/ai-tutor'); // Correct route (unlocalized)
        } else {
            router.push(`/${locale}/sign-in`);
        }
    };

    return (
        <div className="fixed bottom-6 left-6 z-[100] cursor-pointer group" onClick={handleClick}>
            {/* Loader/Button Container */}
            <div className="relative w-24 h-24 flex items-center justify-center pointer-events-none group-hover:scale-110 transition-transform duration-300">

                {/* Ripple Boxes */}
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-gradient-to-t from-blue-500/10 to-indigo-500/10 box-shadow-custom pointer-events-auto animate-ripple"
                        style={{
                            inset: `${44 - i * 4}%`,
                            zIndex: -i,
                            animationDelay: `${i * 0.15}s`,
                        }}
                    />
                ))}

                {/* Logo / Center */}
                <div className="absolute inset-0 grid place-content-center pointer-events-auto z-10">
                    <Bot size={32} className="text-blue-600 dark:text-blue-400 animate-color-change" />
                </div>
            </div>

            {/* Inline Styles for the specific animations provided in snippet */}
            <style jsx>{`
         .box-shadow-custom {
           box-shadow: rgba(59, 130, 246, 0.2) 0px 10px 10px 0, inset rgba(59, 130, 246, 0.1) 0px 5px 10px -7px;
         }
         @keyframes ripple {
            0% { transform: scale(1); box-shadow: rgba(59, 130, 246, 0.2) 0px 10px 10px 0, inset rgba(59, 130, 246, 0.1) 0px 5px 10px -7px; }
            65% { transform: scale(1.4); box-shadow: rgba(0, 0, 0, 0) 0px 0 0 0; }
            100% { transform: scale(1); box-shadow: rgba(59, 130, 246, 0.2) 0px 10px 10px 0, inset rgba(59, 130, 246, 0.1) 0px 5px 10px -7px; }
         }
         @keyframes color-change {
            0% { fill: #3B82F6; }
            50% { fill: white; }
            100% { fill: #3B82F6; }
         }
         .animate-ripple {
            animation: ripple 2.5s infinite ease-in-out;
         }
         .animate-color-change {
            animation: color-change 2.5s infinite ease-in-out;
         }
       `}</style>
        </div>
    );
};
