import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";

export default async function HomePage() {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/docs");
  }

  return (
    <main className="marketing-shell">
      <section className="marketing-hero">
        <div className="marketing-copy">
          <p className="eyebrow">CloudMD Workspace</p>
          <h1>Markdown collaboration with the calm precision of a modern doc tool.</h1>
          <p className="marketing-description">
            Create, edit, share, comment, and snapshot technical documents in a
            workspace that feels polished, focused, and fast.
          </p>

          <div className="feature-pills" aria-label="Features">
            <span className="feature-pill">Google sign-in</span>
            <span className="feature-pill">Autosave</span>
            <span className="feature-pill">Sharing by role</span>
            <span className="feature-pill">Snapshots</span>
            <span className="feature-pill">Anchored comments</span>
          </div>

          <div className="marketing-actions">
            <Link
              className="button button-primary button-large"
              href="/api/auth/signin?callbackUrl=/docs"
            >
              Continue with Google
            </Link>
            <p className="marketing-note">
              Built for small teams shaping specs, notes, and internal docs.
            </p>
          </div>
        </div>

        <div className="marketing-preview" aria-hidden="true">
          <div className="preview-window">
            <div className="preview-window-bar">
              <span />
              <span />
              <span />
            </div>

            <div className="preview-canvas">
              <div className="preview-topline">
                <div>
                  <p className="eyebrow">Document workspace</p>
                  <h2>Release notes planning</h2>
                </div>
                <span className="status-pill status-pill-saved">Saved</span>
              </div>

              <div className="preview-toolbar">
                <span>Markdown</span>
                <span>Comments</span>
                <span>Snapshots</span>
              </div>

              <div className="preview-body">
                <div className="preview-editor-lines">
                  <span className="line line-title" />
                  <span className="line line-wide" />
                  <span className="line line-medium" />
                  <span className="line line-wide" />
                  <span className="line line-short" />
                </div>

                <div className="preview-sidebar-card">
                  <p className="eyebrow">Activity</p>
                  <div className="preview-comment">
                    <strong>Comment thread</strong>
                    <p>Tighten the API launch copy and keep the rollout note concise.</p>
                  </div>
                  <div className="preview-mini-list">
                    <span>3 collaborators</span>
                    <span>2 snapshots</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
