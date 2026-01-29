"use client";
import React from 'react';
import styles from './perspective-button.module.css';

interface PerspectiveButtonProps {
    label?: string;
    onClick?: () => void;
}

export function PerspectiveButton({ label = "Start Reflection", onClick }: PerspectiveButtonProps) {
    return (
        <div className={styles.container_button} onClick={onClick}>
            <div className={`${styles.hover} ${styles.bt_1}`} />
            <div className={`${styles.hover} ${styles.bt_2}`} />
            <div className={`${styles.hover} ${styles.bt_3}`} />
            <div className={`${styles.hover} ${styles.bt_4}`} />
            <div className={`${styles.hover} ${styles.bt_5}`} />
            <div className={`${styles.hover} ${styles.bt_6}`} />
            <div className={styles.button_face} data-text={label} />
        </div>
    );
}

export default PerspectiveButton;
