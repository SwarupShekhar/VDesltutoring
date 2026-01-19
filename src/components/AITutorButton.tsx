"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
            className="fixed bottom-[-110px] right-[-110px] md:bottom-[-80px] md:right-[-80px] z-[100] cursor-pointer scale-[0.55] md:scale-[0.85] hover:scale-[0.6] md:hover:scale-[0.9] transition-transform duration-300 bg-transparent border-none p-0"
        >
            <div className="loader">
                <div style={{ "--i": 1, "--inset": "38%" } as React.CSSProperties} className="box">
                    <div className="logo">
                        <Image
                            src="https://res.cloudinary.com/de8vvmpip/image/upload/v1767775742/chatbot_hi8due.png"
                            alt="AI Tutor"
                            width={72}
                            height={72}
                            className="drop-shadow-md"
                        />
                    </div>
                </div>
                <div style={{ "--i": 2, "--inset": "34%" } as React.CSSProperties} className="box" />
                <div style={{ "--i": 3, "--inset": "30%" } as React.CSSProperties} className="box" />
                <div style={{ "--i": 4, "--inset": "26%" } as React.CSSProperties} className="box" />
                <div style={{ "--i": 5, "--inset": "22%" } as React.CSSProperties} className="box" />
                <div style={{ "--i": 6, "--inset": "18%" } as React.CSSProperties} className="box" />
            </div>

            <style jsx>{`
                .loader {
                    --size: 280px;
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
                    border: 1px solid rgba(59, 130, 246, 0.3);
                    box-shadow: 0 0 15px rgba(59, 130, 246, 0.1);
                    animation: ripple var(--duration) infinite ease-in-out;
                    inset: var(--inset);
                    animation-delay: calc(var(--i) * 0.15s);
                    z-index: calc(var(--i) * -1);
                    pointer-events: all;
                    will-change: transform, opacity;
                }

                .loader .box:last-child {
                    opacity: 0.4;
                }
                .loader .box:not(:last-child):hover {
                    background: rgba(59, 130, 246, 0.35);
                    box-shadow: 0 0 25px rgba(59, 130, 246, 0.2);
                }

                .loader .logo {
                    position: absolute;
                    inset: 0;
                    display: grid;
                    place-content: center;
                    /* padding removed to allow image to size properly */
                }

                @keyframes ripple {
                    0% {
                        transform: scale(1);
                        opacity: 1;
                    }
                    65% {
                        transform: scale(1.4);
                        opacity: 0.15;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
            `}</style>
        </button>
    );
};

