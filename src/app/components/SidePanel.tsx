"use client";

import { useEffect, type ReactNode } from "react";
import { IconX } from "./icons";
import styles from "./SidePanel.module.css";

type SidePanelProps = {
  title: string;
  icon?: ReactNode;
  onClose: () => void;
  children: ReactNode;
};

export function SidePanel({ title, icon, onClose, children }: SidePanelProps) {
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    if (!mq.matches) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      <aside className={styles.panel}>
        <div className={styles.header}>
          <span className={styles.headerTitle}>
            {icon}
            {title}
          </span>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close panel">
            <IconX width={16} height={16} />
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </aside>
    </>
  );
}
