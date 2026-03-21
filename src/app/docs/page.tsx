import Link from "next/link";

import { AppShell } from "@/app/components/AppShell";
import { createDocumentAction } from "@/app/docs/actions";
import { requireUser } from "@/lib/auth";
import { listDocumentsForUser } from "@/lib/documents";

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

  return (
    <AppShell
      currentUser={user}
      activeView="documents"
      sectionLabel="Workspace"
      pageTitle="Documents"
      pageDescription="Search, create, and jump back into your active markdown work."
    >
      <section className="workspace-panel stack-lg">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Start something new</p>
            <h2>Keep the writing flow moving</h2>
          </div>
          <p className="panel-copy">
            Create a fresh draft or search your existing library without leaving
            the workspace.
          </p>
        </div>

        <div className="toolbar-grid">
          <form action={createDocumentAction} className="tool-card">
            <label className="field-label" htmlFor="new-doc-title">
              New document title
            </label>
            <div className="inline-form">
              <input
                id="new-doc-title"
                type="text"
                name="title"
                placeholder="Architecture notes"
                maxLength={120}
              />
              <button className="button button-primary" type="submit">
                Create Doc
              </button>
            </div>
          </form>

          <form method="GET" className="tool-card">
            <label className="field-label" htmlFor="document-search">
              Search library
            </label>
            <div className="inline-form">
              <input
                id="document-search"
                type="search"
                name="q"
                placeholder="Search by title"
                defaultValue={q}
                maxLength={120}
              />
              <button className="button button-secondary" type="submit">
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="workspace-panel">
        <div className="panel-header panel-header-tight">
          <div>
            <p className="eyebrow">Library</p>
            <h2>Recent and shared documents</h2>
          </div>
          <p className="panel-copy">
            {q
              ? `${documents.length} result${documents.length === 1 ? "" : "s"} for "${q}"`
              : `${documents.length} document${documents.length === 1 ? "" : "s"} available`}
          </p>
        </div>

        {documents.length === 0 ? (
          <div className="empty-state">
            <h3>{q ? "No matching documents" : "No documents yet"}</h3>
            <p>
              {q
                ? "Try a different title search, or create a new document to get started."
                : "Create your first document to start drafting, sharing, and reviewing with your team."}
            </p>
          </div>
        ) : (
          <ul className="document-grid">
            {documents.map((doc) => {
              return (
                <li key={doc.id}>
                  <article className="document-card">
                    <div className="document-card-main">
                      <div className="document-card-topline">
                        <span className="role-pill">{doc.userRole}</span>
                        <span className="document-timestamp">
                          Updated {new Date(doc.updatedAt).toLocaleString()}
                        </span>
                      </div>

                      <Link className="document-link" href={`/docs/${doc.id}`}>
                        {doc.title}
                      </Link>

                      <p className="document-meta">
                        Open the workspace to keep editing, leave comments, or
                        review recent snapshots.
                      </p>
                    </div>

                    <Link className="button button-ghost" href={`/docs/${doc.id}`}>
                      Open Workspace
                    </Link>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
