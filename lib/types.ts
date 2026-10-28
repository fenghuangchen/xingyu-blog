export type ThemePreset =
  | "nebula"
  | "sakura"
  | "haze"
  | "aurora"
  | "dusk"
  | "daylight"
  | "mono";

export type ThemeConfig = {
  preset: ThemePreset;
  accent: string;
  glass: number;
  radius: number;
  font: "serif" | "sans";
  stars: boolean;
};

export type SocialLink = {
  label: string;
  url: string;
};

export type UserRecord = {
  id: string;
  handle: string;
  email: string | null;
  passwordHash: string;
  displayName: string;
  siteTitle: string;
  tagline: string;
  bio: string;
  now: string;
  location: string;
  tags: string[];
  avatar: string;
  socials: SocialLink[];
  theme: ThemeConfig;
  recoveryQuestion: string;
  recoveryAnswerHash: string;
  createdAt: string;
};

/** Public-facing user. Never includes password / recovery secrets or email. */
export type PublicUser = Omit<
  UserRecord,
  "passwordHash" | "email" | "recoveryAnswerHash"
>;

export type Viewer = Pick<
  UserRecord,
  "id" | "handle" | "displayName" | "avatar" | "theme"
>;

export type SiteStats = {
  notes: number;
  drafts: number;
  moments: number;
  messages: number;
  views: number;
};

export type Site = PublicUser & {
  stats: SiteStats;
};

export type NoteStatus = "draft" | "published";

export type Note = {
  id: string;
  userId: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  cover: string;
  pinned: boolean;
  status: NoteStatus;
  views: number;
  minutes: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
};

export type NoteSummary = Omit<Note, "content">;

export type MomentVisibility = "private" | "friends" | "public";

export type Moment = {
  id: string;
  userId: string;
  content: string;
  mood: string;
  visibility: MomentVisibility;
  createdAt: string;
};

export type Message = {
  id: string;
  siteUserId: string;
  authorUserId: string | null;
  authorName: string;
  authorHandle: string | null;
  content: string;
  createdAt: string;
};

export type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

export type RenderedContent = {
  html: string;
  toc: TocItem[];
  minutes: number;
  words: number;
};

export type CreatorCard = {
  id: string;
  handle: string;
  displayName: string;
  tagline: string;
  avatar: string;
  location: string;
  tags: string[];
  theme: ThemeConfig;
  createdAt: string;
  stats: SiteStats;
};

export type FriendRelation = "friends" | "pending_in" | "pending_out" | "none";

export type FriendUser = {
  id: string;
  handle: string;
  displayName: string;
  avatar: string;
  tagline: string;
  relation: FriendRelation;
  requestId: string | null;
  unread: number;
};

export type FriendState = {
  friends: FriendUser[];
  incoming: FriendUser[];
  outgoing: FriendUser[];
  unread: number;
};

export type FriendMessage = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  readAt: string | null;
};

export type FriendMoment = Moment & {
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
};
