"use client";

import { IconColumns, IconEdit, IconEye } from "./icons";
import styles from "./EditorModeToggle.module.css";

export type EditorMode = "edit" | "preview" | "split";

type EditorModeToggleProps = {
  mode: EditorMode;
  onChange: (mode: EditorMode) => void;
};

const modes: { value: EditorMode; label: string; icon: React.ReactNode }[] = [
  { value: "edit", label: "Edit", icon: <IconEdit width={14} height={14} /> },
  { value: "preview", label: "Preview", icon: <IconEye width={14} height={14} /> },
  { value: "split", label: "Split", icon: <IconColumns width={14} height={14} /> }
];

export function EditorModeToggle({ mode, onChange }: EditorModeToggleProps) {
  return (
    <div className={styles.toggle} role="radiogroup" aria-label="Editor mode">
      {modes.map((m) => (
        <button
          key={m.value}
          type="button"
          role="radio"
          aria-checked={mode === m.value}
          className={`${styles.option} ${mode === m.value ? styles.optionActive : ""}`}
          onClick={() => onChange(m.value)}
        >
          {m.icon}
          {m.label}
        </button>
      ))}
    </div>
  );
}
