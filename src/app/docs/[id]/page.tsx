import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";

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
    <EditorClient
      currentUser={user}
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
      owner={owner}
      members={members.map((m) => ({
        id: m.id,
        userId: m.userId,
        role: m.role,
        user: m.user
      }))}
      ownerId={document.ownerId}
      canManageMembers={canManageMembers(role)}
      addMemberAction={addMemberAction}
      versions={versions.map((v) => ({
        id: v.id,
        reason: v.reason,
        createdAt: v.createdAt
      }))}
    />
  );
}
