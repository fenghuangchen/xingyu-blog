import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Eye,
  Feather,
  MessageSquare,
  PenLine,
  Settings,
  Sparkles,
} from "lucide-react";
import { requireViewer } from "@/lib/auth";
import {
  getOwnerSite,
  getSite,
  listAllNotes,
  listMessages,
  listMoments,
} from "@/lib/db";
import { presetMeta } from "@/lib/theme";
import { formatDate, greetingForHour, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StudioDashboard() {
  const viewer = await requireViewer();
  const site = getSite(viewer.handle);
  const owner = getOwnerSite();
  const notes = listAllNotes(viewer.id);
  const moments = listMoments(viewer.id, 4);
  const messages = listMessages(viewer.id, 4);

  if (!site) return null;

  const publicPath = owner?.id === site.id ? "/" : `/u/${site.handle}`;
  const theme = presetMeta(site.theme.preset);
  const hour =
    Number(
      new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Shanghai",
        hour: "numeric",
        hour12: false,
      }).format(new Date()),
    ) % 24;

  const stats = [
    {
      label: "公开笔记",
      value: site.stats.notes,
      hint: "正在被阅读",
      icon: BookOpen,
      href: "/studio/notes",
    },
    {
      label: "草稿",
      value: site.stats.drafts,
      hint: "还在等你回来",
      icon: Feather,
      href: "/studio/notes",
    },
    {
      label: "动态",
      value: site.stats.moments,
      hint: "岛上的碎片",
      icon: Sparkles,
      href: "/studio/moments",
    },
    {
      label: "留言",
      value: site.stats.messages,
      hint: "朋友来过",
      icon: MessageSquare,
      href: "/studio/messages",
    },
  ];

  return (
    <div className="studio-page">
      <header className="studio-page-head">
        <div>
          <span className="section-kicker">OVERVIEW / 概览</span>
          <h1>
            {greetingForHour(hour)}，{site.displayName}。
          </h1>
          <p>
            这里是你的创作台。写下新的笔记，或者看看岛上最近发生了什么。
          </p>
        </div>
        <div className="head-actions">
          <Link href="/studio/notes/new" className="btn btn-primary">
            <PenLine size={15} />
            写新笔记
          </Link>
          <Link href={publicPath} className="btn btn-ghost">
            查看站点
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </header>

      <div className="studio-stats">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link href={stat.href} className="stat-card glass" key={stat.label}>
              <span className="stat-icon">
                <Icon size={17} />
              </span>
              <span className="stat-card-label">{stat.label}</span>
              <strong>{stat.value}</strong>
              <span className="stat-card-hint">{stat.hint}</span>
            </Link>
          );
        })}
      </div>

      <div className="studio-grid-2">
        <section className="studio-panel glass">
          <div className="studio-panel-head">
            <div>
              <span className="section-kicker">NOTES</span>
              <h2>最近的笔记</h2>
            </div>
            <Link href="/studio/notes" className="section-link">
              全部笔记
              <ArrowRight size={14} />
            </Link>
          </div>

          {notes.length ? (
            <div className="studio-note-list">
              {notes.slice(0, 5).map((note) => (
                <Link
                  href={`/studio/notes/${note.id}`}
                  className="studio-note-row"
                  key={note.id}
                >
                  <span
                    className={`status-dot-sm ${note.status}`}
                    aria-hidden="true"
                  />
                  <div className="studio-note-row-main">
                    <strong>{note.title}</strong>
                    <span>
                      {note.category || "未分类"} · {formatDate(note.updatedAt)}
                    </span>
                  </div>
                  <span className={`status-chip ${note.status}`}>
                    {note.status === "published" ? "已发布" : "草稿"}
                  </span>
                  <span className="studio-row-views">
                    <Eye size={13} />
                    {note.views}
                  </span>
                  <ArrowRight size={14} className="row-arrow" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="studio-empty">
              <Feather size={22} />
              <p>还没有笔记。第一篇，往往是最难也最值得的。</p>
              <Link href="/studio/notes/new" className="btn btn-primary btn-sm">
                写下第一篇
              </Link>
            </div>
          )}
        </section>

        <div className="studio-side-stack">
          <section className="studio-panel glass">
            <div className="studio-panel-head">
              <div>
                <span className="section-kicker">GUESTBOOK</span>
                <h2>最新留言</h2>
              </div>
              <Link href="/studio/messages" className="section-link">
                管理
                <ArrowRight size={14} />
              </Link>
            </div>

            {messages.length ? (
              <div className="studio-message-list">
                {messages.slice(0, 3).map((message) => (
                  <div className="studio-message-row" key={message.id}>
                    <span className="mini-avatar">
                      {message.authorName.slice(0, 1)}
                    </span>
                    <div>
                      <div className="mini-message-head">
                        <strong>{message.authorName}</strong>
                        <span>{timeAgo(message.createdAt)}</span>
                      </div>
                      <p>{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="studio-empty-text">还没有人留言。</p>
            )}
          </section>

          <section className="studio-panel glass site-status-card">
            <div className="studio-panel-head">
              <div>
                <span className="section-kicker">YOUR SITE</span>
                <h2>站点状态</h2>
              </div>
              <Link href="/studio/settings" className="icon-btn" title="站点设置">
                <Settings size={15} />
              </Link>
            </div>

            <div className="site-status-theme">
              <span
                className="theme-swatch"
                style={{ background: site.theme.accent }}
              />
              <div>
                <strong>{theme.name}主题</strong>
                <span>
                  {theme.mode === "dark" ? "夜间" : "日间"} ·{" "}
                  {site.theme.font === "serif" ? "衬线" : "无衬线"}
                </span>
              </div>
              <Link href="/studio/settings" className="site-status-edit">
                调整
              </Link>
            </div>

            <Link href={publicPath} className="site-status-link">
              {publicPath}
              <ArrowUpRight size={14} />
            </Link>
          </section>
        </div>
      </div>

      <section className="studio-tip glass">
        <span className="studio-tip-mark">“</span>
        <p>
          写下来，不是为了被很多人看到，而是为了在很久以后，
          还能认出当时的自己。
        </p>
        <span className="studio-tip-sign">— 给岛主的写作提示</span>
      </section>
    </div>
  );
}
