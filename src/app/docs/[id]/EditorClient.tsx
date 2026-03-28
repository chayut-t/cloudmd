"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import type { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AppShell } from "@/app/components/AppShell";
import { CommentPanel } from "@/app/components/CommentPanel";
import type { EditorMode } from "@/app/components/EditorModeToggle";
import { MarkdownPreview } from "@/app/components/MarkdownPreview";
import { MembersPanel } from "@/app/components/MembersPanel";
import { SidePanel } from "@/app/components/SidePanel";
import { StatusIndicator, type SaveStatus } from "@/app/components/StatusIndicator";
import { Toolbar } from "@/app/components/Toolbar";
import { VersionsPanel } from "@/app/components/VersionsPanel";
import { IconArrowLeft, IconComment, IconHistory, IconUsers } from "@/app/components/icons";
import type { CurrentUser } from "@/lib/auth";

import styles from "./EditorClient.module.css";

const MarkdownEditor = dynamic(
  () => import("@/app/components/MarkdownEditor").then((m) => m.MarkdownEditor),
  { ssr: false }
);

type EditorComment = {
  id: string;
  body: string;
  anchorStart: number | null;
  anchorEnd: number | null;
  createdAt: string;
  authorName: string | null;
  authorEmail: string;
};

type MemberUser = {
  name?: string | null;
  email?: string | null;
};

type Member = {
  id: string;
  userId: string;
  role: string;
  user?: MemberUser | null;
};

type Version = {
  id: string;
  reason: string;
  createdAt: string;
};

type Owner = {
  name?: string | null;
  email?: string | null;
};

type ActivePanel = "comments" | "members" | "versions" | null;

type EditorClientProps = {
  currentUser: CurrentUser;
  documentId: string;
  initialTitle: string;
  initialContent: string;
  canEditDocument: boolean;
  canComment: boolean;
  initialComments: EditorComment[];
  owner: Owner | null;
  members: Member[];
  ownerId: string;
  canManageMembers: boolean;
  addMemberAction?: (formData: FormData) => void;
  versions: Version[];
};

export function EditorClient({
  currentUser,
  documentId,
  initialTitle,
  initialContent,
  canEditDocument,
  canComment,
  initialComments,
  owner,
  members,
  ownerId,
  canManageMembers,
  addMemberAction,
  versions
}: EditorClientProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [comments, setComments] = useState(initialComments);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
  const [mode, setMode] = useState<EditorMode>("edit");
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  const editorRef = useRef<ReactCodeMirrorRef>(null);
  const hydratedRef = useRef(false);
  const lastSavedRef = useRef({ title: initialTitle, content: initialContent });

  const isDirty = useMemo(
    () => title !== lastSavedRef.current.title || content !== lastSavedRef.current.content,
    [title, content]
  );

  const displayStatus: SaveStatus = saveStatus === "idle" && isDirty ? "unsaved" : saveStatus;

  // Autosave
  useEffect(() => {
    if (!canEditDocument) return;
    if (!hydratedRef.current) {
      hydratedRef.current = true;
      return;
    }
    if (!isDirty) return;

    setSaveStatus("saving");

    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/documents/${documentId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content })
        });
        if (!response.ok) throw new Error("Save failed");
        lastSavedRef.current = { title, content };
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [canEditDocument, content, documentId, isDirty, title]);

  const handleContentChange = useCallback((val: string) => setContent(val), []);

  const handleSelectionChange = useCallback(
    (from: number, to: number) => setSelection({ start: from, end: to }),
    []
  );

  async function createSnapshot() {
    if (!canEditDocument) return;
    const response = await fetch(`/api/documents/${documentId}/versions`, {
      method: "POST"
    });
    if (!response.ok) {
      setSaveStatus("error");
      return;
    }
    setSaveStatus("saved");
  }

  // Title input for topbar (rendered via portal pattern — passed to AppShell)
  const titleInput = (
    <input
      type="text"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      disabled={!canEditDocument}
      maxLength={120}
      className={styles.titleInput}
      aria-label="Document title"
    />
  );

  const backLink = (
    <Link href="/docs" className={styles.backLink}>
      <IconArrowLeft width={16} height={16} />
      Docs
    </Link>
  );

  const titleStatusRow = (
    <div className={styles.titleStatusRow}>
      {titleInput}
      <StatusIndicator status={displayStatus} />
    </div>
  );

  return (
    <AppShell currentUser={currentUser} left={backLink} center={titleStatusRow}>
      <Toolbar
        editorRef={editorRef}
        mode={mode}
        onModeChange={setMode}
        activePanel={activePanel}
        onPanelToggle={setActivePanel}
        readOnly={!canEditDocument}
      />

      {/* Main editor area + side panel */}
      <div className={styles.layout}>
        <div className={styles.editorArea}>
          {mode === "edit" && (
            <div className={styles.page}>
              <MarkdownEditor
                ref={editorRef}
                value={content}
                onChange={handleContentChange}
                readOnly={!canEditDocument}
                onSelectionChange={handleSelectionChange}
              />
            </div>
          )}

          {mode === "preview" && (
            <div className={styles.page}>
              <MarkdownPreview content={content} />
            </div>
          )}

          {mode === "split" && (
            <div className={`${styles.splitContainer} ${styles.pageFullWidth}`}>
              <div className={styles.splitPane}>
                <MarkdownEditor
                  ref={editorRef}
                  value={content}
                  onChange={handleContentChange}
                  readOnly={!canEditDocument}
                  onSelectionChange={handleSelectionChange}
                />
              </div>
              <div className={styles.splitDivider} />
              <div className={styles.splitPane}>
                <MarkdownPreview content={content} />
              </div>
            </div>
          )}
        </div>

        {activePanel === "comments" && (
          <SidePanel
            title="Comments"
            icon={<IconComment width={16} height={16} />}
            onClose={() => setActivePanel(null)}
          >
            <CommentPanel
              documentId={documentId}
              comments={comments}
              onCommentAdded={(c) => setComments((prev) => [c, ...prev])}
              canComment={canComment}
              selection={selection}
            />
          </SidePanel>
        )}

        {activePanel === "members" && (
          <SidePanel
            title="Members"
            icon={<IconUsers width={16} height={16} />}
            onClose={() => setActivePanel(null)}
          >
            <MembersPanel
              owner={owner}
              members={members}
              ownerId={ownerId}
              canManage={canManageMembers}
              addMemberAction={addMemberAction}
            />
          </SidePanel>
        )}

        {activePanel === "versions" && (
          <SidePanel
            title="Version History"
            icon={<IconHistory width={16} height={16} />}
            onClose={() => setActivePanel(null)}
          >
            <VersionsPanel
              versions={versions}
              canEdit={canEditDocument}
              onCreateSnapshot={createSnapshot}
            />
          </SidePanel>
        )}
      </div>
    </AppShell>
  );
}
