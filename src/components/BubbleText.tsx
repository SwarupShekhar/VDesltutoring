import React from "react";
import styles from "./bubble.module.css";

export const BubbleText = () => {
    return (
        <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white tracking-tight cursor-pointer">
            {"Natural Fluency".split("").map((child, idx) => (
                <span className={styles.hoverText} key={idx}>
                    {child === " " ? "\u00A0" : child}
                </span>
            ))}
        </h2>
    );
};
