import { timeAgo } from "@/lib/utils";
import type { Moment } from "@/lib/types";

function visibilityText(moment: Moment): string {
  return moment.visibility === "private"
    ? "仅自己"
    : moment.visibility === "friends"
      ? "好友可见"
      : "共同可见";
}

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
          <span
            className={`moment-privacy-tag is-${moment.visibility}`}
            title={`可见范围：${visibilityText(moment)}`}
          >
            {visibilityText(moment)}
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
