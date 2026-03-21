import Link from "next/link";
import type { ReactNode } from "react";

import type { CurrentUser } from "@/lib/auth";

type AppShellProps = {
  currentUser: CurrentUser;
  pageTitle: string;
  pageDescription: string;
  activeView: "documents" | "editor";
  sectionLabel: string;
  contextHref?: string;
  contextLabel?: string;
  pageActions?: ReactNode;
  children: ReactNode;
};

function joinClassNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function AppShell({
  currentUser,
  pageTitle,
  pageDescription,
  activeView,
  sectionLabel,
  contextHref,
  contextLabel,
  pageActions,
  children
}: AppShellProps) {
  return (
    <main className="workspace-shell">
      <aside className="workspace-sidebar">
        <div className="sidebar-frame">
          <Link href="/docs" className="brand-lockup">
            <span className="brand-badge">C</span>
            <span>
              <strong>CloudMD</strong>
              <small>Lean collaborative markdown</small>
            </span>
          </Link>

          <nav className="sidebar-nav" aria-label="Primary">
            <Link
              href="/docs"
              className={joinClassNames(
                "sidebar-nav-item",
                activeView === "documents" && "is-active"
              )}
            >
              Documents
            </Link>
            <div
              className={joinClassNames(
                "sidebar-nav-item",
                activeView === "editor" && "is-active"
              )}
            >
              {activeView === "editor" ? "Current Workspace" : "Editor Workspace"}
            </div>
          </nav>

          <section className="sidebar-note">
            <p className="eyebrow">Focused workflow</p>
            <p>
              Designed for calm drafting, quick sharing, anchored comments, and
              dependable autosave.
            </p>
          </section>
        </div>
      </aside>

      <section className="workspace-main">
        <header className="workspace-topbar">
          <div className="workspace-title-group">
            {contextHref && contextLabel ? (
              <Link className="context-link" href={contextHref}>
                {contextLabel}
              </Link>
            ) : null}
            <p className="eyebrow">{sectionLabel}</p>
            <h1>{pageTitle}</h1>
            <p className="workspace-description">{pageDescription}</p>
          </div>

          <div className="workspace-topbar-side">
            {pageActions ? <div className="topbar-actions">{pageActions}</div> : null}

            <div className="account-card">
              <div>
                <strong>{currentUser.name}</strong>
                <p>{currentUser.email}</p>
              </div>
              <Link className="button button-ghost" href="/api/auth/signout?callbackUrl=/">
                Sign Out
              </Link>
            </div>
          </div>
        </header>

        <div className="workspace-content">{children}</div>
      </section>
    </main>
  );
}
