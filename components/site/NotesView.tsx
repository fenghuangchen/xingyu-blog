import Link from "next/link";
import { ArrowUpRight, Feather, Search } from "lucide-react";
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
  query?: string;
};

export function NotesView({
  site,
  basePath,
  viewer,
  notes,
  categories,
  activeCategory,
  query,
}: NotesViewProps) {
  const keyword = query?.trim() ?? "";
  const hasQuery = Boolean(keyword);

  function hrefFor(category?: string, search?: string) {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("q", search);
    const suffix = params.toString();
    return `${basePath}/notes${suffix ? `?${suffix}` : ""}`;
  }

  return (
    <SiteShell site={site} basePath={basePath} viewer={viewer}>
      <section className="page-hero">
        <span className="section-kicker">NOTES / 学习笔记</span>
        <h1 className="page-title">
          {hasQuery
            ? "搜索笔记"
            : activeCategory
              ? activeCategory
              : "把想明白的事，写成页。"}
        </h1>
        <p className="page-subtitle">
          {hasQuery
            ? `找到 ${notes.length} 篇与「${keyword}」相关的公开笔记${
                activeCategory ? `（限定在「${activeCategory}」分类）` : ""
              }。`
            : activeCategory
              ? `「${activeCategory}」分类下共有 ${notes.length} 篇公开笔记。`
              : `共 ${site.stats.notes} 篇公开笔记。关于 Agent、AI、代码、阅读，和一些生活里的慢功夫。`}
        </p>
      </section>

      <form
        className="notes-search"
        action={`${basePath}/notes`}
        method="get"
        role="search"
      >
        <Search size={16} aria-hidden="true" />
        <input
          className="notes-search-input"
          type="search"
          name="q"
          defaultValue={keyword}
          placeholder="搜索标题、正文或标签…"
          maxLength={60}
          aria-label="搜索笔记"
        />
        <button type="submit" className="btn btn-ghost btn-sm">
          搜索
        </button>
        {hasQuery ? (
          <Link
            href={hrefFor(activeCategory, "")}
            className="notes-search-clear"
          >
            清除
          </Link>
        ) : null}
      </form>

      <div className="filter-row" aria-label="按分类筛选">
        <Link
          href={hrefFor(undefined, keyword)}
          className={`filter-chip${!activeCategory ? " is-active" : ""}`}
        >
          全部
          <span>{site.stats.notes}</span>
        </Link>
        {categories.map((category) => (
          <Link
            key={category.name}
            href={hrefFor(category.name, keyword)}
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
          <h2>{hasQuery ? "没有找到相关笔记。" : "这一页还是空的。"}</h2>
          <p>
            {hasQuery
              ? "换一个关键词试试，或清除搜索回到全部笔记。"
              : activeCategory
                ? "这个分类下暂时没有公开笔记，换一个分类看看吧。"
                : "第一篇笔记还在路上。如果你是本岛的主人，去创作台把它写下来。"}
          </p>
          {hasQuery ? (
            <Link
              href={hrefFor(activeCategory, "")}
              className="btn btn-ghost"
            >
              清除搜索
            </Link>
          ) : viewer?.id === site.id ? (
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
