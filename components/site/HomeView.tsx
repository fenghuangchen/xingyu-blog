import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { Message, Moment, NoteSummary, Site, Viewer } from "@/lib/types";
import { daysSince, timeAgo } from "@/lib/utils";
import { FeaturedNote } from "./FeaturedNote";
import { MomentFeed } from "./MomentFeed";
import { NoteCard } from "./NoteCard";
import { ProfileCard } from "./ProfileCard";
import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";
import { SiteShell } from "./SiteShell";

type HomeViewProps = {
  site: Site;
  basePath: string;
  viewer: Viewer | null;
  notes: NoteSummary[];
  moments: Moment[];
  messages: Message[];
};

export function HomeView({
  site,
  basePath,
  viewer,
  notes,
  moments,
  messages,
}: HomeViewProps) {
  const featured = notes[0] ?? null;
  const recent = notes.filter((note) => note.id !== featured?.id).slice(0, 3);
  const momentPreview = moments.slice(0, 4);
  const messagePreview = messages.slice(0, 2);

  return (
    <SiteShell site={site} basePath={basePath} viewer={viewer}>
      <section className="hero">
        <div className="hero-left">
          <ProfileCard site={site} basePath={basePath} />
        </div>

        <div className="hero-right">
          <FeaturedNote
            note={featured}
            basePath={basePath}
            isOwner={viewer?.id === site.id}
          />

          <div className="now-strip glass">
            <span className="now-kicker">
              <span className="now-pulse" />
              NOW
            </span>
            <p>{site.now || "正在认真生活，偶尔更新。"}</p>
            <span className="now-day">DAY {daysSince(site.createdAt)}</span>
          </div>
        </div>
      </section>

      <Reveal>
        <section className="section">
          <SectionHead
            index="01 / NOTES"
            title="最近写下"
            description="学习、代码、阅读，以及一些想留住的想法。"
            href={`${basePath}/notes`}
          />

          {recent.length ? (
            <div className="notes-grid">
              {recent.map((note, index) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  basePath={basePath}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="empty-panel glass">
              <p>还没有更多公开笔记。</p>
              {viewer?.id === site.id ? (
                <Link href="/studio/notes/new" className="btn btn-primary">
                  写下一篇
                </Link>
              ) : null}
            </div>
          )}
        </section>
      </Reveal>

      <Reveal delay={80}>
        <section className="split section">
          <div className="panel glass">
            <div className="panel-head">
              <div>
                <span className="section-kicker">02 / MOMENTS</span>
                <h2 className="panel-title">岛上动态</h2>
              </div>
              <Link href={`${basePath}/moments`} className="section-link">
                全部动态
                <ArrowRight size={15} />
              </Link>
            </div>

            {momentPreview.length ? (
              <MomentFeed moments={momentPreview} />
            ) : (
              <p className="panel-empty">最近很安静，还没有写下动态。</p>
            )}
          </div>

          <div className="side-stack">
            <div className="panel glass">
              <div className="panel-head">
                <div>
                  <span className="section-kicker">03 / GUESTBOOK</span>
                  <h2 className="panel-title">留言板</h2>
                </div>
                <Link href={`${basePath}/guestbook`} className="section-link">
                  去留言
                  <ArrowUpRight size={15} />
                </Link>
              </div>

              <div className="mini-messages">
                {messagePreview.length ? (
                  messagePreview.map((message) => (
                    <div className="mini-message" key={message.id}>
                      <span className="mini-avatar">
                        {message.authorName.slice(0, 1)}
                      </span>
                      <div>
                        <div className="mini-message-head">
                          <strong>{message.authorName}</strong>
                          <span>{timeAgo(message.createdAt)}</span>
                        </div>
                        <p>{message.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="panel-empty">还没有留言，等你来写第一条。</p>
                )}
              </div>

              <Link
                href={`${basePath}/guestbook`}
                className="mini-cta"
              >
                留下你的名字和一句话
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="panel glass about-mini">
              <span className="section-kicker">04 / ABOUT</span>
              <p className="mini-quote">
                {site.bio
                  ? site.bio.split("\n")[0]
                  : "一座记录学习、生活与想法的小岛。"}
              </p>
              <Link
                href={`${basePath}/about`}
                className="section-link"
              >
                更完整地认识我
                <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal delay={120}>
        <section className="cta-band glass">
          <span className="section-kicker">A SMALL INVITATION</span>
          <h2>想在这里，留一句话吗？</h2>
          <p>
            留言不需要注册；如果你也想拥有一座这样的小岛，注册后就能开始。
          </p>
          <div className="cta-actions">
            <Link href={`${basePath}/guestbook`} className="btn btn-primary">
              去留言板
              <ArrowRight size={15} />
            </Link>
            {viewer ? (
              <Link href="/studio" className="btn btn-ghost">
                回到我的创作台
              </Link>
            ) : (
              <Link href="/register" className="btn btn-ghost">
                创建我的小岛
              </Link>
            )}
          </div>
        </section>
      </Reveal>
    </SiteShell>
  );
}
