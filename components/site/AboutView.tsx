import Link from "next/link";
import { ArrowRight, ArrowUpRight, MapPin, Sparkles } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { GithubIcon } from "@/components/icons";
import type { Site, Viewer } from "@/lib/types";
import { daysSince, formatDateLong } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { SiteShell } from "./SiteShell";

export function AboutView({
  site,
  basePath,
  viewer,
}: {
  site: Site;
  basePath: string;
  viewer: Viewer | null;
}) {
  const bioParagraphs = (site.bio || "这个人还没有写下自我介绍。")
    .split(/\n{2,}/)
    .filter(Boolean);

  const github = site.socials.find((social) =>
    social.label.toLowerCase().includes("git"),
  );

  return (
    <SiteShell site={site} basePath={basePath} viewer={viewer}>
      <section className="page-hero">
        <span className="section-kicker">ABOUT / 关于</span>
        <h1 className="page-title">岛主，与这座岛。</h1>
        <p className="page-subtitle">
          一些正式的自我介绍，和一些不太正式的近况。
        </p>
      </section>

      <section className="about-grid">
        <aside className="about-profile glass">
          <div className="about-avatar">
            <span className="avatar-halo" aria-hidden="true" />
            <Avatar src={site.avatar} name={site.displayName} size={132} />
          </div>

          <h2>{site.displayName}</h2>
          <p className="about-handle">@{site.handle}</p>
          <p className="about-tagline">{site.tagline}</p>

          <div className="about-meta">
            {site.location ? (
              <span>
                <MapPin size={13} />
                {site.location}
              </span>
            ) : null}
            <span>
              <Sparkles size={13} />
              第 {daysSince(site.createdAt)} 天在岛上
            </span>
          </div>

          <div className="chip-row chip-row-center">
            {site.tags.map((tag) => (
              <span className="chip" key={tag}>
                {tag}
              </span>
            ))}
          </div>

          <div className="about-links">
            {site.socials.map((social) => (
              <a
                key={`${social.label}-${social.url}`}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="about-link"
              >
                {social.label.toLowerCase().includes("git") ? (
                  <GithubIcon size={15} />
                ) : (
                  <ArrowUpRight size={14} />
                )}
                {social.label}
              </a>
            ))}
            <Link
              href={`${basePath}/guestbook`}
              className="about-link about-link-accent"
            >
              留言给我
              <ArrowRight size={14} />
            </Link>
          </div>
        </aside>

        <div className="about-main">
          <Reveal>
            <div className="about-block glass">
              <span className="section-kicker">BIO</span>
              <h2>关于我</h2>
              <div className="about-bio">
                {bioParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          </Reveal>

          <div className="about-two">
            <Reveal delay={50}>
              <div className="about-block glass about-block-tall">
                <span className="section-kicker">NOW</span>
                <h2>此刻</h2>
                <p className="about-now">
                  {site.now || "没有特别的计划，正在认真过日子。"}
                </p>
                <span className="about-updated">
                  小岛创建于 {formatDateLong(site.createdAt)}
                </span>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="about-block glass about-block-tall">
                <span className="section-kicker">THIS SITE</span>
                <h2>这座小岛</h2>
                <ul className="about-list">
                  <li>一个可以安心写长笔记的地方</li>
                  <li>动态、留言与主题，都属于自己</li>
                  <li>开源，注册即可拥有同样的一座</li>
                </ul>
                <div className="tech-chips">
                  {["Next.js 16", "React 19", "SQLite", "Markdown"].map(
                    (tech) => (
                      <span className="tech-chip" key={tech}>
                        {tech}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={150}>
            <div className="about-block glass">
              <span className="section-kicker">STATS</span>
              <h2>留下的痕迹</h2>
              <div className="stats-band">
                <div>
                  <strong>{site.stats.notes}</strong>
                  <span>篇公开笔记</span>
                </div>
                <div>
                  <strong>{site.stats.moments}</strong>
                  <span>条动态</span>
                </div>
                <div>
                  <strong>{site.stats.messages}</strong>
                  <span>条留言</span>
                </div>
                <div>
                  <strong>{site.stats.views}</strong>
                  <span>次阅读</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Reveal delay={120}>
        <section className="cta-band glass">
          <span className="section-kicker">SAY HELLO</span>
          <h2>不一定要聊技术。</h2>
          <p>聊聊最近读的书、喝的茶，或者只是打一声招呼，都很好。</p>
          <div className="cta-actions">
            <Link href={`${basePath}/guestbook`} className="btn btn-primary">
              去留言板
              <ArrowRight size={15} />
            </Link>
            {github ? (
              <a
                href={github.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
              >
                <GithubIcon size={15} />
                GitHub
              </a>
            ) : null}
          </div>
        </section>
      </Reveal>
    </SiteShell>
  );
}
