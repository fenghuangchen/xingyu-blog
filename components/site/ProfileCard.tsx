import Link from "next/link";
import { ArrowUpRight, MapPin, Sparkles } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import type { Site } from "@/lib/types";
import { daysSince } from "@/lib/utils";

export function ProfileCard({
  site,
  basePath,
}: {
  site: Site;
  basePath: string;
}) {
  return (
    <section className="profile-card glass">
      <div className="profile-orbit" aria-hidden="true">
        <span />
        <span />
      </div>

      <div className="profile-top">
        <div className="avatar-frame">
          <span className="avatar-halo" aria-hidden="true" />
          <Avatar src={site.avatar} name={site.displayName} size={104} eager />
          <span className="status-dot" title="在岛上" />
        </div>

        <div className="profile-heading">
          <span className="profile-eyebrow">
            <Sparkles size={13} />
            岛主 · {site.location || "在地球上"}
          </span>
          <h1>{site.displayName}</h1>
          <p className="profile-handle">@{site.handle}</p>
        </div>
      </div>

      <p className="profile-tagline">
        {site.tagline || "在这里，慢慢写下想记住的事。"}
      </p>

      <div className="chip-row">
        {site.tags.slice(0, 5).map((tag) => (
          <span className="chip" key={tag}>
            {tag}
          </span>
        ))}
        {site.location ? (
          <span className="chip chip-location">
            <MapPin size={12} />
            {site.location}
          </span>
        ) : null}
      </div>

      <div className="profile-stats">
        <div className="profile-stat">
          <span className="stat-value">{site.stats.notes}</span>
          <span className="stat-label">笔记</span>
        </div>
        <div className="profile-stat">
          <span className="stat-value">{site.stats.moments}</span>
          <span className="stat-label">动态</span>
        </div>
        <div className="profile-stat">
          <span className="stat-value">{site.stats.messages}</span>
          <span className="stat-label">留言</span>
        </div>
        <div className="profile-stat">
          <span className="stat-value">{site.stats.views}</span>
          <span className="stat-label">阅读</span>
        </div>
      </div>

      <div className="profile-actions">
        <Link href={`${basePath}/notes`} className="btn btn-primary">
          读我的笔记
          <ArrowUpRight size={15} />
        </Link>
        <Link href={`${basePath}/guestbook`} className="btn btn-ghost">
          留一句话
        </Link>
      </div>

      <div className="profile-foot">
        <span>第 {daysSince(site.createdAt)} 天在岛上</span>
        <span className="profile-socials">
          {site.socials.slice(0, 3).map((social) => (
            <a
              key={`${social.label}-${social.url}`}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {social.label}
            </a>
          ))}
        </span>
      </div>
    </section>
  );
}
