"use client";
import React, { useEffect, useRef } from "react";
import createGlobe from "cobe";

// Helper to convert hex to normalized RGB array [r, g, b]
const hexToRgb = (hex: string): [number, number, number] => {
    const cleanHex = hex.replace("#", "");
    const bigint = parseInt(cleanHex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r / 255, g / 255, b / 255];
};

export function World({ globeConfig, data }: { globeConfig: any; data: any[] }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let phi = 0;
        let width = 0;

        // Map arcs to markers for visual representation (cobe uses markers)
        // We'll add markers for both start and end points of the arcs
        const markers = data.flatMap((arc) => [
            { location: [arc.startLat, arc.startLng] as [number, number], size: 0.05 },
            { location: [arc.endLat, arc.endLng] as [number, number], size: 0.05 },
        ]);

        // CORRECTLY MAP DATA FOR COBE ARCS
        // cobe expects { startLat, startLng, endLat, endLng, color }
        const mappedArcs = data.map((arc) => {
            const color = arc.color ? hexToRgb(arc.color) : [1, 1, 1];
            return {
                startLat: arc.startLat,
                startLng: arc.startLng,
                endLat: arc.endLat,
                endLng: arc.endLng,
                arcAlt: arc.arcAlt || 0.1,
                color,
            };
        });

        const onResize = () => canvasRef.current && (width = canvasRef.current.offsetWidth);
        window.addEventListener("resize", onResize);
        onResize();

        const globe = createGlobe(canvasRef.current!, {
            ...globeConfig,
            devicePixelRatio: 2,
            width: width * 2,
            height: width * 2,
            phi: 0,
            theta: 0.3,
            dark: 1,
            diffuse: 1.2,
            mapSamples: 10000,
            mapBrightness: 6,
            baseColor: globeConfig.globeColor ? hexToRgb(globeConfig.globeColor) : [0.3, 0.3, 0.3],
            markerColor: globeConfig.emissive ? hexToRgb(globeConfig.emissive) : [0.1, 0.8, 1],
            glowColor: globeConfig.atmosphereColor ? hexToRgb(globeConfig.atmosphereColor) : [1, 1, 1],
            markers: markers,
            arcs: mappedArcs,
            onRender: (state: any) => {
                // Called on every animation frame.
                if (!globeConfig.autoRotate) return;
                state.phi = phi;
                phi += 0.005 * (globeConfig.autoRotateSpeed || 1);
                state.width = width * 2;
                state.height = width * 2;
            },
        } as any);

        setTimeout(() => (canvasRef.current!.style.opacity = "1"));

        return () => {
            globe.destroy();
            window.removeEventListener("resize", onResize);
        };
    }, [globeConfig, data]);

    return (
        <div style={{ width: "100%", maxWidth: 510, aspectRatio: 1, margin: "auto", position: "relative" }}>
            <canvas
                ref={canvasRef}
                style={{
                    width: "100%",
                    height: "100%",
                    contain: "layout paint size",
                    opacity: 0,
                    transition: "opacity 1s ease",
                }}
            />
        </div>
    );
}
