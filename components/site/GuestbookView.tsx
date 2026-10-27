import { Quote } from "lucide-react";
import type { Message, Site, Viewer } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import { DeleteMessageButton } from "./DeleteMessageButton";
import { MessageForm } from "./MessageForm";
import { Reveal } from "./Reveal";
import { SiteShell } from "./SiteShell";

export function GuestbookView({
  site,
  basePath,
  viewer,
  messages,
}: {
  site: Site;
  basePath: string;
  viewer: Viewer | null;
  messages: Message[];
}) {
  return (
    <SiteShell site={site} basePath={basePath} viewer={viewer}>
      <section className="page-hero">
        <span className="section-kicker">GUESTBOOK / 留言板</span>
        <h1 className="page-title">路过的话，就留一句吧。</h1>
        <p className="page-subtitle">
          这里是岛上的一面墙。不需要注册，写下名字和想说的话就好。
          目前已收到 {messages.length} 条留言。
        </p>
      </section>

      <div className="guestbook-layout">
        <aside className="guestbook-form-card glass">
          <span className="section-kicker">LEAVE A NOTE</span>
          <h2>留一句话</h2>
          <p className="form-intro">
            建议留下一个方便称呼的名字。留言会公开显示，请不要写下隐私信息。
          </p>
          <MessageForm
            siteUserId={site.id}
            viewerName={viewer?.displayName ?? null}
          />
        </aside>

        <div className="message-wall-wrap">
          <div className="message-wall-head">
            <span className="section-kicker">THE WALL</span>
            <span className="message-count">{messages.length} NOTES</span>
          </div>

          {messages.length ? (
            <>
              <div className="message-wall">
                {messages.map((message, index) => {
                const canDelete =
                  Boolean(viewer) &&
                  (viewer?.id === site.id ||
                    viewer?.id === message.authorUserId);

                return (
                  <Reveal key={message.id} delay={(index % 4) * 45}>
                    <article
                      className={`message-card glass tilt-${index % 4}`}
                    >
                      <Quote
                        size={18}
                        className="message-quote"
                        aria-hidden="true"
                      />
                      <p className="message-content">{message.content}</p>

                      <footer className="message-footer">
                        <span className="message-avatar">
                          {message.authorName.slice(0, 1)}
                        </span>
                        <div className="message-author">
                          <strong>{message.authorName}</strong>
                          <span>
                            {message.authorHandle
                              ? `@${message.authorHandle}`
                              : "路过的朋友"}
                          </span>
                        </div>
                        <time dateTime={message.createdAt}>
                          {timeAgo(message.createdAt)}
                        </time>
                        {canDelete ? (
                          <DeleteMessageButton messageId={message.id} />
                        ) : null}
                      </footer>
                    </article>
                  </Reveal>
                );
              })}
              </div>

              <div className="wall-note glass">
                <span className="wall-note-quote" aria-hidden="true">
                  “
                </span>
                <p>留言不会过期。很多年后再回来，它们还会在这里亮着。</p>
                <span className="wall-note-sign">— {site.displayName}</span>
              </div>
            </>
          ) : (
            <div className="empty-panel glass empty-panel-lg">
              <Quote size={24} />
              <h2>墙上还是空的。</h2>
              <p>来写第一句话吧，让这座岛留下你的脚印。</p>
            </div>
          )}
        </div>
      </div>
    </SiteShell>
  );
}
