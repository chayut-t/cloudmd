"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type EditorComment = {
  id: string;
  body: string;
  anchorStart: number | null;
  anchorEnd: number | null;
  createdAt: string;
  authorName: string | null;
  authorEmail: string;
};

type EditorClientProps = {
  documentId: string;
  initialTitle: string;
  initialContent: string;
  canEditDocument: boolean;
  canComment: boolean;
  initialComments: EditorComment[];
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function EditorClient({
  documentId,
  initialTitle,
  initialContent,
  canEditDocument,
  canComment,
  initialComments
}: EditorClientProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [commentBody, setCommentBody] = useState("");
  const [comments, setComments] = useState(initialComments);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);

  const hydratedRef = useRef(false);
  const lastSavedRef = useRef({ title: initialTitle, content: initialContent });

  const isDirty = useMemo(() => {
    return title !== lastSavedRef.current.title || content !== lastSavedRef.current.content;
  }, [title, content]);
  const hasRangeSelection =
    selection !== null && selection.start !== selection.end;

  const saveStatusLabel =
    saveStatus === "saving"
      ? "Saving"
      : saveStatus === "saved"
        ? "Saved"
        : saveStatus === "error"
          ? "Save issue"
          : isDirty
            ? "Unsaved"
            : "Ready";

  const saveStatusClassName =
    saveStatus === "saving"
      ? "status-pill status-pill-saving"
      : saveStatus === "saved"
        ? "status-pill status-pill-saved"
        : saveStatus === "error"
          ? "status-pill status-pill-error"
          : "status-pill status-pill-neutral";

  useEffect(() => {
    if (!canEditDocument) {
      return;
    }

    if (!hydratedRef.current) {
      hydratedRef.current = true;
      return;
    }

    if (!isDirty) {
      return;
    }

    setSaveStatus("saving");

    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/documents/${documentId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ title, content })
        });

        if (!response.ok) {
          throw new Error("Save failed");
        }

        lastSavedRef.current = { title, content };
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
    }, 900);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [canEditDocument, content, documentId, isDirty, title]);

  async function createSnapshot() {
    if (!canEditDocument) {
      return;
    }

    const response = await fetch(`/api/documents/${documentId}/versions`, {
      method: "POST"
    });

    if (!response.ok) {
      setSaveStatus("error");
      return;
    }

    setSaveStatus("saved");
  }

  async function handleCommentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canComment) {
      return;
    }

    const body = commentBody.trim();

    if (!body) {
      return;
    }

    const response = await fetch(`/api/documents/${documentId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        body,
        anchorStart: selection?.start ?? null,
        anchorEnd: selection?.end ?? null
      })
    });

    if (!response.ok) {
      return;
    }

    const json = (await response.json()) as { comment: EditorComment };
    setComments((existing) => [json.comment, ...existing]);
    setCommentBody("");
  }

  return (
    <section className="editor-workspace">
      <div className="editor-surface">
        <div className="editor-header">
          <div className="editor-heading">
            <p className="eyebrow">Markdown document</p>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={!canEditDocument}
              maxLength={120}
              className="editor-title-input"
            />
          </div>

          <div className="editor-header-actions">
            <span className={saveStatusClassName}>{saveStatusLabel}</span>
            <span className="status-pill status-pill-neutral">
              {canEditDocument ? "Editor" : "Viewer"}
            </span>
            <button
              type="button"
              onClick={createSnapshot}
              className="button button-secondary"
              disabled={!canEditDocument}
            >
              Create Snapshot
            </button>
          </div>
        </div>

        <div className="editor-toolbar">
          <div className="toolbar-pills">
            <span className="toolbar-pill">Focused writing</span>
            <span className="toolbar-pill">Autosave</span>
            <span className="toolbar-pill">Markdown</span>
          </div>
          <p className="editor-toolbar-copy">
            {canEditDocument
              ? "Changes save automatically while you type."
              : "You have read-only access to this document workspace."}
          </p>
        </div>

        <textarea
          className="editor-canvas"
          value={content}
          readOnly={!canEditDocument}
          onChange={(event) => setContent(event.target.value)}
          onSelect={(event) => {
            const element = event.currentTarget;
            setSelection({
              start: element.selectionStart,
              end: element.selectionEnd
            });
          }}
        />
      </div>

      <aside className="workspace-panel comment-panel">
        <div className="panel-header panel-header-tight">
          <div>
            <p className="eyebrow">Conversation</p>
            <h2>Comments</h2>
          </div>
          <p className="panel-copy">Anchor review notes to a selected text range when needed.</p>
        </div>

        <form onSubmit={handleCommentSubmit} className="stack-sm">
          <label htmlFor="comment" className="field-label">
            {hasRangeSelection && selection
              ? `Selected range ${selection.start}-${selection.end}`
              : "Comment on the full document or select text first"}
          </label>
          <textarea
            id="comment"
            value={commentBody}
            onChange={(event) => setCommentBody(event.target.value)}
            rows={4}
            maxLength={1000}
            disabled={!canComment}
          />
          <button
            className="button button-primary"
            type="submit"
            disabled={!canComment}
          >
            Post Comment
          </button>
        </form>

        {comments.length === 0 ? (
          <div className="empty-state empty-state-compact">
            <h3>No comments yet</h3>
            <p>Use comments for precise review notes, open questions, and edits to revisit.</p>
          </div>
        ) : (
          <ul className="comment-list">
            {comments.map((comment) => (
              <li key={comment.id} className="comment-card">
                <div className="comment-card-topline">
                  <strong>{comment.authorName ?? comment.authorEmail}</strong>
                  <span>{new Date(comment.createdAt).toLocaleString()}</span>
                </div>
                <p>{comment.body}</p>
                {comment.anchorStart !== null && comment.anchorEnd !== null ? (
                  <p className="comment-range">
                    Anchored to range {comment.anchorStart}-{comment.anchorEnd}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </aside>
    </section>
  );
}
