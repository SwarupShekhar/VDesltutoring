"use client";
import React from "react";
import { motion } from "framer-motion";

export default function ColourfulText({ text }: { text: string }) {
    const colors = [
        "rgb(131, 164, 212)",
        "rgb(247, 149, 51)",
        "rgb(243, 112, 85)",
        "rgb(239, 78, 123)",
        "rgb(161, 102, 171)",
        "rgb(80, 115, 184)",
        "rgb(16, 152, 173)",
        "rgb(7, 179, 155)",
        "rgb(109, 186, 130)",
        "rgb(250, 204, 21)", /* Yellow-400 */
        "rgb(168, 85, 247)",  /* Purple-500 */
    ];

    const [currentColors, setCurrentColors] = React.useState(colors);
    const [count, setCount] = React.useState(0);

    React.useEffect(() => {
        const interval = setInterval(() => {
            const shuffled = [...colors].sort(() => Math.random() - 0.5);
            setCurrentColors(shuffled);
            setCount((prev) => prev + 1);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return text.split("").map((char, index) => (
        <motion.span
            key={`${char}-${count}-${index}`}
            initial={{
                y: 0,
            }}
            animate={{
                color: currentColors[index % currentColors.length],
                y: [0, -3, 0],
                scale: [1, 1.05, 1],
                filter: ["blur(0px)", `blur(5px)`, "blur(0px)"],
                opacity: [1, 0.8, 1],
            }}
            transition={{
                duration: 0.5,
                delay: index * 0.05,
            }}
            className="inline-block whitespace-pre font-sans tracking-tight"
        >
            {char}
        </motion.span>
    ));
}
