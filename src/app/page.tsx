import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";

export default async function HomePage() {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/docs");
  }

  return (
    <main className="page center">
      <div className="card hero">
        <p className="eyebrow">CloudMD MVP</p>
        <h1>Collaborative Markdown Docs</h1>
        <p>
          Sign in with Google to create, edit, share, and comment on markdown
          documents.
        </p>
        <Link className="button" href="/api/auth/signin?callbackUrl=/docs">
          Continue With Google
        </Link>
      </div>
    </main>
  );
}
