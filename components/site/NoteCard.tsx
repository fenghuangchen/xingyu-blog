import Link from "next/link";
import { ArrowUpRight, Heart, Pin } from "lucide-react";
import type { NoteSummary } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { CoverArt } from "./CoverArt";

export function NoteCard({
  note,
  basePath,
  index,
}: {
  note: NoteSummary;
  basePath: string;
  index: number;
}) {
  return (
    <Link
      href={`${basePath}/notes/${note.slug}`}
      className="note-card glass"
    >
      <div className="note-cover">
        <CoverArt cover={note.cover} index={String(index + 1).padStart(2, "0")} />
        {note.pinned ? (
          <span className="note-badge note-badge-pin">
            <Pin size={11} />
            置顶
          </span>
        ) : null}
        {note.category ? (
          <span className="note-badge note-badge-cat">{note.category}</span>
        ) : null}
      </div>

      <div className="note-body">
        <div className="note-tags">
          {note.tags.slice(0, 3).map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>

        <h3>{note.title}</h3>
        <p>{note.summary}</p>

        <div className="note-foot">
          <span>{formatDate(note.createdAt)}</span>
          <span className="note-foot-dot" />
          <span>{note.minutes} 分钟</span>
          <span className="note-likes">
            <Heart size={11} />
            {note.likes}
          </span>
          <span className="note-arrow">
            <ArrowUpRight size={15} />
          </span>
        </div>
      </div>
    </Link>
  );
}
