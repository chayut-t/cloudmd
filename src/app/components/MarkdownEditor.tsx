"use client";

import CodeMirror, { type ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { EditorView } from "@codemirror/view";
import { forwardRef, useCallback } from "react";

import styles from "./MarkdownEditor.module.css";

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  onSelectionChange?: (from: number, to: number) => void;
};

const theme = EditorView.theme({
  "&": {
    backgroundColor: "transparent",
    height: "100%"
  },
  ".cm-scroller": {
    fontFamily: "var(--font-mono)"
  }
});

export const MarkdownEditor = forwardRef<ReactCodeMirrorRef, MarkdownEditorProps>(
  function MarkdownEditor({ value, onChange, readOnly, onSelectionChange }, ref) {
    const handleChange = useCallback(
      (val: string) => {
        onChange(val);
      },
      [onChange]
    );

    return (
      <div className={styles.wrapper}>
        <CodeMirror
          ref={ref}
          value={value}
          onChange={handleChange}
          readOnly={readOnly}
          extensions={[
            markdown({ base: markdownLanguage, codeLanguages: languages }),
            theme,
            EditorView.lineWrapping,
            EditorView.updateListener.of((update) => {
              if (onSelectionChange && update.selectionSet) {
                const range = update.state.selection.main;
                onSelectionChange(range.from, range.to);
              }
            })
          ]}
          basicSetup={{
            lineNumbers: false,
            foldGutter: false,
            highlightActiveLine: true,
            bracketMatching: true,
            closeBrackets: true,
            indentOnInput: true,
            autocompletion: false
          }}
        />
      </div>
    );
  }
);
