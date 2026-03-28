import Link from "next/link";
import { IconFile } from "./icons";
import styles from "./DocumentCard.module.css";

type DocumentCardProps = {
  id: string;
  title: string;
  content: string;
  role: string;
  updatedAt: string;
};

export function DocumentCard({ id, title, content, role, updatedAt }: DocumentCardProps) {
  const preview = content.replace(/^#+ /gm, "").trim().slice(0, 120);

  return (
    <Link href={`/docs/${id}`} className={styles.card}>
      <div className={styles.topRow}>
        <IconFile width={18} height={18} className={styles.icon} />
        <span className={styles.title}>{title}</span>
        <span className={styles.roleBadge}>{role}</span>
      </div>
      <p className={styles.preview}>{preview || "Empty document"}</p>
      <span className={styles.meta}>
        Updated {new Date(updatedAt).toLocaleDateString()}
      </span>
    </Link>
  );
}
