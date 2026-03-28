import { IconAlertTriangle, IconCheck, IconLoader } from "./icons";
import styles from "./StatusIndicator.module.css";

export type SaveStatus = "idle" | "saving" | "saved" | "error" | "unsaved";

type StatusIndicatorProps = {
  status: SaveStatus;
};

const labels: Record<SaveStatus, string> = {
  idle: "Ready",
  saving: "Saving...",
  saved: "Saved",
  error: "Error saving",
  unsaved: "Unsaved changes"
};

export function StatusIndicator({ status }: StatusIndicatorProps) {
  if (status === "idle") {
    return null;
  }

  const icon =
    status === "saved" ? (
      <IconCheck width={14} height={14} />
    ) : status === "saving" ? (
      <IconLoader width={14} height={14} />
    ) : status === "error" ? (
      <IconAlertTriangle width={14} height={14} />
    ) : null;

  return (
    <span className={`${styles.status} ${styles[status]}`}>
      {icon !== null ? (
        <span className={styles.icon}>{icon}</span>
      ) : (
        <span className={styles.dot} />
      )}
      {labels[status]}
    </span>
  );
}
