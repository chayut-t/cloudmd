import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import styles from "./page.module.css";

export default async function HomePage() {
  if (process.env.BYPASS_AUTH === "true" && process.env.NODE_ENV === "development") {
    redirect("/docs");
  }

  const session = await auth();

  if (session?.user?.id) {
    redirect("/docs");
  }

  return (
    <main className={styles.landing}>
      <div className={styles.card}>
        <span className={styles.brandIcon}>C</span>
        <h1 className={styles.title}>CloudMD</h1>
        <p className={styles.subtitle}>
          Collaborative markdown editing for small teams.
        </p>
        <Link
          className={styles.signInBtn}
          href="/api/auth/signin?callbackUrl=/docs"
        >
          Continue with Google
        </Link>
        <p className={styles.note}>
          Sign in to create, edit, and share markdown documents.
        </p>
      </div>
    </main>
  );
}
