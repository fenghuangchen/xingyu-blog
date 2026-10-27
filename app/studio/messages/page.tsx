import { MessageSquare } from "lucide-react";
import { DeleteMessageButton } from "@/components/site/DeleteMessageButton";
import { requireViewer } from "@/lib/auth";
import { listMessages } from "@/lib/db";
import { formatDateTime, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StudioMessagesPage() {
  const viewer = await requireViewer();
  const messages = listMessages(viewer.id, 200);

  return (
    <div className="studio-page">
      <header className="studio-page-head">
        <div>
          <span className="section-kicker">GUESTBOOK / 留言</span>
          <h1>朋友来过。</h1>
          <p>
            共 {messages.length} 条留言。访客无需登录即可留言；
            你在自己的留言板上也拥有删除权限。
          </p>
        </div>
      </header>

      <section className="studio-panel glass">
        {messages.length ? (
          <div className="studio-message-manage">
            {messages.map((message) => (
              <article className="studio-message-item" key={message.id}>
                <span className="message-avatar">
                  {message.authorName.slice(0, 1)}
                </span>
                <div className="studio-message-body">
                  <div className="studio-message-head">
                    <strong>{message.authorName}</strong>
                    {message.authorHandle ? (
                      <span className="studio-message-handle">
                        @{message.authorHandle}
                      </span>
                    ) : (
                      <span className="studio-message-handle">访客</span>
                    )}
                    <span className="studio-message-time">
                      {timeAgo(message.createdAt)}
                    </span>
                  </div>
                  <p>{message.content}</p>
                  <span className="studio-message-date">
                    {formatDateTime(message.createdAt)}
                  </span>
                </div>
                <DeleteMessageButton messageId={message.id} />
              </article>
            ))}
          </div>
        ) : (
          <div className="studio-empty">
            <MessageSquare size={22} />
            <p>还没有留言。把站点分享给朋友，等待第一句话吧。</p>
          </div>
        )}
      </section>
    </div>
  );
}
