"use client";

import styles from "./VersionsPanel.module.css";

type Version = {
  id: string;
  reason: string;
  createdAt: string;
};

type VersionsPanelProps = {
  versions: Version[];
  canEdit: boolean;
  onCreateSnapshot: () => void;
};

export function VersionsPanel({ versions, canEdit, onCreateSnapshot }: VersionsPanelProps) {
  return (
    <>
      {canEdit && (
        <button
          type="button"
          className={styles.snapshotBtn}
          onClick={onCreateSnapshot}
        >
          Create snapshot
        </button>
      )}

      {versions.length === 0 ? (
        <p className={styles.empty}>No snapshots yet</p>
      ) : (
        <div className={styles.list}>
          {versions.map((v) => (
            <div key={v.id} className={styles.item}>
              <span className={styles.reason}>{v.reason}</span>
              <span className={styles.time}>
                {new Date(v.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
