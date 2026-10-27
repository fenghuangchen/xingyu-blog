import { Sparkles } from "lucide-react";
import { DeleteMomentButton } from "@/components/studio/DeleteMomentButton";
import { MomentComposer } from "@/components/site/MomentComposer";
import { requireViewer } from "@/lib/auth";
import { listMoments } from "@/lib/db";
import { formatDateTime, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StudioMomentsPage() {
  const viewer = await requireViewer();
  const moments = listMoments(viewer.id, 100);

  return (
    <div className="studio-page">
      <header className="studio-page-head">
        <div>
          <span className="section-kicker">MOMENTS / 动态</span>
          <h1>一些短句和碎片。</h1>
          <p>共 {moments.length} 条动态。动态会立即出现在你的站点上。</p>
        </div>
      </header>

      <MomentComposer siteUserId={viewer.id} variant="studio" />

      <section className="studio-panel glass studio-moments-panel">
        <div className="studio-panel-head">
          <div>
            <span className="section-kicker">HISTORY</span>
            <h2>已经写下的</h2>
          </div>
          <span className="studio-count">{moments.length} 条</span>
        </div>

        {moments.length ? (
          <div className="studio-moment-list">
            {moments.map((moment) => (
              <article className="studio-moment-row" key={moment.id}>
                <span className="studio-moment-mood">
                  {moment.mood || "·"}
                </span>
                <div className="studio-moment-main">
                  <p>{moment.content}</p>
                  <div className="studio-moment-meta">
                    <time dateTime={moment.createdAt}>
                      {formatDateTime(moment.createdAt)}
                    </time>
                    <span className="meta-dot" />
                    <span>{timeAgo(moment.createdAt)}</span>
                  </div>
                </div>
                <DeleteMomentButton momentId={moment.id} />
              </article>
            ))}
          </div>
        ) : (
          <div className="studio-empty">
            <Sparkles size={22} />
            <p>还没有动态。写下此刻的一句话吧。</p>
          </div>
        )}
      </section>
    </div>
  );
}
