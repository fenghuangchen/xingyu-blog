export function cn(
  ...values: Array<string | false | null | undefined>
): string {
  return values.filter(Boolean).join(" ");
}

const DATE_FORMAT = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Asia/Shanghai",
});

const LONG_DATE_FORMAT = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "Asia/Shanghai",
});

const TIME_FORMAT = new Intl.DateTimeFormat("zh-CN", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Shanghai",
});

export function formatDate(iso: string): string {
  return DATE_FORMAT.format(new Date(iso)).replace(/\//g, ".");
}

export function formatDateLong(iso: string): string {
  return LONG_DATE_FORMAT.format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return `${formatDateLong(iso)} ${TIME_FORMAT.format(new Date(iso))}`;
}

export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const minutes = Math.round(diff / 60000);

  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;

  const days = Math.round(hours / 24);
  if (days < 30) return `${days} 天前`;

  const months = Math.round(days / 30);
  if (months < 12) return `${months} 个月前`;

  return `${Math.round(months / 12)} 年前`;
}

export function daysSince(iso: string): number {
  const diff = Date.now() - new Date(iso).getTime();
  return Math.max(1, Math.floor(diff / 86400000) + 1);
}

export function greetingForHour(hour: number): string {
  if (hour < 5) return "夜深了";
  if (hour < 9) return "早上好";
  if (hour < 12) return "上午好";
  if (hour < 14) return "午安";
  if (hour < 18) return "下午好";
  if (hour < 22) return "晚上好";
  return "夜深了";
}

export const CATEGORY_SUGGESTIONS = [
  "AI",
  "Agent",
  "前端",
  "工程化",
  "阅读",
  "茶事",
  "日常",
];

export const COVER_OPTIONS = [
  { id: "orbit", name: "星轨" },
  { id: "ripple", name: "涟漪" },
  { id: "grid", name: "网格" },
  { id: "bloom", name: "花雾" },
  { id: "dunes", name: "沙丘" },
  { id: "prism", name: "棱镜" },
];

export function isCoverId(value: unknown): boolean {
  return COVER_OPTIONS.some((cover) => cover.id === value);
}

export function estimateReadingMinutes(content: string): number {
  const plain = content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~\-|]/g, "")
    .replace(/\s+/g, "");

  return Math.max(1, Math.ceil(plain.length / 380));
}

export function avatarInitial(name: string): string {
  return name.trim().slice(0, 1).toUpperCase() || "·";
}

export function isImageSource(src: string): boolean {
  return /^(https?:\/\/|\/)/.test(src);
}

export function cleanText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/\u0000/g, "").trim().slice(0, max);
}

export function normalizeTags(value: unknown, max = 6): string[] {
  const list = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/[,，、\s]+/)
      : [];

  const tags = list
    .map((tag) => cleanText(tag, 18))
    .filter(Boolean)
    .slice(0, max);

  return Array.from(new Set(tags));
}

export function normalizeHandle(value: unknown): string {
  return cleanText(value, 32)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/^-+|-+$/g, "")
    .slice(0, 20);
}

export function isValidHandle(handle: string): boolean {
  return /^[a-z0-9][a-z0-9-]{2,19}$/.test(handle);
}

export function isHexColor(value: unknown): boolean {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}
