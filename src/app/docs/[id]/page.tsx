import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";

import { AppShell } from "@/app/components/AppShell";
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
    <AppShell
      currentUser={user}
      activeView="editor"
      sectionLabel="Document"
      pageTitle={document.title}
      pageDescription={`${role} access to a shared markdown workspace.`}
      contextHref="/docs"
      contextLabel="Back to documents"
    >
      <div className="editor-page-grid">
        <div className="editor-page-main">
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
        </div>

        <aside className="editor-page-side">
          <section className="workspace-panel side-panel">
            <div className="panel-header panel-header-tight">
              <div>
                <p className="eyebrow">Access</p>
                <h2>Members</h2>
              </div>
              <p className="panel-copy">Share with the right level of editing access.</p>
            </div>

            <ul className="detail-list">
              <li className="detail-row">
                <div>
                  <strong>{owner?.name ?? owner?.email ?? "Unknown"}</strong>
                  <p>{owner?.email ?? "unknown"}</p>
                </div>
                <span className="role-pill">OWNER</span>
              </li>
              {members
                .filter((member) => member.userId !== document.ownerId)
                .map((member) => (
                  <li key={member.id} className="detail-row">
                    <div>
                      <strong>{member.user?.name ?? member.user?.email ?? "Unknown"}</strong>
                      <p>{member.user?.email ?? "unknown"}</p>
                    </div>
                    <span className="role-pill">{member.role}</span>
                  </li>
                ))}
            </ul>

            {canManageMembers(role) ? (
              <form action={addMemberAction} className="stack-sm">
                <label className="field-label" htmlFor="member-email">
                  Invite by email
                </label>
                <input
                  id="member-email"
                  type="email"
                  name="email"
                  placeholder="teammate@email.com"
                  required
                />
                <div className="inline-form">
                  <select name="role" defaultValue="VIEWER" aria-label="Member role">
                    <option value="VIEWER">Viewer</option>
                    <option value="EDITOR">Editor</option>
                  </select>
                  <button className="button button-secondary" type="submit">
                    Add or Update
                  </button>
                </div>
              </form>
            ) : null}
          </section>

          <section className="workspace-panel side-panel">
            <div className="panel-header panel-header-tight">
              <div>
                <p className="eyebrow">History</p>
                <h2>Recent snapshots</h2>
              </div>
              <p className="panel-copy">Manual and automatic checkpoints for the document.</p>
            </div>

            {versions.length === 0 ? (
              <div className="empty-state empty-state-compact">
                <h3>No snapshots yet</h3>
                <p>Create a snapshot when you want a clean milestone for this draft.</p>
              </div>
            ) : (
              <ul className="detail-list">
                {versions.map((version) => (
                  <li key={version.id} className="detail-row detail-row-stack">
                    <strong>{version.reason}</strong>
                    <p>{new Date(version.createdAt).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
