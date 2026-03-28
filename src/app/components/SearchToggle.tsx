"use client";

import { useRef, useState } from "react";
import { IconSearch, IconX } from "./icons";
import styles from "./SearchToggle.module.css";

type SearchToggleProps = {
  defaultValue?: string;
};

export function SearchToggle({ defaultValue = "" }: SearchToggleProps) {
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleToggle() {
    setExpanded(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function handleClose() {
    setExpanded(false);
  }

  return (
    <>
      <button
        type="button"
        className={styles.toggleBtn}
        onClick={handleToggle}
        aria-label="Search documents"
      >
        <IconSearch width={18} height={18} />
      </button>

      <form
        method="GET"
        className={`${styles.searchBar} ${expanded ? styles.searchBarExpanded : ""}`}
      >
        <IconSearch width={16} height={16} className={styles.searchIcon} />
        <input
          ref={inputRef}
          type="search"
          name="q"
          placeholder="Search documents"
          defaultValue={defaultValue}
          maxLength={120}
          className={styles.searchInput}
        />
        <button
          type="button"
          className={styles.closeBtn}
          onClick={handleClose}
          aria-label="Close search"
        >
          <IconX width={16} height={16} />
        </button>
      </form>
    </>
  );
}
