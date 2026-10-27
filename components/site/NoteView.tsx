import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
} from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { renderMarkdown } from "@/lib/markdown";
import type { Note, NoteSummary, Site, Viewer } from "@/lib/types";
import { formatDate, formatDateLong } from "@/lib/utils";
import { ArticleEnhancer } from "./ArticleEnhancer";
import { CoverArt } from "./CoverArt";
import { SiteShell } from "./SiteShell";
import { ViewPing } from "./ViewPing";

type NoteViewProps = {
  site: Site;
  basePath: string;
  viewer: Viewer | null;
  note: Note;
  adjacent: { older: NoteSummary | null; newer: NoteSummary | null };
};

export function NoteView({
  site,
  basePath,
  viewer,
  note,
  adjacent,
}: NoteViewProps) {
  const { html, toc } = renderMarkdown(note.content);

  return (
    <SiteShell site={site} basePath={basePath} viewer={viewer}>
      <ArticleEnhancer />
      <ViewPing noteId={note.id} />

      <nav className="breadcrumb" aria-label="面包屑">
        <Link href={basePath || "/"}>首页</Link>
        <ChevronRight size={13} />
        <Link href={`${basePath}/notes`}>学习笔记</Link>
        <ChevronRight size={13} />
        <span>{note.title}</span>
      </nav>

      <article className="article">
        <header className="article-hero">
          <div className="article-cover">
            <CoverArt cover={note.cover} index="READ" />
            <div className="article-cover-meta">
              <span>{note.category || "笔记"}</span>
              <span>{formatDate(note.createdAt)}</span>
            </div>
          </div>

          <div className="article-head">
            <div className="article-eyebrow">
              <span className="article-category">
                {note.category || "学习笔记"}
              </span>
              <span className="meta-dot" />
              <span>{formatDateLong(note.createdAt)}</span>
              {note.pinned ? (
                <>
                  <span className="meta-dot" />
                  <span className="article-pinned">置顶</span>
                </>
              ) : null}
            </div>

            <h1>{note.title}</h1>

            {note.summary ? (
              <p className="article-summary">{note.summary}</p>
            ) : null}

            <div className="article-meta">
              <span className="article-author">
                <Avatar
                  src={site.avatar}
                  name={site.displayName}
                  size={28}
                  eager
                />
                {site.displayName}
              </span>
              <span>
                <Calendar size={14} />
                {formatDate(note.createdAt)}
              </span>
              <span>
                <Clock size={14} />约 {note.minutes} 分钟
              </span>
              <span>
                <Eye size={14} />
                {note.views} 次阅读
              </span>
            </div>

            {note.tags.length ? (
              <div className="article-tags">
                {note.tags.map((tag) => (
                  <span className="chip chip-sm" key={tag}>
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </header>

        <div className="article-grid">
          <div
            className="prose article-prose"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          <aside className="article-aside">
            {toc.length ? (
              <div className="toc glass">
                <span className="toc-title">目录</span>
                <nav>
                  {toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={item.level === 3 ? "toc-sub" : undefined}
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>
              </div>
            ) : null}

            <div className="author-card glass">
              <Avatar
                src={site.avatar}
                name={site.displayName}
                size={52}
              />
              <p className="author-name">{site.displayName}</p>
              <p className="author-tagline">{site.tagline}</p>
              <Link href={basePath || "/"} className="author-link">
                访问小岛
                <ArrowRight size={13} />
              </Link>
            </div>

            <Link href={`${basePath}/notes`} className="aside-back">
              <ChevronLeft size={14} />
              返回笔记列表
            </Link>
          </aside>
        </div>

        <footer className="article-foot">
          <div className="prev-next">
            {adjacent.older ? (
              <Link
                href={`${basePath}/notes/${adjacent.older.slug}`}
                className="pn-card glass"
              >
                <span className="pn-label">
                  <ChevronLeft size={13} />
                  上一篇
                </span>
                <strong>{adjacent.older.title}</strong>
              </Link>
            ) : (
              <div className="pn-placeholder" />
            )}

            {adjacent.newer ? (
              <Link
                href={`${basePath}/notes/${adjacent.newer.slug}`}
                className="pn-card pn-next glass"
              >
                <span className="pn-label">
                  下一篇
                  <ChevronRight size={13} />
                </span>
                <strong>{adjacent.newer.title}</strong>
              </Link>
            ) : (
              <div className="pn-placeholder" />
            )}
          </div>

          <div className="article-cta glass">
            <div>
              <span className="section-kicker">AFTER READING</span>
              <h2>读到这里，想说点什么？</h2>
              <p>留言不用注册；如果你也有相似的想法，欢迎留在岛上。</p>
            </div>
            <Link
              href={`${basePath}/guestbook`}
              className="btn btn-primary"
            >
              去留言板
              <ArrowRight size={15} />
            </Link>
          </div>
        </footer>
      </article>
    </SiteShell>
  );
}
