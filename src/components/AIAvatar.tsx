
import React from 'react';
import styles from './AIAvatar.module.css';

interface AIAvatarProps {
    state: 'listening' | 'speaking' | 'processing' | 'idle';
}

const AIAvatar: React.FC<AIAvatarProps> = ({ state = 'idle' }) => {
    let text = "AI Tutor";
    if (state === 'listening') text = "Listening";
    if (state === 'speaking') text = "Speaking";
    if (state === 'processing') text = "Thinking";

    // Split text into letters for animation
    const letters = text.split('');

    return (
        <div className={`${styles.loaderWrapper} text-slate-800 dark:text-white`}>
            {letters.map((char, index) => (
                <span key={index} className={styles.loaderLetter}>
                    {char === ' ' ? '\u00A0' : char}
                </span>
            ))}
            <div className={styles.loader} />
        </div>
    );
};

export default AIAvatar;
