import styles from "./MembersPanel.module.css";

type MemberUser = {
  name?: string | null;
  email?: string | null;
};

type Member = {
  id: string;
  userId: string;
  role: string;
  user?: MemberUser | null;
};

type Owner = {
  name?: string | null;
  email?: string | null;
};

type MembersPanelProps = {
  owner: Owner | null;
  members: Member[];
  ownerId: string;
  canManage: boolean;
  addMemberAction?: (formData: FormData) => void;
};

function roleClass(role: string) {
  if (role === "OWNER") return styles.roleOwner;
  if (role === "EDITOR") return styles.roleEditor;
  return styles.roleViewer;
}

export function MembersPanel({
  owner,
  members,
  ownerId,
  canManage,
  addMemberAction
}: MembersPanelProps) {
  return (
    <>
      <div className={styles.list}>
        <div className={styles.member}>
          <div className={styles.memberInfo}>
            <div className={styles.memberName}>{owner?.name ?? owner?.email ?? "Unknown"}</div>
            <div className={styles.memberEmail}>{owner?.email ?? ""}</div>
          </div>
          <span className={`${styles.roleBadge} ${styles.roleOwner}`}>Owner</span>
        </div>
        {members
          .filter((m) => m.userId !== ownerId)
          .map((m) => (
            <div key={m.id} className={styles.member}>
              <div className={styles.memberInfo}>
                <div className={styles.memberName}>
                  {m.user?.name ?? m.user?.email ?? "Unknown"}
                </div>
                <div className={styles.memberEmail}>{m.user?.email ?? ""}</div>
              </div>
              <span className={`${styles.roleBadge} ${roleClass(m.role)}`}>
                {m.role.toLowerCase()}
              </span>
            </div>
          ))}
      </div>

      {canManage && addMemberAction && (
        <form action={addMemberAction} className={styles.form}>
          <span className={styles.formTitle}>Invite member</span>
          <input
            type="email"
            name="email"
            placeholder="email@example.com"
            required
            className={styles.input}
          />
          <div className={styles.formRow}>
            <select name="role" defaultValue="VIEWER" className={styles.select}>
              <option value="VIEWER">Viewer</option>
              <option value="EDITOR">Editor</option>
            </select>
            <button type="submit" className={styles.addBtn}>Invite</button>
          </div>
        </form>
      )}
    </>
  );
}
