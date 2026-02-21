import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

export type Role = "OWNER" | "EDITOR" | "VIEWER";

export type UserRecord = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DocumentRecord = {
  id: string;
  title: string;
  content: string;
  ownerId: string;
  lastSnapshotAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DocumentMemberRecord = {
  id: string;
  documentId: string;
  userId: string;
  role: Role;
  createdAt: string;
};

export type DocumentVersionRecord = {
  id: string;
  documentId: string;
  title: string;
  content: string;
  reason: string;
  createdById: string;
  createdAt: string;
};

export type CommentRecord = {
  id: string;
  documentId: string;
  authorId: string;
  body: string;
  anchorStart: number | null;
  anchorEnd: number | null;
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
};

type Database = {
  users: UserRecord[];
  documents: DocumentRecord[];
  members: DocumentMemberRecord[];
  versions: DocumentVersionRecord[];
  comments: CommentRecord[];
};

const DB_PATH = path.join(process.cwd(), "data", "db.json");
const FIVE_MINUTES_MS = 5 * 60 * 1000;

const emptyDb: Database = {
  users: [],
  documents: [],
  members: [],
  versions: [],
  comments: []
};

let writeLock = Promise.resolve();

function nowIso() {
  return new Date().toISOString();
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function ensureDbFile() {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });

  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify(emptyDb, null, 2), "utf8");
  }
}

async function readDb(): Promise<Database> {
  await ensureDbFile();
  const raw = await fs.readFile(DB_PATH, "utf8");
  return JSON.parse(raw) as Database;
}

