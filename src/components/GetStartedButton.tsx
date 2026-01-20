"use client";

import React from 'react';
import styles from './GetStartedButton.module.css';

interface GetStartedButtonProps {
  text: string;
  onClick?: () => void;
}

export const GetStartedButton = ({ text, onClick }: GetStartedButtonProps) => {
  return (
    <button className={styles.btn} onClick={onClick}>
      <i className={styles.animation} />
      {text}
      <i className={styles.animation} />
    </button>
  );
}
