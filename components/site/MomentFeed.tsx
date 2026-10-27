import { timeAgo } from "@/lib/utils";
import type { Moment } from "@/lib/types";

export function MomentItem({ moment }: { moment: Moment }) {
  return (
    <article className="moment-item">
      <span className="moment-mark" aria-hidden="true">
        {moment.mood || "·"}
      </span>
      <div className="moment-content">
        <div className="moment-meta">
          <time dateTime={moment.createdAt}>{timeAgo(moment.createdAt)}</time>
          <span className="meta-dot" />
          <span>
            {new Intl.DateTimeFormat("zh-CN", {
              month: "long",
              day: "numeric",
              timeZone: "Asia/Shanghai",
            }).format(new Date(moment.createdAt))}
          </span>
        </div>
        <p>{moment.content}</p>
      </div>
    </article>
  );
}

export function MomentFeed({ moments }: { moments: Moment[] }) {
  return (
    <div className="moment-feed">
      {moments.map((moment) => (
        <MomentItem key={moment.id} moment={moment} />
      ))}
    </div>
  );
}
