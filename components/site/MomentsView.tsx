import { Sparkles } from "lucide-react";
import type { Moment, Site, Viewer } from "@/lib/types";
import { MomentComposer } from "./MomentComposer";
import { MomentFeed } from "./MomentFeed";
import { Reveal } from "./Reveal";
import { SiteShell } from "./SiteShell";

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

  return (
    <SiteShell site={site} basePath={basePath} viewer={viewer}>
      <section className="page-hero">
        <span className="section-kicker">MOMENTS / 动态</span>
        <h1 className="page-title">一些没有被写成文章的碎片。</h1>
        <p className="page-subtitle">
          共 {moments.length} 条动态。这里放短句、心情、路上遇见的风景，以及
          不值得单独成篇、却舍不得丢掉的瞬间。
        </p>
      </section>

      {isOwner ? (
        <Reveal>
          <MomentComposer siteUserId={site.id} variant="site" />
        </Reveal>
      ) : null}

      <Reveal delay={60}>
        <div className="timeline-panel glass">
          {moments.length ? (
            <MomentFeed moments={moments} />
          ) : (
            <div className="empty-panel empty-panel-inline">
              <Sparkles size={24} />
              <p>还没有动态。安静也是一种记录。</p>
            </div>
          )}
        </div>
      </Reveal>

      <p className="timeline-footnote">
        动态按时间倒序排列 · 最新的在最上面
      </p>
    </SiteShell>
  );
}
