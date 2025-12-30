"use client";
import React, { useEffect, useState } from "react";
import { World } from "./ui/globe";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with canvas
const WorldComponent = dynamic(() => Promise.resolve(World), {
    ssr: false,
});

export function FluencyGlobe() {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const globeColor = mounted && theme === 'light' ? "#062056" : "#0f172a";
    const atmosphereColor = mounted && theme === 'light' ? "#ffffff" : "#3b82f6";

    const globeConfig = {
        pointSize: 4,
        globeColor: globeColor,
        showAtmosphere: true,
        atmosphereColor: atmosphereColor,
        atmosphereAltitude: 0.1,
        emissive: "#06b6d4",
        emissiveIntensity: 0.1,
        shininess: 0.9,
        polygonColor: "rgba(255,255,255,0.7)",
        ambientLight: "#38bdf8",
        directionalLeftLight: "#ffffff",
        directionalTopLight: "#ffffff",
        pointLight: "#ffffff",
        arcTime: 1000,
        arcLength: 0.9,
        rings: 1,
        maxRings: 3,
        initialPosition: { lat: 22.3193, lng: 114.1694 },
        autoRotate: true,
        autoRotateSpeed: 0.5,
    };

    const sampleArcs = [
        {
            order: 1,
            startLat: 37.7749,
            startLng: -122.4194,
            endLat: 51.5074,
            endLng: -0.1278,
            arcAlt: 0.1,
            color: "#06b6d4",
        },
        {
            order: 2,
            startLat: 51.5074,
            startLng: -0.1278,
            endLat: 35.6762,
            endLng: 139.6503,
            arcAlt: 0.2,
            color: "#3b82f6",
        },
        {
            order: 3,
            startLat: 35.6762,
            startLng: 139.6503,
            endLat: -33.8688,
            endLng: 151.2093,
            arcAlt: 0.3,
            color: "#6366f1",
        },
        {
            order: 4,
            startLat: -33.8688,
            startLng: 151.2093,
            endLat: 37.7749,
            endLng: -122.4194,
            arcAlt: 0.4,
            color: "#06b6d4",
        },
        {
            order: 5,
            startLat: 19.4326,
            startLng: -99.1332,
            endLat: 48.8566,
            endLng: 2.3522,
            arcAlt: 0.1,
            color: "#3b82f6",
        },
        {
            order: 6,
            startLat: 40.7128,
            startLng: -74.006,
            endLat: 22.3193,
            endLng: 114.1694,
            arcAlt: 0.2,
            color: "#6366f1",
        },
        {
            order: 7,
            startLat: 52.5200,
            startLng: 13.4050,
            endLat: 34.0522,
            endLng: -118.2437,
            arcAlt: 0.3,
            color: "#06b6d4",
        },
        {
            order: 8,
            startLat: 1.3521,
            startLng: 103.8198,
            endLat: 55.7558,
            endLng: 37.6173,
            arcAlt: 0.4,
            color: "#3b82f6",
        },
    ];

    return (
        <section className="py-24 bg-slate-50 dark:bg-slate-950 overflow-hidden relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="md:pr-12"
                    >
                        <div className="inline-block px-3 py-1 mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold tracking-wide uppercase">
                            Global Community
                        </div>
                        <h2 className="font-serif text-4xl md:text-5xl mb-6 text-slate-900 dark:text-white leading-tight">
                            Speak English with the World.
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                            Join a global network of learners who are moving beyond memorization to true conversation.
                            Our platform connects you with the patterns of English used worldwide.
                        </p>

                        <div className="border-l-4 border-blue-500/20 pl-6">
                            <p className="text-lg text-slate-600 dark:text-slate-300 font-medium italic">
                                "People around the world are practicing, hesitating, restarting,
                                and finding their voice - just like you."
                            </p>
                        </div>

                        <div className="mt-10 grid grid-cols-3 gap-6">
                            <div>
                                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">12+</div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">Timezones</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">24/7</div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">Availability</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">100%</div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">Immersion</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Globe Visualization */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="relative h-[400px] md:h-[500px] w-full flex items-center justify-center p-8 lg:p-0"
                    >
                        <div className="absolute inset-0 bg-blue-500/5 blur-[100px] rounded-full" />
                        <WorldComponent globeConfig={globeConfig} data={sampleArcs} />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
