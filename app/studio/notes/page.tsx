import Link from "next/link";
import { ArrowUpRight, Eye, Feather, PenLine } from "lucide-react";
import { DeleteNoteButton } from "@/components/studio/DeleteNoteButton";
import { requireViewer } from "@/lib/auth";
import { listAllNotes } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StudioNotesPage() {
  const viewer = await requireViewer();
  const notes = listAllNotes(viewer.id);

  return (
    <div className="studio-page">
      <header className="studio-page-head">
        <div>
          <span className="section-kicker">NOTES / 学习笔记</span>
          <h1>你的笔记本。</h1>
          <p>
            共 {notes.length} 篇，其中{" "}
            {notes.filter((note) => note.status === "published").length} 篇已发布。
            草稿只有你自己能看到。
          </p>
        </div>
        <div className="head-actions">
          <Link href="/studio/notes/new" className="btn btn-primary">
            <PenLine size={15} />
            新建笔记
          </Link>
        </div>
      </header>

      {notes.length ? (
        <section className="studio-panel glass studio-table-panel">
          <div className="studio-table studio-table-notes">
            <div className="studio-table-head">
              <span>标题</span>
              <span>状态</span>
              <span>分类</span>
              <span>更新于</span>
              <span>阅读</span>
              <span aria-hidden="true" />
            </div>

            {notes.map((note) => (
              <div className="studio-table-row" key={note.id}>
                <Link
                  href={`/studio/notes/${note.id}`}
                  className="studio-note-title"
                >
                  <strong>{note.title}</strong>
                  <span>{note.summary}</span>
                </Link>

                <span className={`status-chip ${note.status}`}>
                  {note.status === "published" ? "已发布" : "草稿"}
                </span>
                <span className="studio-muted">{note.category || "未分类"}</span>
                <span className="studio-muted">
                  {formatDate(note.updatedAt)}
                </span>
                <span className="studio-muted studio-views">
                  <Eye size={13} />
                  {note.views}
                </span>

                <div className="studio-row-actions">
                  {note.status === "published" ? (
                    <Link
                      href={`/u/${viewer.handle}/notes/${note.slug}`}
                      className="icon-btn"
                      title="查看公开页面"
                      aria-label="查看公开页面"
                    >
                      <ArrowUpRight size={14} />
                    </Link>
                  ) : null}
                  <DeleteNoteButton noteId={note.id} compact />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className="empty-panel glass empty-panel-lg">
          <Feather size={26} />
          <h2>还没有笔记。</h2>
          <p>从一个小想法开始就好，不必等到想清楚全部。</p>
          <Link href="/studio/notes/new" className="btn btn-primary">
            写下第一篇
          </Link>
        </div>
      )}
    </div>
  );
}
