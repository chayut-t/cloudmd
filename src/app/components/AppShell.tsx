import Link from "next/link";
import type { ReactNode } from "react";

import type { CurrentUser } from "@/lib/auth";
import { UserMenu } from "./UserMenu";
import styles from "./AppShell.module.css";

type AppShellProps = {
  currentUser: CurrentUser;
  left?: ReactNode;
  center?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
};

export function AppShell({ currentUser, left, center, actions, children }: AppShellProps) {
  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <Link href="/docs" className={styles.brand}>
          <span className={styles.brandIcon}>C</span>
          <span className={styles.brandName}>CloudMD</span>
        </Link>

        {left && <div className={styles.left}>{left}</div>}

        <div className={styles.center}>{center}</div>

        <div className={styles.right}>
          {actions}
          <UserMenu user={currentUser} />
        </div>
      </header>

      <div className={styles.content}>{children}</div>
    </div>
  );
}
