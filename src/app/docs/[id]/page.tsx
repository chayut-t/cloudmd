import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";

import { requireUser } from "@/lib/auth";
import { canEdit, canManageMembers } from "@/lib/documents";
import { getDocumentBundle, upsertMemberByEmail, type Role } from "@/lib/store";

import { EditorClient } from "./EditorClient";

type DocumentPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DocumentPage({ params }: DocumentPageProps) {
  const resolvedParams = await params;
  const user = await requireUser();

  const bundle = await getDocumentBundle(resolvedParams.id, user.id);

  if (!bundle) {
    notFound();
  }

  const { document, role, owner, members, comments, versions } = bundle;

  async function addMemberAction(formData: FormData) {
    "use server";

    if (!canManageMembers(role)) {
      return;
    }

    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const rawRole = String(formData.get("role") ?? "VIEWER");
    const nextRole: Role = rawRole === "EDITOR" ? "EDITOR" : "VIEWER";

    if (!email) {
      return;
    }

    await upsertMemberByEmail({
      documentId: document.id,
      requesterUserId: user.id,
      email,
      role: nextRole
    });

    revalidatePath(`/docs/${document.id}`);
  }

  return (
    <main className="page doc-page">
      <header className="topbar">
        <div>
          <Link className="link" href="/docs">
            ← Back to docs
          </Link>
          <h1>{document.title}</h1>
          <p className="muted small">Role: {role}</p>
        </div>
      </header>

      <EditorClient
        documentId={document.id}
        initialTitle={document.title}
        initialContent={document.content}
        canEditDocument={canEdit(role)}
        canComment={role !== null}
        initialComments={comments.map((comment) => ({
          id: comment.id,
          body: comment.body,
          anchorStart: comment.anchorStart,
          anchorEnd: comment.anchorEnd,
          createdAt: comment.createdAt,
          authorName: comment.author?.name ?? null,
          authorEmail: comment.author?.email ?? "unknown"
        }))}
      />

      <section className="card">
        <h2>Members</h2>
        <ul className="list compact">
          <li>
            {(owner?.name ?? owner?.email ?? "Unknown")} ({owner?.email ?? "unknown"}) · OWNER
          </li>
          {members
            .filter((member) => member.userId !== document.ownerId)
            .map((member) => (
              <li key={member.id}>
                {(member.user?.name ?? member.user?.email ?? "Unknown")} ({member.user?.email ?? "unknown"}) ·
                {` ${member.role}`}
              </li>
            ))}
        </ul>

        {canManageMembers(role) ? (
          <form action={addMemberAction} className="row gap-sm wrap">
            <input type="email" name="email" placeholder="teammate@email.com" required />
            <select name="role" defaultValue="VIEWER">
              <option value="VIEWER">Viewer</option>
              <option value="EDITOR">Editor</option>
            </select>
            <button className="button subtle" type="submit">
              Add / Update Member
            </button>
          </form>
        ) : null}
      </section>

      <section className="card">
        <h2>Recent Snapshots</h2>
        <ul className="list compact">
          {versions.length === 0 ? (
            <li className="muted">No snapshots yet.</li>
          ) : (
            versions.map((version) => (
              <li key={version.id}>
                {version.reason} · {new Date(version.createdAt).toLocaleString()}
              </li>
            ))
          )}
        </ul>
      </section>
    </main>
  );
}
