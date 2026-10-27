import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { NoteSummary } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { CoverArt } from "./CoverArt";

export function FeaturedNote({
  note,
  basePath,
  isOwner,
}: {
  note: NoteSummary | null;
  basePath: string;
  isOwner: boolean;
}) {
  if (!note) {
    return (
      <section className="featured featured-empty glass">
        <span className="featured-eyebrow">
          <span className="dot" />
          第一篇笔记
        </span>
        <h2>这里还是一片安静的海。</h2>
        <p>
          {isOwner
            ? "写下第一篇文章，让这座小岛亮起第一盏灯。"
            : "岛主还没有公开笔记。可以先在留言板上打个招呼，或者去发现其他小岛。"}
        </p>
        {isOwner ? (
          <Link href="/studio/notes/new" className="btn btn-primary">
            开始写作
            <ArrowUpRight size={15} />
          </Link>
        ) : (
          <Link href={`${basePath}/guestbook`} className="btn btn-primary">
            去留言板
            <ArrowUpRight size={15} />
          </Link>
        )}
      </section>
    );
  }

  return (
    <Link
      href={`${basePath}/notes/${note.slug}`}
      className="featured glass"
      aria-label={note.title}
    >
      <div className="featured-body">
        <span className="featured-eyebrow">
          <span className="dot" />
          {note.pinned ? "置顶 · 精选笔记" : "最新笔记"}
        </span>

        <h2>{note.title}</h2>
        <p className="featured-summary">{note.summary}</p>

        <div className="featured-meta">
          <span>{formatDate(note.createdAt)}</span>
          <span className="meta-dot" />
          <span>约 {note.minutes} 分钟</span>
          <span className="meta-dot" />
          <span>{note.views} 次阅读</span>
        </div>

        <span className="featured-link">
          阅读全文
          <span className="featured-arrow">
            <ArrowUpRight size={16} />
          </span>
        </span>
      </div>

      <div className="featured-visual">
        <CoverArt cover={note.cover} index="01" />
        <span className="featured-badge">LATEST INSIGHT</span>
        {note.category ? (
          <span className="featured-cat">{note.category}</span>
        ) : null}
        {note.tags.length ? (
          <div className="featured-tags">
            {note.tags.slice(0, 2).map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
