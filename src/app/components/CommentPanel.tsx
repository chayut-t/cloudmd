"use client";

import { type FormEvent, useState } from "react";
import styles from "./CommentPanel.module.css";

type Comment = {
  id: string;
  body: string;
  anchorStart: number | null;
  anchorEnd: number | null;
  createdAt: string;
  authorName: string | null;
  authorEmail: string;
};

type CommentPanelProps = {
  documentId: string;
  comments: Comment[];
  onCommentAdded: (comment: Comment) => void;
  canComment: boolean;
  selection: { start: number; end: number } | null;
};

export function CommentPanel({
  documentId,
  comments,
  onCommentAdded,
  canComment,
  selection
}: CommentPanelProps) {
  const [body, setBody] = useState("");
  const hasSelection = selection !== null && selection.start !== selection.end;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || !canComment) return;

    const response = await fetch(`/api/documents/${documentId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        body: trimmed,
        anchorStart: selection?.start ?? null,
        anchorEnd: selection?.end ?? null
      })
    });

    if (!response.ok) return;
    const json = (await response.json()) as { comment: Comment };
    onCommentAdded(json.comment);
    setBody("");
  }

  return (
    <>
      {canComment && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            {hasSelection && selection
              ? `Commenting on selection (${selection.start}-${selection.end})`
              : "Comment on document"}
          </label>
          <textarea
            className={styles.textarea}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Leave a comment..."
            maxLength={1000}
          />
          <button type="submit" className={styles.submitBtn} disabled={!body.trim()}>
            Post
          </button>
        </form>
      )}

      {comments.length === 0 ? (
        <p className={styles.empty}>No comments yet</p>
      ) : (
        <div className={styles.list}>
          {comments.map((c) => (
            <div key={c.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.author}>{c.authorName ?? c.authorEmail}</span>
                <span className={styles.time}>
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className={styles.body}>{c.body}</p>
              {c.anchorStart !== null && c.anchorEnd !== null && (
                <p className={styles.anchor}>Anchored to text selection</p>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
