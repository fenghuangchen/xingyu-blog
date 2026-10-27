import Link from "next/link";
import { ArrowUpRight, Feather } from "lucide-react";
import type { NoteSummary, Site, Viewer } from "@/lib/types";
import { NoteCard } from "./NoteCard";
import { Reveal } from "./Reveal";
import { SiteShell } from "./SiteShell";

type NotesViewProps = {
  site: Site;
  basePath: string;
  viewer: Viewer | null;
  notes: NoteSummary[];
  categories: Array<{ name: string; count: number }>;
  activeCategory?: string;
};

export function NotesView({
  site,
  basePath,
  viewer,
  notes,
  categories,
  activeCategory,
}: NotesViewProps) {
  return (
    <SiteShell site={site} basePath={basePath} viewer={viewer}>
      <section className="page-hero">
        <span className="section-kicker">NOTES / 学习笔记</span>
        <h1 className="page-title">
          {activeCategory ? activeCategory : "把想明白的事，写成页。"}
        </h1>
        <p className="page-subtitle">
          {activeCategory
            ? `「${activeCategory}」分类下共有 ${notes.length} 篇公开笔记。`
            : `共 ${site.stats.notes} 篇公开笔记。关于 Agent、AI、代码、阅读，和一些生活里的慢功夫。`}
        </p>
      </section>

      <div className="filter-row" aria-label="按分类筛选">
        <Link
          href={`${basePath}/notes`}
          className={`filter-chip${!activeCategory ? " is-active" : ""}`}
        >
          全部
          <span>{site.stats.notes}</span>
        </Link>
        {categories.map((category) => (
          <Link
            key={category.name}
            href={`${basePath}/notes?category=${encodeURIComponent(category.name)}`}
            className={`filter-chip${
              activeCategory === category.name ? " is-active" : ""
            }`}
          >
            {category.name}
            <span>{category.count}</span>
          </Link>
        ))}
      </div>

      {notes.length ? (
        <div className="notes-grid notes-grid-page">
          {notes.map((note, index) => (
            <Reveal key={note.id} delay={(index % 3) * 60}>
              <NoteCard note={note} basePath={basePath} index={index} />
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="empty-panel glass empty-panel-lg">
          <Feather size={26} />
          <h2>这一页还是空的。</h2>
          <p>
            {activeCategory
              ? "这个分类下暂时没有公开笔记，换一个分类看看吧。"
              : "第一篇笔记还在路上。如果你是本岛的主人，去创作台把它写下来。"}
          </p>
          {viewer?.id === site.id ? (
            <Link href="/studio/notes/new" className="btn btn-primary">
              写下第一篇
              <ArrowUpRight size={15} />
            </Link>
          ) : (
            <Link href={`${basePath}/guestbook`} className="btn btn-ghost">
              去留言板看看
            </Link>
          )}
        </div>
      )}
    </SiteShell>
  );
}
