import { AppShell } from "@/app/components/AppShell";
import { DocumentCard } from "@/app/components/DocumentCard";
import { IconPlus } from "@/app/components/icons";
import { SearchToggle } from "@/app/components/SearchToggle";
import { createDocumentAction } from "@/app/docs/actions";
import { requireUser } from "@/lib/auth";
import { listDocumentsForUser } from "@/lib/documents";

import styles from "./page.module.css";

type DocsPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function DocsPage({ searchParams }: DocsPageProps) {
  const user = await requireUser();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const q = resolvedSearchParams?.q?.trim() ?? "";

  const documents = await listDocumentsForUser(user.id, q);

  const newDocButton = (
    <form action={createDocumentAction}>
      <button type="submit" className={styles.newBtn}>
        <IconPlus width={16} height={16} />
        New document
      </button>
    </form>
  );

  return (
    <AppShell currentUser={user} center={<SearchToggle defaultValue={q} />} actions={newDocButton}>
      <div className={styles.body}>
        <div className={styles.header}>
          <span className={styles.headerTitle}>
            {q ? `Results for "${q}"` : "Recent documents"}
          </span>
          <span className={styles.headerCount}>
            {documents.length} document{documents.length === 1 ? "" : "s"}
          </span>
        </div>

        {documents.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>
              {q ? "No matching documents" : "No documents yet"}
            </p>
            <p className={styles.emptyText}>
              {q
                ? "Try a different search term."
                : "Create your first document to get started."}
            </p>
          </div>
        ) : (
          <div className={styles.grid}>
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                id={doc.id}
                title={doc.title}
                content={doc.content}
                role={doc.userRole}
                updatedAt={doc.updatedAt}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
