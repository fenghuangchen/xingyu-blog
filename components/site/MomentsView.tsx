import type { Moment, Site, Viewer } from "@/lib/types";
import { MomentComposer } from "./MomentComposer";
import { MomentsWall } from "./MomentsWall";
import { Reveal } from "./Reveal";
import { SiteShell } from "./SiteShell";

const MONTH_KEY = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  timeZone: "Asia/Shanghai",
});

export function MomentsView({
  site,
  basePath,
  viewer,
  moments,
}: {
  site: Site;
  basePath: string;
  viewer: Viewer | null;
  moments: Moment[];
}) {
  const isOwner = viewer?.id === site.id;
  const thisMonth = MONTH_KEY.format(new Date());
  const monthCount = moments.filter(
    (moment) => MONTH_KEY.format(new Date(moment.createdAt)) === thisMonth,
  ).length;
  const moods = new Set(
    moments.map((moment) => moment.mood?.trim() || "·"),
  );
  const latest = moments[0] ?? null;

  return (
    <SiteShell site={site} basePath={basePath} viewer={viewer}>
      <section className="page-hero moments-hero">
        <span className="moments-hero-orbit" aria-hidden="true" />
        <span className="section-kicker">MOMENTS / 动态</span>
        <h1 className="page-title">一些没有被写成文章的碎片。</h1>
        <p className="page-subtitle">
          共 {moments.length} 条动态。这里放短句、心情、路上遇见的风景，以及
          不值得单独成篇、却舍不得丢掉的瞬间。
        </p>
      </section>

      <div className="moments-summary">
        <div className="moment-stat glass">
          <span className="moment-stat-kicker">TOTAL</span>
          <strong>{moments.length}</strong>
          <span>条动态</span>
        </div>
        <div className="moment-stat glass">
          <span className="moment-stat-kicker">THIS MONTH</span>
          <strong>{monthCount}</strong>
          <span>本月碎片</span>
        </div>
        <div className="moment-stat glass">
          <span className="moment-stat-kicker">MOODS</span>
          <strong>{moods.size}</strong>
          <span>种心情</span>
        </div>
        <div className="moment-stat moment-latest glass">
          <span className="moment-stat-kicker">LATEST</span>
          <div className="moment-latest-row">
            <span className="moment-latest-mood">
              {latest?.mood?.trim() || "·"}
            </span>
            <p>
              {latest
                ? latest.content.slice(0, 48) +
                  (latest.content.length > 48 ? "…" : "")
                : "还没有动态"}
            </p>
          </div>
        </div>
      </div>

      {isOwner ? (
        <Reveal>
          <MomentComposer siteUserId={site.id} variant="site" />
        </Reveal>
      ) : null}

      <Reveal delay={60}>
        <MomentsWall moments={moments} />
      </Reveal>

      <p className="timeline-footnote">
        动态按时间倒序排列 · 最新的在最上面
      </p>
    </SiteShell>
  );
}
