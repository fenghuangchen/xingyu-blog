import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { hashPassword } from "./password";
import {
  SEED_LIKE_COUNTS,
  SEED_MESSAGES,
  SEED_MOMENTS,
  SEED_NOTES,
  OWNER_HANDLE,
  OWNER_PASSWORD,
  OWNER_SEED,
  readSeedContent,
} from "./seed";
import { parseTheme } from "./theme";
import type {
  CreatorCard,
  FriendMessage,
  FriendMoment,
  FriendState,
  FriendUser,
  Message,
  Moment,
  Note,
  NoteStatus,
  NoteSummary,
  PublicUser,
  Site,
  SiteStats,
  SocialLink,
  ThemeConfig,
  UserRecord,
} from "./types";
import { estimateReadingMinutes, normalizeTags } from "./utils";

type Row = Record<string, unknown>;

const globalStore = globalThis as unknown as { __xingyuDb?: DatabaseSync };

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function int(value: unknown): number {
  return Number(value ?? 0);
}

function parseStringArray(value: unknown): string[] {
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function parseSocials(value: unknown): SocialLink[] {
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is SocialLink =>
          Boolean(item) &&
          typeof item.label === "string" &&
          typeof item.url === "string",
      )
      .slice(0, 6);
  } catch {
    return [];
  }
}

function mapUser(row: Row): UserRecord {
  return {
    id: text(row.id),
    handle: text(row.handle),
    email: row.email ? text(row.email) : null,
    passwordHash: text(row.password_hash),
    displayName: text(row.display_name),
    siteTitle: text(row.site_title),
    tagline: text(row.tagline),
    bio: text(row.bio),
    now: text(row.now),
    location: text(row.location),
    tags: parseStringArray(row.tags),
    avatar: text(row.avatar),
    socials: parseSocials(row.socials),
    theme: parseTheme(row.theme),
    recoveryQuestion: text(row.recovery_question),
    recoveryAnswerHash: text(row.recovery_answer_hash),
    createdAt: text(row.created_at),
  };
}

function mapNote(row: Row): Note {
  return {
    id: text(row.id),
    userId: text(row.user_id),
    slug: text(row.slug),
    title: text(row.title),
    summary: text(row.summary),
    content: text(row.content),
    category: text(row.category),
    tags: parseStringArray(row.tags),
    cover: text(row.cover) || "orbit",
    pinned: int(row.pinned) === 1,
    status: text(row.status) === "draft" ? "draft" : "published",
    views: int(row.views),
    minutes: Math.max(1, int(row.minutes)),
    likes: int(row.likes),
    createdAt: text(row.created_at),
    updatedAt: text(row.updated_at),
  };
}

function mapNoteSummary(row: Row): NoteSummary {
  const { content: _content, ...rest } = mapNote(row);
  return rest;
}

function mapMoment(row: Row): Moment {
  return {
    id: text(row.id),
    userId: text(row.user_id),
    content: text(row.content),
    mood: text(row.mood),
    createdAt: text(row.created_at),
  };
}

function mapMessage(row: Row): Message {
  return {
    id: text(row.id),
    siteUserId: text(row.site_user_id),
    authorUserId: row.author_user_id ? text(row.author_user_id) : null,
    authorName: text(row.author_name),
    authorHandle: row.author_handle ? text(row.author_handle) : null,
    content: text(row.content),
    createdAt: text(row.created_at),
  };
}

function toPublicUser(user: UserRecord): PublicUser {
  const {
    passwordHash: _passwordHash,
    email: _email,
    recoveryAnswerHash: _recoveryAnswerHash,
    ...rest
  } = user;
  return rest;
}

function createSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      handle TEXT NOT NULL UNIQUE,
      email TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      site_title TEXT NOT NULL DEFAULT '',
      tagline TEXT NOT NULL DEFAULT '',
      bio TEXT NOT NULL DEFAULT '',
      now TEXT NOT NULL DEFAULT '',
      location TEXT NOT NULL DEFAULT '',
      tags TEXT NOT NULL DEFAULT '[]',
      avatar TEXT NOT NULL DEFAULT '',
      socials TEXT NOT NULL DEFAULT '[]',
      theme TEXT NOT NULL DEFAULT '{}',
      recovery_question TEXT NOT NULL DEFAULT '',
      recovery_answer_hash TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      slug TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT '',
      tags TEXT NOT NULL DEFAULT '[]',
      cover TEXT NOT NULL DEFAULT 'orbit',
      pinned INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'published',
      views INTEGER NOT NULL DEFAULT 0,
      minutes INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(user_id, slug)
    );

    CREATE INDEX IF NOT EXISTS idx_notes_user
      ON notes(user_id, status, created_at DESC);

    CREATE TABLE IF NOT EXISTS moments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      mood TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_moments_user
      ON moments(user_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      site_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      author_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      author_name TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_messages_site
      ON messages(site_user_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS likes (
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      visitor_key TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (target_type, target_id, visitor_key)
    );

    CREATE INDEX IF NOT EXISTS idx_likes_target
      ON likes(target_type, target_id);

    CREATE TABLE IF NOT EXISTS friendships (
      id TEXT PRIMARY KEY,
      requester_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      addressee_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(requester_id, addressee_id)
    );

    CREATE INDEX IF NOT EXISTS idx_friendships_requester
      ON friendships(requester_id, status);

    CREATE INDEX IF NOT EXISTS idx_friendships_addressee
      ON friendships(addressee_id, status);

    CREATE TABLE IF NOT EXISTS friend_messages (
      id TEXT PRIMARY KEY,
      sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      receiver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      read_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_friend_messages_receiver
      ON friend_messages(receiver_id, read_at, created_at);

    CREATE INDEX IF NOT EXISTS idx_friend_messages_pair
      ON friend_messages(sender_id, receiver_id, created_at);
  `);
}

function seedDatabase(db: DatabaseSync) {
  const row = db.prepare("SELECT COUNT(*) AS count FROM users").get() as Row;
  if (int(row.count) > 0) return;

  db.exec("BEGIN");
  try {
    const now = new Date().toISOString();
    const passwordHash = hashPassword(OWNER_PASSWORD);

    db.prepare(
      `INSERT INTO users
        (id, handle, email, password_hash, display_name, site_title, tagline,
         bio, now, location, tags, avatar, socials, theme, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      OWNER_SEED.id,
      OWNER_SEED.handle,
      OWNER_SEED.email,
      passwordHash,
      OWNER_SEED.displayName,
      OWNER_SEED.siteTitle,
      OWNER_SEED.tagline,
      OWNER_SEED.bio,
      OWNER_SEED.now,
      OWNER_SEED.location,
      JSON.stringify(OWNER_SEED.tags),
      OWNER_SEED.avatar,
      JSON.stringify(OWNER_SEED.socials),
      JSON.stringify(OWNER_SEED.theme),
      OWNER_SEED.createdAt,
    );

    const insertNote = db.prepare(
      `INSERT INTO notes
        (id, user_id, slug, title, summary, content, category, tags, cover,
         pinned, status, views, minutes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );

    for (const note of SEED_NOTES) {
      const content = readSeedContent(note.file);
      insertNote.run(
        note.id,
        OWNER_SEED.id,
        note.slug,
        note.title,
        note.summary,
        content,
        note.category,
        JSON.stringify(note.tags),
        note.cover,
        note.pinned ? 1 : 0,
        note.status,
        note.views,
        estimateReadingMinutes(content),
        note.createdAt,
        note.updatedAt,
      );
    }

    const insertMoment = db.prepare(
      `INSERT INTO moments (id, user_id, content, mood, created_at)
       VALUES (?, ?, ?, ?, ?)`,
    );

    for (const moment of SEED_MOMENTS) {
      insertMoment.run(
        moment.id,
        OWNER_SEED.id,
        moment.content,
        moment.mood,
        moment.createdAt,
      );
    }

    const insertMessage = db.prepare(
      `INSERT INTO messages
        (id, site_user_id, author_user_id, author_name, content, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    );

    for (const message of SEED_MESSAGES) {
      insertMessage.run(
        message.id,
        OWNER_SEED.id,
        null,
        message.authorName,
        message.content,
        message.createdAt,
      );
    }

    void now;
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function seedDemoLikes(db: DatabaseSync) {
  const row = db.prepare("SELECT COUNT(*) AS count FROM likes").get() as Row;
  if (int(row.count) > 0) return;

  const owner = db
    .prepare("SELECT id FROM users WHERE handle = ?")
    .get(OWNER_HANDLE) as Row | undefined;
  if (!owner) return;

  const insert = db.prepare(
    `INSERT OR IGNORE INTO likes
      (target_type, target_id, visitor_key, created_at)
     VALUES ('note', ?, ?, ?)`,
  );
  const createdAt = new Date().toISOString();

  for (const [noteId, count] of Object.entries(SEED_LIKE_COUNTS)) {
    for (let index = 0; index < count; index += 1) {
      insert.run(noteId, `seed:${noteId}:${index}`, createdAt);
    }
  }
}

function initDatabase(): DatabaseSync {
  const dir = process.env.DATA_DIR
    ? path.resolve(process.env.DATA_DIR)
    : path.join(process.cwd(), "data");

  fs.mkdirSync(dir, { recursive: true });

  const db = new DatabaseSync(path.join(dir, "xingyu.db"));
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  createSchema(db);

  const userColumns = db.prepare("PRAGMA table_info(users)").all() as Row[];
  const userColumnNames = new Set(userColumns.map((column) => text(column.name)));
  const additions: Array<[string, string]> = [
    ["site_title", "TEXT NOT NULL DEFAULT ''"],
    ["recovery_question", "TEXT NOT NULL DEFAULT ''"],
    ["recovery_answer_hash", "TEXT NOT NULL DEFAULT ''"],
  ];

  for (const [name, definition] of additions) {
    if (!userColumnNames.has(name)) {
      db.exec(`ALTER TABLE users ADD COLUMN ${name} ${definition}`);
    }
  }

  db.exec(
    "UPDATE users SET site_title = display_name || '的小岛' WHERE site_title = ''",
  );

  seedDatabase(db);
  seedDemoLikes(db);

  db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(
    new Date().toISOString(),
  );

  return db;
}

export function getDb(): DatabaseSync {
  if (!globalStore.__xingyuDb) {
    globalStore.__xingyuDb = initDatabase();
  }
  return globalStore.__xingyuDb;
}

/* ------------------------------------------------------------------ */
/* Users                                                               */
/* ------------------------------------------------------------------ */

export function getUserById(id: string): UserRecord | null {
  const row = getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as
    | Row
    | undefined;
  return row ? mapUser(row) : null;
}

export function getUserByHandle(handle: string): UserRecord | null {
  const row = getDb()
    .prepare("SELECT * FROM users WHERE handle = ?")
    .get(handle.toLowerCase()) as Row | undefined;
  return row ? mapUser(row) : null;
}

export function getUserByIdentifier(identifier: string): UserRecord | null {
  const raw = identifier.trim();
  const value = raw.toLowerCase();
  const row = getDb()
    .prepare(
      "SELECT * FROM users WHERE handle = ? OR lower(email) = ? OR display_name = ?",
    )
    .get(value, value, raw) as Row | undefined;
  return row ? mapUser(row) : null;
}

export function createUser(input: {
  handle: string;
  displayName: string;
  password: string;
  email?: string | null;
  theme?: ThemeConfig;
}): UserRecord {
  const id = `u_${randomUUID()}`;
  const createdAt = new Date().toISOString();

  getDb()
    .prepare(
      `INSERT INTO users
        (id, handle, email, password_hash, display_name, site_title, tagline,
         bio, now, location, tags, avatar, socials, theme, created_at)
       VALUES (?, ?, ?, ?, ?, ?, '', '', '', '', '[]', '', '[]', ?, ?)`,
    )
    .run(
      id,
      input.handle,
      input.email ?? null,
      hashPassword(input.password),
      input.displayName,
      `${input.displayName}的小岛`,
      JSON.stringify(input.theme ?? {}),
      createdAt,
    );

  return getUserById(id) as UserRecord;
}

export function updateUserProfile(
  id: string,
  input: {
    displayName: string;
    siteTitle: string;
    tagline: string;
    bio: string;
    now: string;
    location: string;
    tags: string[];
    avatar: string;
    socials: SocialLink[];
  },
): UserRecord | null {
  getDb()
    .prepare(
      `UPDATE users
       SET display_name = ?, site_title = ?, tagline = ?, bio = ?, now = ?,
           location = ?, tags = ?, avatar = ?, socials = ?
       WHERE id = ?`,
    )
    .run(
      input.displayName,
      input.siteTitle,
      input.tagline,
      input.bio,
      input.now,
      input.location,
      JSON.stringify(input.tags),
      input.avatar,
      JSON.stringify(input.socials),
      id,
    );

  return getUserById(id);
}

export function updateUserTheme(
  id: string,
  theme: ThemeConfig,
): UserRecord | null {
  getDb()
    .prepare("UPDATE users SET theme = ? WHERE id = ?")
    .run(JSON.stringify(theme), id);
  return getUserById(id);
}

export function updateUserPasswordHash(
  id: string,
  passwordHash: string,
): boolean {
  const result = getDb()
    .prepare("UPDATE users SET password_hash = ? WHERE id = ?")
    .run(passwordHash, id);
  return Number(result.changes) > 0;
}

export function updateUserRecovery(
  id: string,
  question: string,
  answerHash: string,
): UserRecord | null {
  getDb()
    .prepare(
      "UPDATE users SET recovery_question = ?, recovery_answer_hash = ? WHERE id = ?",
    )
    .run(question, answerHash, id);
  return getUserById(id);
}

export function deleteSessionsForUser(userId: string): void {
  getDb().prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
}

export function countUsers(): number {
  const row = getDb().prepare("SELECT COUNT(*) AS count FROM users").get() as Row;
  return int(row.count);
}

/* ------------------------------------------------------------------ */
/* Sites & stats                                                       */
/* ------------------------------------------------------------------ */

export function statsForUser(userId: string): SiteStats {
  const row = getDb()
    .prepare(
      `SELECT
         (SELECT COUNT(*) FROM notes WHERE user_id = ? AND status = 'published') AS notes,
         (SELECT COUNT(*) FROM notes WHERE user_id = ? AND status = 'draft') AS drafts,
         (SELECT COUNT(*) FROM moments WHERE user_id = ?) AS moments,
         (SELECT COUNT(*) FROM messages WHERE site_user_id = ?) AS messages,
         (SELECT COALESCE(SUM(views), 0) FROM notes WHERE user_id = ?) AS views`,
    )
    .get(userId, userId, userId, userId, userId) as Row;

  return {
    notes: int(row.notes),
    drafts: int(row.drafts),
    moments: int(row.moments),
    messages: int(row.messages),
    views: int(row.views),
  };
}

export function getSite(handle: string): Site | null {
  const user = getUserByHandle(handle);
  if (!user) return null;
  return { ...toPublicUser(user), stats: statsForUser(user.id) };
}

export function getOwnerSite(): Site | null {
  const handle = process.env.OWNER_HANDLE?.trim() || OWNER_HANDLE;
  const site = getSite(handle);
  if (site) return site;

  const row = getDb()
    .prepare("SELECT handle FROM users ORDER BY created_at ASC LIMIT 1")
    .get() as Row | undefined;
  return row ? getSite(text(row.handle)) : null;
}

export function listCreators(): CreatorCard[] {
  const rows = getDb()
    .prepare("SELECT * FROM users ORDER BY created_at ASC")
    .all() as Row[];

  return rows.map((row) => {
    const user = mapUser(row);
    return { ...toPublicUser(user), stats: statsForUser(user.id) };
  });
}

/* ------------------------------------------------------------------ */
/* Notes                                                               */
/* ------------------------------------------------------------------ */

const NOTE_LIKE_COUNT = `(SELECT COUNT(*) FROM likes
  WHERE likes.target_type = 'note' AND likes.target_id = notes.id)`;

const NOTE_LIST_COLUMNS = `notes.id, notes.user_id, notes.slug, notes.title,
  notes.summary, notes.category, notes.tags, notes.cover, notes.pinned,
  notes.status, notes.views, notes.minutes, notes.created_at, notes.updated_at,
  ${NOTE_LIKE_COUNT} AS likes`;

const NOTE_FULL_COLUMNS = `${NOTE_LIST_COLUMNS}, notes.content`;

function escapeLike(value: string): string {
  return value.replace(/[!%_]/g, (match) => `!${match}`);
}

export function listPublishedNotes(
  userId: string,
  limit = 100,
  category?: string,
  query?: string,
): NoteSummary[] {
  const conditions = ["notes.user_id = ?", "notes.status = 'published'"];
  const params: Array<string | number> = [userId];

  if (category) {
    conditions.push("notes.category = ?");
    params.push(category);
  }

  const keyword = query?.trim();
  if (keyword) {
    const like = `%${escapeLike(keyword)}%`;
    conditions.push(
      `(notes.title LIKE ? ESCAPE '!' OR notes.summary LIKE ? ESCAPE '!' OR notes.content LIKE ? ESCAPE '!' OR notes.tags LIKE ? ESCAPE '!')`,
    );
    params.push(like, like, like, like);
  }

  params.push(limit);

  const rows = getDb()
    .prepare(
      `SELECT ${NOTE_LIST_COLUMNS} FROM notes
       WHERE ${conditions.join(" AND ")}
       ORDER BY notes.pinned DESC, notes.created_at DESC
       LIMIT ?`,
    )
    .all(...params) as Row[];

  return rows.map(mapNoteSummary);
}

export function listAllNotes(userId: string): NoteSummary[] {
  const rows = getDb()
    .prepare(
      `SELECT ${NOTE_LIST_COLUMNS} FROM notes
       WHERE notes.user_id = ? ORDER BY notes.created_at DESC`,
    )
    .all(userId) as Row[];
  return rows.map(mapNoteSummary);
}

export function getNoteBySlug(userId: string, slug: string): Note | null {
  const row = getDb()
    .prepare(
      `SELECT ${NOTE_FULL_COLUMNS} FROM notes
       WHERE notes.user_id = ? AND notes.slug = ? AND notes.status = 'published'`,
    )
    .get(userId, slug) as Row | undefined;
  return row ? mapNote(row) : null;
}

export function getNoteById(id: string): Note | null {
  const row = getDb()
    .prepare(`SELECT ${NOTE_FULL_COLUMNS} FROM notes WHERE notes.id = ?`)
    .get(id) as Row | undefined;
  return row ? mapNote(row) : null;
}

export function getCategories(
  userId: string,
): Array<{ name: string; count: number }> {
  const rows = getDb()
    .prepare(
      `SELECT category, COUNT(*) AS count FROM notes
       WHERE user_id = ? AND status = 'published' AND category <> ''
       GROUP BY category ORDER BY count DESC, category ASC`,
    )
    .all(userId) as Row[];

  return rows.map((row) => ({
    name: text(row.category),
    count: int(row.count),
  }));
}

export function getAdjacentNotes(
  userId: string,
  createdAt: string,
): { older: NoteSummary | null; newer: NoteSummary | null } {
  const db = getDb();
  const older = db
    .prepare(
      `SELECT ${NOTE_LIST_COLUMNS} FROM notes
       WHERE notes.user_id = ? AND notes.status = 'published' AND notes.created_at < ?
       ORDER BY notes.created_at DESC LIMIT 1`,
    )
    .get(userId, createdAt) as Row | undefined;
  const newer = db
    .prepare(
      `SELECT ${NOTE_LIST_COLUMNS} FROM notes
       WHERE notes.user_id = ? AND notes.status = 'published' AND notes.created_at > ?
       ORDER BY notes.created_at ASC LIMIT 1`,
    )
    .get(userId, createdAt) as Row | undefined;

  return {
    older: older ? mapNoteSummary(older) : null,
    newer: newer ? mapNoteSummary(newer) : null,
  };
}

export type NoteInput = {
  title: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  cover: string;
  pinned: boolean;
  status: NoteStatus;
};

function makeSlug(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .slice(0, 40)
    .replace(/-+$/g, "");

  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base || "note"}-${stamp}-${suffix}`;
}

export function createNote(userId: string, input: NoteInput): Note {
  const db = getDb();
  const id = `n_${randomUUID()}`;
  const createdAt = new Date().toISOString();
  let slug = makeSlug(input.title);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const exists = db
      .prepare("SELECT 1 AS hit FROM notes WHERE user_id = ? AND slug = ?")
      .get(userId, slug) as Row | undefined;
    if (!exists) break;
    slug = makeSlug(input.title);
  }

  db.prepare(
    `INSERT INTO notes
      (id, user_id, slug, title, summary, content, category, tags, cover,
       pinned, status, views, minutes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`,
  ).run(
    id,
    userId,
    slug,
    input.title,
    input.summary,
    input.content,
    input.category,
    JSON.stringify(normalizeTags(input.tags)),
    input.cover,
    input.pinned ? 1 : 0,
    input.status,
    estimateReadingMinutes(input.content),
    createdAt,
    createdAt,
  );

  return getNoteById(id) as Note;
}

export function updateNote(
  userId: string,
  id: string,
  input: NoteInput,
): Note | null {
  const existing = getNoteById(id);
  if (!existing || existing.userId !== userId) return null;

  getDb()
    .prepare(
      `UPDATE notes
       SET title = ?, summary = ?, content = ?, category = ?, tags = ?,
           cover = ?, pinned = ?, status = ?, minutes = ?, updated_at = ?
       WHERE id = ? AND user_id = ?`,
    )
    .run(
      input.title,
      input.summary,
      input.content,
      input.category,
      JSON.stringify(normalizeTags(input.tags)),
      input.cover,
      input.pinned ? 1 : 0,
      input.status,
      estimateReadingMinutes(input.content),
      new Date().toISOString(),
      id,
      userId,
    );

  return getNoteById(id);
}

export function deleteNote(userId: string, id: string): boolean {
  const db = getDb();
  const owned = db
    .prepare("SELECT 1 AS hit FROM notes WHERE id = ? AND user_id = ?")
    .get(id, userId) as Row | undefined;

  if (!owned) return false;

  db.prepare(
    "DELETE FROM likes WHERE target_type = 'note' AND target_id = ?",
  ).run(id);
  const result = db
    .prepare("DELETE FROM notes WHERE id = ? AND user_id = ?")
    .run(id, userId);
  return Number(result.changes) > 0;
}

export function incrementNoteViews(id: string): void {
  getDb().prepare("UPDATE notes SET views = views + 1 WHERE id = ?").run(id);
}

export function countLikes(targetType: string, targetId: string): number {
  const row = getDb()
    .prepare(
      "SELECT COUNT(*) AS count FROM likes WHERE target_type = ? AND target_id = ?",
    )
    .get(targetType, targetId) as Row;
  return int(row.count);
}

export function isLikedBy(
  targetType: string,
  targetId: string,
  visitorKey: string,
): boolean {
  const row = getDb()
    .prepare(
      `SELECT 1 AS hit FROM likes
       WHERE target_type = ? AND target_id = ? AND visitor_key = ?`,
    )
    .get(targetType, targetId, visitorKey) as Row | undefined;
  return Boolean(row);
}

export function toggleLike(
  targetType: string,
  targetId: string,
  visitorKey: string,
): { liked: boolean; count: number } {
  const db = getDb();
  const existing = isLikedBy(targetType, targetId, visitorKey);

  if (existing) {
    db.prepare(
      `DELETE FROM likes
       WHERE target_type = ? AND target_id = ? AND visitor_key = ?`,
    ).run(targetType, targetId, visitorKey);
  } else {
    db.prepare(
      `INSERT INTO likes (target_type, target_id, visitor_key, created_at)
       VALUES (?, ?, ?, ?)`,
    ).run(targetType, targetId, visitorKey, new Date().toISOString());
  }

  return {
    liked: !existing,
    count: countLikes(targetType, targetId),
  };
}

/* ------------------------------------------------------------------ */
/* Moments                                                             */
/* ------------------------------------------------------------------ */

export function listMoments(userId: string, limit = 50): Moment[] {
  const rows = getDb()
    .prepare(
      `SELECT * FROM moments WHERE user_id = ?
       ORDER BY created_at DESC LIMIT ?`,
    )
    .all(userId, limit) as Row[];
  return rows.map(mapMoment);
}

export function createMoment(
  userId: string,
  input: { content: string; mood: string },
): Moment {
  const id = `m_${randomUUID()}`;
  const createdAt = new Date().toISOString();

  getDb()
    .prepare(
      `INSERT INTO moments (id, user_id, content, mood, created_at)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(id, userId, input.content, input.mood, createdAt);

  const row = getDb()
    .prepare("SELECT * FROM moments WHERE id = ?")
    .get(id) as Row;
  return mapMoment(row);
}

export function deleteMoment(userId: string, id: string): boolean {
  const result = getDb()
    .prepare("DELETE FROM moments WHERE id = ? AND user_id = ?")
    .run(id, userId);
  return Number(result.changes) > 0;
}

/* ------------------------------------------------------------------ */
/* Messages                                                            */
/* ------------------------------------------------------------------ */

export function listMessages(siteUserId: string, limit = 100): Message[] {
  const rows = getDb()
    .prepare(
      `SELECT m.*, u.handle AS author_handle
       FROM messages m
       LEFT JOIN users u ON u.id = m.author_user_id
       WHERE m.site_user_id = ?
       ORDER BY m.created_at DESC LIMIT ?`,
    )
    .all(siteUserId, limit) as Row[];
  return rows.map(mapMessage);
}

export function getMessageById(id: string): Message | null {
  const row = getDb()
    .prepare(
      `SELECT m.*, u.handle AS author_handle
       FROM messages m LEFT JOIN users u ON u.id = m.author_user_id
       WHERE m.id = ?`,
    )
    .get(id) as Row | undefined;
  return row ? mapMessage(row) : null;
}

export function createMessage(input: {
  siteUserId: string;
  authorUserId: string | null;
  authorName: string;
  content: string;
}): Message {
  const id = `g_${randomUUID()}`;
  const createdAt = new Date().toISOString();

  getDb()
    .prepare(
      `INSERT INTO messages
        (id, site_user_id, author_user_id, author_name, content, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(
      id,
      input.siteUserId,
      input.authorUserId,
      input.authorName,
      input.content,
      createdAt,
    );

  return getMessageById(id) as Message;
}

export function deleteMessage(id: string): boolean {
  const result = getDb().prepare("DELETE FROM messages WHERE id = ?").run(id);
  return Number(result.changes) > 0;
}

/* ------------------------------------------------------------------ */
/* Friends                                                            */
/* ------------------------------------------------------------------ */

type FriendshipRow = {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
  created_at: string;
  updated_at: string;
};

function getFriendshipRow(userA: string, userB: string): FriendshipRow | null {
  const row = getDb()
    .prepare(
      `SELECT * FROM friendships
       WHERE (requester_id = ? AND addressee_id = ?)
          OR (requester_id = ? AND addressee_id = ?)
       LIMIT 1`,
    )
    .get(userA, userB, userB, userA) as Row | undefined;
  return row ? (row as unknown as FriendshipRow) : null;
}

function mapFriendUser(
  user: UserRecord,
  relation: FriendUser["relation"],
  requestId: string | null,
  unread = 0,
): FriendUser {
  return {
    id: user.id,
    handle: user.handle,
    displayName: user.displayName,
    avatar: user.avatar,
    tagline: user.tagline,
    relation,
    requestId,
    unread,
  };
}

function relationFor(
  currentUserId: string,
  otherUserId: string,
): { relation: FriendUser["relation"]; requestId: string | null } {
  const row = getFriendshipRow(currentUserId, otherUserId);
  if (!row) return { relation: "none", requestId: null };
  if (row.status === "accepted") return { relation: "friends", requestId: null };
  if (row.requester_id === currentUserId) {
    return { relation: "pending_out", requestId: row.id };
  }
  return { relation: "pending_in", requestId: row.id };
}

export function searchUsersForFriend(
  currentUserId: string,
  rawQuery: string,
): FriendUser[] {
  const query = rawQuery.trim().slice(0, 40);
  if (!query) return [];

  const like = `%${escapeLike(query)}%`;
  const rows = getDb()
    .prepare(
      `SELECT * FROM users
       WHERE id != ?
         AND (display_name LIKE ? ESCAPE '!' OR handle LIKE ? ESCAPE '!')
       ORDER BY display_name COLLATE NOCASE ASC
       LIMIT 8`,
    )
    .all(currentUserId, like, like) as Row[];

  return rows.map((row) => {
    const user = mapUser(row);
    const relation = relationFor(currentUserId, user.id);
    return mapFriendUser(user, relation.relation, relation.requestId);
  });
}

export function listFriendState(currentUserId: string): FriendState {
  const rows = getDb()
    .prepare(
      `SELECT * FROM friendships
       WHERE requester_id = ? OR addressee_id = ?
       ORDER BY updated_at DESC`,
    )
    .all(currentUserId, currentUserId) as Row[];

  const unreadRows = getDb()
    .prepare(
      `SELECT sender_id, COUNT(*) AS count
       FROM friend_messages
       WHERE receiver_id = ? AND read_at IS NULL
       GROUP BY sender_id`,
    )
    .all(currentUserId) as Row[];

  const unreadByFriend = new Map<string, number>();
  for (const row of unreadRows) {
    unreadByFriend.set(text(row.sender_id), int(row.count));
  }

  const friends: FriendUser[] = [];
  const incoming: FriendUser[] = [];
  const outgoing: FriendUser[] = [];

  for (const raw of rows) {
    const row = raw as unknown as FriendshipRow;
    const otherId =
      row.requester_id === currentUserId
        ? row.addressee_id
        : row.requester_id;
    const user = getUserById(otherId);
    if (!user) continue;

    if (row.status === "accepted") {
      friends.push(
        mapFriendUser(
          user,
          "friends",
          null,
          unreadByFriend.get(otherId) ?? 0,
        ),
      );
    } else if (row.addressee_id === currentUserId) {
      incoming.push(
        mapFriendUser(user, "pending_in", row.id),
      );
    } else {
      outgoing.push(
        mapFriendUser(user, "pending_out", row.id),
      );
    }
  }

  friends.sort((a, b) => a.displayName.localeCompare(b.displayName, "zh-CN"));

  return {
    friends,
    incoming,
    outgoing,
    unread: friends.reduce((total, friend) => total + friend.unread, 0),
  };
}

export function sendFriendRequest(
  currentUserId: string,
  targetUserId: string,
): { ok: true; status: "pending" | "friends" } | { ok: false; error: string } {
  if (currentUserId === targetUserId) {
    return { ok: false, error: "不能加自己为好友。" };
  }

  const target = getUserById(targetUserId);
  if (!target) {
    return { ok: false, error: "找不到这位岛主。" };
  }

  const existing = getFriendshipRow(currentUserId, targetUserId);
  if (existing) {
    if (existing.status === "accepted") {
      return { ok: true, status: "friends" };
    }

    if (existing.requester_id === currentUserId) {
      return { ok: true, status: "pending" };
    }

    // 对方已经发来申请：这次点击直接接受
    getDb()
      .prepare(
        "UPDATE friendships SET status = 'accepted', updated_at = ? WHERE id = ?",
      )
      .run(new Date().toISOString(), existing.id);
    return { ok: true, status: "friends" };
  }

  const now = new Date().toISOString();
  getDb()
    .prepare(
      `INSERT INTO friendships
        (id, requester_id, addressee_id, status, created_at, updated_at)
       VALUES (?, ?, ?, 'pending', ?, ?)`,
    )
    .run(`f_${randomUUID()}`, currentUserId, targetUserId, now, now);

  return { ok: true, status: "pending" };
}

export function respondFriendRequest(
  currentUserId: string,
  requestId: string,
  action: "accept" | "decline",
): boolean {
  const row = getDb()
    .prepare(
      `SELECT * FROM friendships
       WHERE id = ? AND addressee_id = ? AND status = 'pending'`,
    )
    .get(requestId, currentUserId) as Row | undefined;

  if (!row) return false;

  if (action === "accept") {
    getDb()
      .prepare(
        "UPDATE friendships SET status = 'accepted', updated_at = ? WHERE id = ?",
      )
      .run(new Date().toISOString(), requestId);
  } else {
    getDb().prepare("DELETE FROM friendships WHERE id = ?").run(requestId);
  }

  return true;
}

export function removeFriend(currentUserId: string, friendUserId: string): boolean {
  const result = getDb()
    .prepare(
      `DELETE FROM friendships
       WHERE (requester_id = ? AND addressee_id = ?)
          OR (requester_id = ? AND addressee_id = ?)`,
    )
    .run(currentUserId, friendUserId, friendUserId, currentUserId);

  getDb()
    .prepare(
      `DELETE FROM friend_messages
       WHERE (sender_id = ? AND receiver_id = ?)
          OR (sender_id = ? AND receiver_id = ?)`,
    )
    .run(currentUserId, friendUserId, friendUserId, currentUserId);

  return Number(result.changes) > 0;
}

export function areFriends(userA: string, userB: string): boolean {
  const row = getFriendshipRow(userA, userB);
  return Boolean(row && row.status === "accepted");
}

function mapFriendMessage(row: Row): FriendMessage {
  return {
    id: text(row.id),
    senderId: text(row.sender_id),
    receiverId: text(row.receiver_id),
    content: text(row.content),
    createdAt: text(row.created_at),
    readAt: row.read_at ? text(row.read_at) : null,
  };
}

export function listFriendMessages(
  currentUserId: string,
  friendUserId: string,
  limit = 80,
): FriendMessage[] | null {
  if (!areFriends(currentUserId, friendUserId)) return null;

  const rows = getDb()
    .prepare(
      `SELECT * FROM (
         SELECT * FROM friend_messages
         WHERE (sender_id = ? AND receiver_id = ?)
            OR (sender_id = ? AND receiver_id = ?)
         ORDER BY created_at DESC
         LIMIT ?
       ) ORDER BY created_at ASC`,
    )
    .all(
      currentUserId,
      friendUserId,
      friendUserId,
      currentUserId,
      limit,
    ) as Row[];

  getDb()
    .prepare(
      `UPDATE friend_messages
       SET read_at = ?
       WHERE receiver_id = ? AND sender_id = ? AND read_at IS NULL`,
    )
    .run(new Date().toISOString(), currentUserId, friendUserId);

  return rows.map(mapFriendMessage);
}

export function sendFriendMessage(
  currentUserId: string,
  friendUserId: string,
  content: string,
): FriendMessage | null {
  if (!areFriends(currentUserId, friendUserId)) return null;

  const trimmed = content.trim().slice(0, 2000);
  if (!trimmed) return null;

  const id = `fm_${randomUUID()}`;
  const createdAt = new Date().toISOString();

  getDb()
    .prepare(
      `INSERT INTO friend_messages
        (id, sender_id, receiver_id, content, created_at, read_at)
       VALUES (?, ?, ?, ?, ?, NULL)`,
    )
    .run(id, currentUserId, friendUserId, trimmed, createdAt);

  const row = getDb()
    .prepare("SELECT * FROM friend_messages WHERE id = ?")
    .get(id) as Row;
  return mapFriendMessage(row);
}

export function listFriendMoments(
  currentUserId: string,
  limit = 16,
): FriendMoment[] {
  const friendRows = getDb()
    .prepare(
      `SELECT CASE
         WHEN requester_id = ? THEN addressee_id
         ELSE requester_id
       END AS friend_id
       FROM friendships
       WHERE status = 'accepted'
         AND (requester_id = ? OR addressee_id = ?)`,
    )
    .all(currentUserId, currentUserId, currentUserId) as Row[];

  const friendIds = friendRows.map((row) => text(row.friend_id)).filter(Boolean);
  if (!friendIds.length) return [];

  const placeholders = friendIds.map(() => "?").join(", ");
  const rows = getDb()
    .prepare(
      `SELECT m.*, u.display_name AS author_name,
              u.handle AS author_handle, u.avatar AS author_avatar
       FROM moments m
       JOIN users u ON u.id = m.user_id
       WHERE m.user_id IN (${placeholders})
       ORDER BY m.created_at DESC
       LIMIT ?`,
    )
    .all(...friendIds, limit) as Row[];

  return rows.map((row) => ({
    ...mapMoment(row),
    authorName: text(row.author_name),
    authorHandle: text(row.author_handle),
    authorAvatar: text(row.author_avatar),
  }));
}

/* ------------------------------------------------------------------ */
/* Sessions                                                            */
/* ------------------------------------------------------------------ */

export function createSessionRow(
  token: string,
  userId: string,
  expiresAt: string,
): void {
  getDb()
    .prepare(
      `INSERT INTO sessions (token, user_id, expires_at, created_at)
       VALUES (?, ?, ?, ?)`,
    )
    .run(token, userId, expiresAt, new Date().toISOString());
}

export function getSessionUser(token: string): UserRecord | null {
  const row = getDb()
    .prepare(
      `SELECT u.* FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND s.expires_at > ?`,
    )
    .get(token, new Date().toISOString()) as Row | undefined;
  return row ? mapUser(row) : null;
}

export function deleteSessionRow(token: string): void {
  getDb().prepare("DELETE FROM sessions WHERE token = ?").run(token);
}
