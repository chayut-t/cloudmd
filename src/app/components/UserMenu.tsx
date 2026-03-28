import Link from "next/link";

import type { CurrentUser } from "@/lib/auth";
import styles from "./UserMenu.module.css";

type UserMenuProps = {
  user: CurrentUser;
};

export function UserMenu({ user }: UserMenuProps) {
  const initial = (user.name?.[0] ?? user.email[0]).toUpperCase();

  return (
    <div className={styles.menu}>
      <span className={styles.avatar} title={user.email}>{initial}</span>
      <Link className={styles.signOut} href="/api/auth/signout?callbackUrl=/">
        Sign out
      </Link>
    </div>
  );
}
