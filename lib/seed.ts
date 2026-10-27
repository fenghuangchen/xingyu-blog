import fs from "node:fs";
import path from "node:path";
import { DEFAULT_THEME } from "./theme";
import type { SocialLink, ThemeConfig } from "./types";

export const OWNER_HANDLE = "qicha";
export const OWNER_PASSWORD = "xingyu2026";
export const OWNER_EMAIL = "qicha@xingyu.local";

export type SeedOwner = {
  id: string;
  handle: string;
  email: string;
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
  createdAt: string;
};

export type SeedNote = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  cover: string;
  pinned: boolean;
  status: "draft" | "published";
  views: number;
  file: string;
  createdAt: string;
  updatedAt: string;
};

export type SeedMoment = {
  id: string;
  content: string;
  mood: string;
  createdAt: string;
};

export type SeedMessage = {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
};

export const OWNER_SEED: SeedOwner = {
  id: "u_qicha",
  handle: OWNER_HANDLE,
  email: OWNER_EMAIL,
  displayName: "祁茶",
  siteTitle: "星屿手记",
  tagline:
    "祁山远，茶烟暖；一席清风，半日闲。祁茶，以茶会友，以字交心！",
  bio: "在代码与茶烟之间记录生活的人。白天和 Agent 打交道，夜里把读到的、想到的写成一页页笔记。\n\n相信工具会越来越聪明，但选择记下什么，始终是我们自己的事。这座小小的岛，用来存放那些不想被算法推荐、只想被认真读完的文字。",
  now: "正在整理一套 Agent 评测方法，也在练习用更少的字，把一件事说清楚。",
  location: "江苏",
  tags: ["日常", "Agent", "AI", "品茗"],
  avatar: "/avatar.jpg",
  socials: [{ label: "GitHub", url: "https://github.com/fenghuangchen" }],
  theme: { ...DEFAULT_THEME },
  createdAt: "2026-09-21T03:00:00.000Z",
};

export const SEED_NOTES: SeedNote[] = [
  {
    id: "n_memory_layers",
    slug: "agent-memory-layers",
    title: "Agent 的记忆，不该只是一袋向量",
    summary:
      "向量检索只回答「哪段文本最像」。真正难的是：什么该被记住，什么又该被体面地忘掉。",
    category: "AI",
    tags: ["Agent", "记忆", "RAG"],
    cover: "orbit",
    pinned: true,
    status: "published",
    views: 128,
    file: "agent-memory.md",
    createdAt: "2026-10-24T13:20:00.000Z",
    updatedAt: "2026-10-25T02:10:00.000Z",
  },
  {
    id: "n_react_agent",
    slug: "minimal-react-agent",
    title: "用 ReAct 拆一个最小可用 Agent：先让它学会停下来",
    summary:
      "从观察、思考到行动，一个只有几十行的循环。真正需要提前设计的，是停机条件、工具返回值，以及承认卡住的勇气。",
    category: "Agent",
    tags: ["Agent", "ReAct", "工程实践"],
    cover: "ripple",
    pinned: false,
    status: "published",
    views: 96,
    file: "minimal-react-agent.md",
    createdAt: "2026-10-18T12:05:00.000Z",
    updatedAt: "2026-10-18T12:05:00.000Z",
  },
  {
    id: "n_nextjs_16",
    slug: "nextjs-16-field-notes",
    title: "Next.js 16 上手记：三个让我停下来的小坑",
    summary:
      "params 变成 Promise、Turbopack 默认开启、缓存不再默认帮你做。把这次升级里真正花时间的细节记下来。",
    category: "前端",
    tags: ["Next.js", "React", "工程化"],
    cover: "grid",
    pinned: false,
    status: "published",
    views: 74,
    file: "nextjs-16.md",
    createdAt: "2026-10-11T14:40:00.000Z",
    updatedAt: "2026-10-12T01:25:00.000Z",
  },
  {
    id: "n_tea_attention",
    slug: "attention-over-tea",
    title: "茶席上的注意力：把一件事做完的练习",
    summary:
      "烧水、洗茶、出汤。茶不会因为你着急就更快出味，人也是。一些关于专注与留白的练习。",
    category: "茶事",
    tags: ["品茗", "专注", "生活"],
    cover: "bloom",
    pinned: false,
    status: "published",
    views: 51,
    file: "tea-attention.md",
    createdAt: "2026-10-05T08:10:00.000Z",
    updatedAt: "2026-10-05T08:10:00.000Z",
  },
  {
    id: "n_night_reading",
    slug: "night-reading-ai",
    title: "深夜书单：与 AI 共处的五种想象",
    summary:
      "技术回答「能不能」，文学回答「要不要」。五本睡前读过、又在第二天写代码时想起的书。",
    category: "阅读",
    tags: ["阅读", "AI", "书单"],
    cover: "dunes",
    pinned: false,
    status: "published",
    views: 43,
    file: "night-reading.md",
    createdAt: "2026-09-28T15:30:00.000Z",
    updatedAt: "2026-09-29T03:00:00.000Z",
  },
  {
    id: "n_draft_knowledge",
    slug: "second-brain-draft",
    title: "个人知识库：从收集癖到可用的第二大脑",
    summary: "一篇还没写完的草稿，关于收件箱、笔记与主题页的三层结构。",
    category: "阅读",
    tags: ["知识管理", "方法论"],
    cover: "prism",
    pinned: false,
    status: "draft",
    views: 0,
    file: "draft-knowledge-base.md",
    createdAt: "2026-10-26T14:00:00.000Z",
    updatedAt: "2026-10-26T14:00:00.000Z",
  },
];

