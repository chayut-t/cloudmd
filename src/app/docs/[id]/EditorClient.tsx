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
    <section className="card stack-md">
      <div className="row gap-sm wrap">
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          disabled={!canEditDocument}
          maxLength={120}
          className="title-input"
        />
        <button
          type="button"
          onClick={createSnapshot}
          className="button subtle"
          disabled={!canEditDocument}
        >
          Create Snapshot
        </button>
        <p className="muted small">Status: {saveStatus}</p>
      </div>

      <textarea
        className="editor"
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

      <form onSubmit={handleCommentSubmit} className="stack-sm">
        <label htmlFor="comment" className="small">
          Add comment
          {selection
            ? ` (range ${selection.start}-${selection.end})`
            : " (no range selected)"}
        </label>
        <textarea
          id="comment"
          value={commentBody}
          onChange={(event) => setCommentBody(event.target.value)}
          rows={3}
          maxLength={1000}
        />
        <button className="button" type="submit" disabled={!canComment}>
          Post Comment
        </button>
      </form>

      <div>
        <h2>Comments</h2>
        <ul className="list compact">
          {comments.length === 0 ? (
            <li className="muted">No comments yet.</li>
          ) : (
            comments.map((comment) => (
              <li key={comment.id}>
                <p>{comment.body}</p>
                <p className="muted small">
                  {comment.authorName ?? comment.authorEmail} ·
                  {` ${new Date(comment.createdAt).toLocaleString()}`}
                  {comment.anchorStart !== null && comment.anchorEnd !== null
                    ? ` · range ${comment.anchorStart}-${comment.anchorEnd}`
                    : ""}
                </p>
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  );
}
