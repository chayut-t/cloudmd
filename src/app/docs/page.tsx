import Link from "next/link";

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
    <main className="page">
      <header className="topbar">
        <div>
          <h1>Your Documents</h1>
          <p className="muted">Signed in as {user.email}</p>
        </div>
        <Link className="button subtle" href="/api/auth/signout?callbackUrl=/">
          Sign Out
        </Link>
      </header>

      <section className="card">
        <form action={createDocumentAction} className="row gap-sm">
          <input
            type="text"
            name="title"
            placeholder="New doc title"
            maxLength={120}
          />
          <button className="button" type="submit">
            Create Doc
          </button>
        </form>
      </section>

      <section className="card">
        <form method="GET" className="row gap-sm">
          <input
            type="search"
            name="q"
            placeholder="Search by title"
            defaultValue={q}
            maxLength={120}
          />
          <button className="button subtle" type="submit">
            Search
          </button>
        </form>

        <ul className="list">
          {documents.length === 0 ? (
            <li className="muted">No documents found.</li>
          ) : (
            documents.map((doc) => {
              return (
                <li key={doc.id} className="list-item">
                  <div>
                    <Link className="link" href={`/docs/${doc.id}`}>
                      {doc.title}
                    </Link>
                    <p className="muted small">
                      Role: {doc.userRole} · Updated:{" "}
                      {new Date(doc.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </section>
    </main>
  );
}