export const SEED_MOMENTS: SeedMoment[] = [
  {
    id: "m_1",
    content:
      "把首页的星空调暗了一点。夜里看，像窗外真的有一片天。",
    mood: "🌌",
    createdAt: "2026-10-26T14:20:00.000Z",
  },
  {
    id: "m_2",
    content:
      "新笔记写完了，关于 Agent 的记忆分层。写完才发现，自己真正想说的是「遗忘也是一种能力」。",
    mood: "🫖",
    createdAt: "2026-10-24T13:05:00.000Z",
  },
  {
    id: "m_3",
    content:
      "今天试了漳平水仙，兰花香很稳。第三泡之后才慢慢出来，和人一样。",
    mood: "🍵",
    createdAt: "2026-10-21T15:40:00.000Z",
  },
  {
    id: "m_4",
    content:
      "凌晨的江苏开始有秋天的味道了。写代码的时候把窗开了条缝。",
    mood: "🍂",
    createdAt: "2026-10-17T03:10:00.000Z",
  },
  {
    id: "m_5",
    content:
      "给站点加了一个很小的细节：鼠标移到卡片上，会轻轻抬起来一点。没人会注意，但我知道。",
    mood: "✨",
    createdAt: "2026-10-12T12:00:00.000Z",
  },
  {
    id: "m_6",
    content:
      "重读《禅与摩托车维修艺术》。「良质」这个词，还是很难用一句话说清。",
    mood: "📖",
    createdAt: "2026-10-05T09:30:00.000Z",
  },
];

export const SEED_MESSAGES: SeedMessage[] = [
  {
    id: "g_1",
    authorName: "阿澈",
    content:
      "从 GitHub 点进来，被这片星空留住了。祝新站开张，笔记慢慢写，我们慢慢读。",
    createdAt: "2026-10-25T11:20:00.000Z",
  },
  {
    id: "g_2",
    authorName: "南风",
    content:
      "记忆那篇写得很克制，喜欢「遗忘是一种礼貌」这句。已经在等下一篇 Agent 了。",
    createdAt: "2026-10-22T06:45:00.000Z",
  },
  {
    id: "g_3",
    authorName: "小满",
    content: "留言板打卡～ 下次来江苏找你喝茶。",
    createdAt: "2026-10-19T13:10:00.000Z",
  },
  {
    id: "g_4",
    authorName: "林间",
    content:
      "页面在手机上也很舒服，尤其是代码块。请问主题会开源吗？想把我的读书笔记也搬过来。",
    createdAt: "2026-10-15T02:30:00.000Z",
  },
];

export const SEED_LIKE_COUNTS: Record<string, number> = {
  n_memory_layers: 18,
  n_react_agent: 11,
  n_nextjs_16: 9,
  n_tea_attention: 7,
  n_night_reading: 5,
};

export function readSeedContent(file: string): string {
  try {
    return fs
      .readFileSync(path.join(process.cwd(), "content", "seed", file), "utf8")
      .trim();
  } catch {
    return "";
  }
}
