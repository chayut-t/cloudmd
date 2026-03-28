"use client";

import type { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import type { RefObject } from "react";

import { EditorModeToggle, type EditorMode } from "./EditorModeToggle";
import {
  IconBold,
  IconItalic,
  IconHeading,
  IconLink,
  IconCode,
  IconList,
  IconListOrdered,
  IconQuote,
  IconComment,
  IconHistory,
  IconUsers
} from "./icons";
import styles from "./Toolbar.module.css";

type ActivePanel = "comments" | "members" | "versions" | null;

type ToolbarProps = {
  editorRef: RefObject<ReactCodeMirrorRef | null>;
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  activePanel: ActivePanel;
  onPanelToggle: (panel: ActivePanel) => void;
  readOnly?: boolean;
};

function wrapSelection(
  editorRef: RefObject<ReactCodeMirrorRef | null>,
  before: string,
  after: string
) {
  const view = editorRef.current?.view;
  if (!view) return;
  const { from, to } = view.state.selection.main;
  const selected = view.state.sliceDoc(from, to);
  view.dispatch({
    changes: { from, to, insert: `${before}${selected}${after}` },
    selection: { anchor: from + before.length, head: to + before.length }
  });
  view.focus();
}

function insertAtLineStart(
  editorRef: RefObject<ReactCodeMirrorRef | null>,
  prefix: string
) {
  const view = editorRef.current?.view;
  if (!view) return;
  const { from } = view.state.selection.main;
  const line = view.state.doc.lineAt(from);
  view.dispatch({
    changes: { from: line.from, to: line.from, insert: prefix }
  });
  view.focus();
}

export function Toolbar({
  editorRef,
  mode,
  onModeChange,
  activePanel,
  onPanelToggle,
  readOnly
}: ToolbarProps) {
  const disabled = readOnly || mode === "preview";

  return (
    <div className={styles.toolbar}>
      <div className={styles.group}>
        <button
          type="button"
          className={styles.btn}
          title="Bold (Ctrl+B)"
          disabled={disabled}
          onClick={() => wrapSelection(editorRef, "**", "**")}
        >
          <IconBold width={16} height={16} />
        </button>
        <button
          type="button"
          className={styles.btn}
          title="Italic (Ctrl+I)"
          disabled={disabled}
          onClick={() => wrapSelection(editorRef, "_", "_")}
        >
          <IconItalic width={16} height={16} />
        </button>
        <button
          type="button"
          className={styles.btn}
          title="Heading"
          disabled={disabled}
          onClick={() => insertAtLineStart(editorRef, "## ")}
        >
          <IconHeading width={16} height={16} />
        </button>
      </div>

      <span className={styles.separator} />

      <div className={styles.group}>
        <button
          type="button"
          className={styles.btn}
          title="Link"
          disabled={disabled}
          onClick={() => wrapSelection(editorRef, "[", "](url)")}
        >
          <IconLink width={16} height={16} />
        </button>
        <button
          type="button"
          className={styles.btn}
          title="Code"
          disabled={disabled}
          onClick={() => wrapSelection(editorRef, "`", "`")}
        >
          <IconCode width={16} height={16} />
        </button>
        <button
          type="button"
          className={styles.btn}
          title="Quote"
          disabled={disabled}
          onClick={() => insertAtLineStart(editorRef, "> ")}
        >
          <IconQuote width={16} height={16} />
        </button>
      </div>

      <span className={styles.separator} />

      <div className={styles.group}>
        <button
          type="button"
          className={styles.btn}
          title="Bullet List"
          disabled={disabled}
          onClick={() => insertAtLineStart(editorRef, "- ")}
        >
          <IconList width={16} height={16} />
        </button>
        <button
          type="button"
          className={styles.btn}
          title="Numbered List"
          disabled={disabled}
          onClick={() => insertAtLineStart(editorRef, "1. ")}
        >
          <IconListOrdered width={16} height={16} />
        </button>
      </div>

      <span className={styles.separator} />

      <EditorModeToggle mode={mode} onChange={onModeChange} />

      <span className={styles.spacer} />

      <div className={styles.group}>
        <button
          type="button"
          className={`${styles.btn} ${activePanel === "comments" ? styles.btnActive : ""}`}
          title="Comments"
          onClick={() => onPanelToggle(activePanel === "comments" ? null : "comments")}
        >
          <IconComment width={16} height={16} />
        </button>
        <button
          type="button"
          className={`${styles.btn} ${activePanel === "members" ? styles.btnActive : ""}`}
          title="Members"
          onClick={() => onPanelToggle(activePanel === "members" ? null : "members")}
        >
          <IconUsers width={16} height={16} />
        </button>
        <button
          type="button"
          className={`${styles.btn} ${activePanel === "versions" ? styles.btnActive : ""}`}
          title="Version History"
          onClick={() => onPanelToggle(activePanel === "versions" ? null : "versions")}
        >
          <IconHistory width={16} height={16} />
        </button>
      </div>
    </div>
  );
}
