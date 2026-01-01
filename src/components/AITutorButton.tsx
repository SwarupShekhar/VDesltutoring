"use client";

import React, { useState } from "react";
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
            router.push('/ai-tutor');
        } else {
            router.push(`/${locale}/sign-in`);
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-label="Open AI Tutor"
            className="fixed bottom-[-110px] left-[-110px] md:bottom-[-80px] md:left-[-80px] z-[100] cursor-pointer scale-[0.4] md:scale-[0.6] hover:scale-[0.45] md:hover:scale-[0.65] transition-transform duration-300 bg-transparent border-none p-0"
        >
            <div className="loader">
                <div style={{ "--i": 1, "--inset": "44%" } as React.CSSProperties} className="box">
                    <div className="logo">
                        <Bot size={48} className="text-white drop-shadow-md svg" fill="currentColor" />
                    </div>
                </div>
                <div style={{ "--i": 2, "--inset": "40%" } as React.CSSProperties} className="box" />
                <div style={{ "--i": 3, "--inset": "36%" } as React.CSSProperties} className="box" />
                <div style={{ "--i": 4, "--inset": "32%" } as React.CSSProperties} className="box" />
                <div style={{ "--i": 5, "--inset": "28%" } as React.CSSProperties} className="box" />
                <div style={{ "--i": 6, "--inset": "24%" } as React.CSSProperties} className="box" />
                <div style={{ "--i": 7, "--inset": "20%" } as React.CSSProperties} className="box" />
                <div style={{ "--i": 8, "--inset": "16%" } as React.CSSProperties} className="box" />
            </div>

            <style jsx>{`
                .loader {
                    --size: 320px;
                    --duration: 2.5s;
                    --logo-color: grey;
                    --background: linear-gradient(
                        0deg,
                        rgb(30 27 109 / 20%) 0%,
                        rgb(59 130 246 / 40%) 100%
                    );
                    height: var(--size);
                    aspect-ratio: 1;
                    position: relative;
                    pointer-events: none;
                }

                .loader .box {
                    position: absolute;
                    background: var(--background);
                    border-radius: 50%;
                    box-shadow:
                        rgba(59, 130, 246, 0.5) 0px 10px 10px 0,
                        inset rgba(59, 130, 246, 0.5) 0px 5px 10px -7px;
                    animation: ripple var(--duration) infinite ease-in-out;
                    inset: var(--inset);
                    animation-delay: calc(var(--i) * 0.15s);
                    z-index: calc(var(--i) * -1);
                    pointer-events: all;
                    transition: all 0.3s ease;
                }

                .loader .box:last-child {
                    filter: blur(30px);
                }
                .loader .box:not(:last-child):hover {
                    filter: brightness(2.5) blur(5px);
                }

                .loader .logo {
                    position: absolute;
                    inset: 0;
                    display: grid;
                    place-content: center;
                    padding: 30%;
                }

                .loader .logo .svg {
                    fill: var(--logo-color);
                    width: 100%;
                    animation: color-change var(--duration) infinite ease-in-out;
                }

                @keyframes ripple {
                    0% {
                        transform: scale(1);
                        box-shadow:
                            rgba(59, 130, 246, 0.5) 0px 10px 10px 0,
                            inset rgba(59, 130, 246, 0.5) 0px 5px 10px -7px;
                    }
                    65% {
                        transform: scale(1.4);
                        box-shadow: rgba(0, 0, 0, 0) 0px 0 0 0;
                    }
                    100% {
                        transform: scale(1);
                        box-shadow:
                            rgba(59, 130, 246, 0.5) 0px 10px 10px 0,
                            inset rgba(59, 130, 246, 0.5) 0px 5px 10px -7px;
                    }
                }

                @keyframes color-change {
                    0% { fill: #3B82F6; color: #3B82F6; }
                    50% { fill: white; color: white; }
                    100% { fill: #3B82F6; color: #3B82F6; }
                }
            `}</style>
        </button>
    );
};