async function writeDb(db: Database) {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

async function mutateDb<T>(mutator: (db: Database) => T | Promise<T>) {
  let release: (() => void) | undefined;
  const previous = writeLock;
  writeLock = new Promise<void>((resolve) => {
    release = resolve;
  });

  await previous;

  try {
    const db = await readDb();
    const result = await mutator(db);
    await writeDb(db);
    return result;
  } finally {
    release?.();
  }
}

export async function upsertUserByEmail(params: {
  email: string;
  name?: string | null;
  image?: string | null;
}) {
  const email = normalizeEmail(params.email);

  return mutateDb((db) => {
    const now = nowIso();
    const existing = db.users.find((user) => user.email === email);

    if (existing) {
      existing.name = params.name ?? existing.name;
      existing.image = params.image ?? existing.image;
      existing.updatedAt = now;
      return existing;
    }

    const user: UserRecord = {
      id: randomUUID(),
      email,
      name: params.name ?? null,
      image: params.image ?? null,
      createdAt: now,
      updatedAt: now
    };

    db.users.push(user);
    return user;
  });
}

export async function getUserByEmail(email: string) {
  const normalized = normalizeEmail(email);
  const db = await readDb();
  return db.users.find((user) => user.email === normalized) ?? null;
}

export async function listDocumentsForUser(userId: string, titleQuery?: string) {
  const db = await readDb();
  const query = titleQuery?.trim().toLowerCase() ?? "";

  const docs = db.documents.filter((doc) => {
    const hasAccess =
      doc.ownerId === userId || db.members.some((member) => member.documentId === doc.id && member.userId === userId);

    if (!hasAccess) {
      return false;
    }

    if (!query) {
      return true;
    }

    return doc.title.toLowerCase().includes(query);
  });

  return docs
    .map((doc) => {
      const userRole =
        doc.ownerId === userId
          ? "OWNER"
          : (db.members.find((member) => member.documentId === doc.id && member.userId === userId)?.role ??
            "VIEWER");

      return {
        ...doc,
        userRole
      };
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function createDocumentForOwner(ownerId: string, title: string, content: string) {
  return mutateDb((db) => {
    const now = nowIso();
    const document: DocumentRecord = {
      id: randomUUID(),
      title,
      content,
      ownerId,
      lastSnapshotAt: null,
      createdAt: now,
      updatedAt: now
    };

    const ownerMembership: DocumentMemberRecord = {
      id: randomUUID(),
      documentId: document.id,
      userId: ownerId,
      role: "OWNER",
      createdAt: now
    };

    db.documents.push(document);
    db.members.push(ownerMembership);

    return document;
  });
}

export async function getRoleForDocument(documentId: string, userId: string): Promise<Role | null> {
  const db = await readDb();
  const doc = db.documents.find((document) => document.id === documentId);

  if (!doc) {
    return null;
  }

  if (doc.ownerId === userId) {
    return "OWNER";
  }

  return db.members.find((member) => member.documentId === documentId && member.userId === userId)?.role ?? null;
}

export async function getDocumentBundle(documentId: string, userId: string) {
  const db = await readDb();
  const document = db.documents.find((doc) => doc.id === documentId);

  if (!document) {
    return null;
  }

  const role = await getRoleForDocument(documentId, userId);
  if (!role) {
    return null;
  }

  const owner = db.users.find((user) => user.id === document.ownerId) ?? null;

  const members = db.members
    .filter((member) => member.documentId === document.id)
    .map((member) => ({
      ...member,
      user: db.users.find((user) => user.id === member.userId) ?? null
    }))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const comments = db.comments
    .filter((comment) => comment.documentId === document.id)
    .map((comment) => ({
      ...comment,
      author: db.users.find((user) => user.id === comment.authorId) ?? null
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 50);

  const versions = db.versions
    .filter((version) => version.documentId === document.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 10);

  return {
    role,
    document,
    owner,
    members,
    comments,
    versions
  };
}

export async function saveDocument(params: {
  documentId: string;
  userId: string;
  title: string;
  content: string;
}) {
  return mutateDb((db) => {
    const document = db.documents.find((doc) => doc.id === params.documentId);
    if (!document) {
      return { status: "not_found" as const };
    }

    const role =
      document.ownerId === params.userId
        ? "OWNER"
        : (db.members.find(
            (member) => member.documentId === params.documentId && member.userId === params.userId
          )?.role ?? null);

    if (role !== "OWNER" && role !== "EDITOR") {
      return { status: "forbidden" as const };
    }

    const now = nowIso();

    document.title = params.title;
    document.content = params.content;
    document.updatedAt = now;

    const shouldCheckpoint =
      !document.lastSnapshotAt ||
      new Date(now).getTime() - new Date(document.lastSnapshotAt).getTime() >= FIVE_MINUTES_MS;

    if (shouldCheckpoint) {
      db.versions.push({
        id: randomUUID(),
        documentId: document.id,
        title: document.title,
        content: document.content,
        reason: "autosave-checkpoint",
        createdById: params.userId,
        createdAt: now
      });

      document.lastSnapshotAt = now;
    }

    return { status: "ok" as const };
  });
}

export async function addComment(params: {
  documentId: string;
  userId: string;
  body: string;
  anchorStart: number | null;
  anchorEnd: number | null;
}) {
  return mutateDb((db) => {
    const document = db.documents.find((doc) => doc.id === params.documentId);
    if (!document) {
      return { status: "not_found" as const };
    }

    const role =
      document.ownerId === params.userId
        ? "OWNER"
        : (db.members.find(
            (member) => member.documentId === params.documentId && member.userId === params.userId
          )?.role ?? null);

    if (!role) {
      return { status: "forbidden" as const };
    }

    const now = nowIso();

    const comment: CommentRecord = {
      id: randomUUID(),
      documentId: params.documentId,
      authorId: params.userId,
      body: params.body,
      anchorStart: params.anchorStart,
      anchorEnd: params.anchorEnd,
      resolved: false,
      createdAt: now,
      updatedAt: now
    };

    db.comments.push(comment);

    const author = db.users.find((user) => user.id === params.userId) ?? null;

    return {
      status: "ok" as const,
      comment,
      author
    };
  });
}

export async function createSnapshot(params: {
  documentId: string;
  userId: string;
  reason: string;
}) {
  return mutateDb((db) => {
    const document = db.documents.find((doc) => doc.id === params.documentId);
    if (!document) {
      return { status: "not_found" as const };
    }

    const role =
      document.ownerId === params.userId
        ? "OWNER"
        : (db.members.find(
            (member) => member.documentId === params.documentId && member.userId === params.userId
          )?.role ?? null);

    if (role !== "OWNER" && role !== "EDITOR") {
      return { status: "forbidden" as const };
    }

    const now = nowIso();

    db.versions.push({
      id: randomUUID(),
      documentId: document.id,
      title: document.title,
      content: document.content,
      reason: params.reason,
      createdById: params.userId,
      createdAt: now
    });

    document.lastSnapshotAt = now;
    document.updatedAt = now;

    return { status: "ok" as const };
  });
}

export async function upsertMemberByEmail(params: {
  documentId: string;
  requesterUserId: string;
  email: string;
  role: Role;
}) {
  return mutateDb((db) => {
    const document = db.documents.find((doc) => doc.id === params.documentId);
    if (!document) {
      return { status: "not_found" as const };
    }

    if (document.ownerId !== params.requesterUserId) {
      return { status: "forbidden" as const };
    }

    const email = normalizeEmail(params.email);
    const targetUser = db.users.find((user) => user.email === email);

    if (!targetUser) {
      return { status: "user_missing" as const };
    }

    if (targetUser.id === document.ownerId) {
      return { status: "owner_skipped" as const };
    }

    const existing = db.members.find(
      (member) => member.documentId === document.id && member.userId === targetUser.id
    );

    if (existing) {
      existing.role = params.role;
    } else {
      db.members.push({
        id: randomUUID(),
        documentId: document.id,
        userId: targetUser.id,
        role: params.role,
        createdAt: nowIso()
      });
    }

    document.updatedAt = nowIso();

    return { status: "ok" as const };
  });
}
