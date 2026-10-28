"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import {
  ArrowUpRight,
  Check,
  Clock,
  Loader2,
  MessageCircle,
  Search,
  Send,
  Users,
  X,
} from "lucide-react";
import { Avatar } from "@/components/Avatar";
import type {
  FriendMessage,
  FriendMoment,
  FriendState,
  FriendUser,
} from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";

const CHAT_TIME = new Intl.DateTimeFormat("zh-CN", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Shanghai",
});

function relationActionText(relation: FriendUser["relation"]): string {
  if (relation === "friends") return "已是好友";
  if (relation === "pending_out") return "已申请";
  if (relation === "pending_in") return "接受申请";
  return "加好友";
}

export function FriendsPanel({
  viewer,
  initialState,
  friendMoments,
}: {
  viewer: { id: string; displayName: string; handle: string; avatar: string };
  initialState: FriendState;
  friendMoments: FriendMoment[];
}) {
  const router = useRouter();
  const [state, setState] = useState(initialState);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialState.friends[0]?.id ?? null,
  );
  const [messages, setMessages] = useState<FriendMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<FriendUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [error, setError] = useState("");
  const messagesRef = useRef<HTMLDivElement>(null);

  const selected = state.friends.find((friend) => friend.id === selectedId);

  useEffect(() => {
    setState(initialState);
  }, [initialState]);

  useEffect(() => {
    if (!selectedId && state.friends.length) {
      setSelectedId(state.friends[0].id);
    }
  }, [selectedId, state.friends]);

  const refreshState = useCallback(async () => {
    try {
      const response = await fetch("/api/friends", { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as FriendState;
      setState(data);
      setSelectedId((current) => {
        if (current && data.friends.some((friend) => friend.id === current)) {
          return current;
        }
        return data.friends[0]?.id ?? null;
      });
    } catch {
      // Keep the last good state during temporary network hiccups.
    }
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void refreshState();
    }, 10_000);
    return () => window.clearInterval(timer);
  }, [refreshState]);

  const loadMessages = useCallback(async (friendId: string) => {
    setLoadingChat(true);
    try {
      const response = await fetch(`/api/friends/${friendId}/messages`, {
        cache: "no-store",
      });
      if (!response.ok) return;
      const data = (await response.json()) as { messages?: FriendMessage[] };
      setMessages(data.messages ?? []);
    } catch {
      // Keep the current messages on failure.
    } finally {
      setLoadingChat(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }

    void loadMessages(selectedId);
    const timer = window.setInterval(() => {
      void loadMessages(selectedId);
    }, 4_000);

    return () => window.clearInterval(timer);
  }, [selectedId, loadMessages]);

  useEffect(() => {
    const node = messagesRef.current;
    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const query = search.trim();
    if (!query) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/friends/search?q=${encodeURIComponent(query)}`,
          { cache: "no-store" },
        );
        if (!response.ok) return;
        const data = (await response.json()) as { users?: FriendUser[] };
        setResults(data.users ?? []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 320);

    return () => window.clearTimeout(timer);
  }, [search]);

  async function runAction(
    body: Record<string, string>,
  ): Promise<boolean> {
    if (busy) return false;
    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        setError(data.error || "操作失败，请稍后再试。");
        return false;
      }

      await refreshState();
      router.refresh();
      return true;
    } catch {
      setError("网络开小差了，请稍后再试。");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function addFriend(userId: string) {
    const ok = await runAction({ action: "request", userId });
    if (ok) {
      setResults((items) =>
        items.map((item) =>
          item.id === userId
            ? { ...item, relation: "pending_out", requestId: null }
            : item,
        ),
      );
    }
  }

  async function acceptRequest(requestId: string | null) {
    if (!requestId) return;
    await runAction({ action: "accept", requestId });
  }

  async function declineRequest(requestId: string | null) {
    if (!requestId) return;
    await runAction({ action: "decline", requestId });
  }

  async function removeFriend(friend: FriendUser) {
    if (
      !window.confirm(
        `解除和「${friend.displayName}」的好友关系？聊天记录也会一起删除。`,
      )
    ) {
      return;
    }
    await runAction({ action: "remove", userId: friend.id });
    setSelectedId(null);
  }

  async function sendMessage(event?: FormEvent) {
    event?.preventDefault();
    if (!selected || !draft.trim() || busy) return;

    setBusy(true);
    setError("");
    const content = draft.trim();

    try {
      const response = await fetch(`/api/friends/${selected.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        setError(data.error || "发送失败，请稍后再试。");
        return;
      }

      setDraft("");
      await loadMessages(selected.id);
      await refreshState();
    } catch {
      setError("网络开小差了，请稍后再试。");
    } finally {
      setBusy(false);
    }
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  return (
    <div className="studio-page friends-page">
      <header className="studio-page-head friends-head">
        <div>
          <span className="section-kicker">FRIENDS / 好友</span>
          <h1>岛上相识。</h1>
          <p>
            用昵称找到另一位岛主，成为好友后可以在这里专属聊天，
            也能看到彼此最近的动态。
          </p>
        </div>
        <div className="friends-head-stats">
          <span>
            <strong>{state.friends.length}</strong>
            好友
          </span>
          <span>
            <strong>{state.incoming.length}</strong>
            待处理
          </span>
          <span>
            <strong>{state.unread}</strong>
            未读
          </span>
        </div>
      </header>

      {error ? <p className="form-error friends-error">{error}</p> : null}

      <div className="friends-layout">
        <aside className="friends-side glass">
          <label className="friends-search">
            <Search size={15} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="按昵称或用户名找人…"
              aria-label="搜索好友"
            />
            {search ? (
              <button
                type="button"
                className="friends-search-clear"
                onClick={() => setSearch("")}
                aria-label="清空搜索"
              >
                <X size={13} />
              </button>
            ) : null}
          </label>

          {search.trim() ? (
            <section className="friends-block">
              <div className="friends-block-head">
                <span>搜索结果</span>
                {searching ? <Loader2 size={12} className="spin" /> : null}
              </div>

              {results.length ? (
                <div className="friend-search-list">
                  {results.map((user) => (
                    <div className="friend-search-row" key={user.id}>
                      <Avatar
                        src={user.avatar}
                        name={user.displayName}
                        size={34}
                      />
                      <div className="friend-search-copy">
                        <strong>{user.displayName}</strong>
                        <span>@{user.handle}</span>
                      </div>
                      {user.relation === "pending_in" && user.requestId ? (
                        <button
                          type="button"
                          className="friend-mini-btn is-accent"
                          onClick={() => acceptRequest(user.requestId)}
                          disabled={busy}
                        >
                          接受
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={cn(
                            "friend-mini-btn",
                            user.relation === "none" && "is-accent",
                          )}
                          onClick={() => addFriend(user.id)}
                          disabled={
                            busy ||
                            user.relation === "friends" ||
                            user.relation === "pending_out"
                          }
                        >
                          {relationActionText(user.relation)}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="friends-muted">
                  {searching ? "正在找人…" : "没有找到匹配的昵称。"}
                </p>
              )}
            </section>
          ) : null}

          {state.incoming.length ? (
            <section className="friends-block">
              <div className="friends-block-head">
                <span>好友申请</span>
                <span className="friends-count">{state.incoming.length}</span>
              </div>

              <div className="friend-request-list">
                {state.incoming.map((user) => (
                  <div className="friend-request" key={user.id}>
                    <Avatar
                      src={user.avatar}
                      name={user.displayName}
                      size={36}
                    />
                    <div className="friend-search-copy">
                      <strong>{user.displayName}</strong>
                      <span>@{user.handle}</span>
                    </div>
                    <div className="friend-request-actions">
                      <button
                        type="button"
                        className="friend-icon-btn is-accept"
                        onClick={() => acceptRequest(user.requestId)}
                        disabled={busy}
                        title="接受"
                        aria-label="接受好友申请"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        type="button"
                        className="friend-icon-btn"
                        onClick={() => declineRequest(user.requestId)}
                        disabled={busy}
                        title="忽略"
                        aria-label="忽略好友申请"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="friends-block friends-list-block">
            <div className="friends-block-head">
              <span>我的好友</span>
              <span className="friends-count">{state.friends.length}</span>
            </div>

            {state.friends.length ? (
              <div className="friend-list">
                {state.friends.map((friend) => (
                  <button
                    key={friend.id}
                    type="button"
                    className={cn(
                      "friend-row",
                      friend.id === selectedId && "is-active",
                    )}
                    onClick={() => setSelectedId(friend.id)}
                  >
                    <Avatar
                      src={friend.avatar}
                      name={friend.displayName}
                      size={38}
                    />
                    <span className="friend-row-copy">
                      <strong>{friend.displayName}</strong>
                      <small>@{friend.handle}</small>
                    </span>
                    {friend.unread > 0 ? (
                      <span className="friend-unread">{friend.unread}</span>
                    ) : null}
                  </button>
                ))}
              </div>
            ) : (
              <div className="friends-empty-small">
                <Users size={18} />
                <p>还没有好友。搜索一个昵称，从一句你好开始。</p>
              </div>
            )}
          </section>

          {state.outgoing.length ? (
            <section className="friends-block">
              <div className="friends-block-head">
                <span>等待通过</span>
                <span className="friends-count">{state.outgoing.length}</span>
              </div>
              <div className="friend-outgoing-list">
                {state.outgoing.map((user) => (
                  <div className="friend-outgoing-row" key={user.id}>
                    <Avatar
                      src={user.avatar}
                      name={user.displayName}
                      size={26}
                    />
                    <span>{user.displayName}</span>
                    <Clock size={12} />
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </aside>

        <section className="friends-chat glass">
          {selected ? (
            <>
              <header className="friends-chat-head">
                <div className="friends-chat-person">
                  <Avatar
                    src={selected.avatar}
                    name={selected.displayName}
                    size={42}
                  />
                  <div>
                    <strong>{selected.displayName}</strong>
                    <span>@{selected.handle}</span>
                  </div>
                </div>
                <div className="friends-chat-actions">
                  <Link
                    href={`/u/${selected.handle}`}
                    className="friend-head-link"
                  >
                    主页
                    <ArrowUpRight size={13} />
                  </Link>
                  <Link
                    href={`/u/${selected.handle}/moments`}
                    className="friend-head-link"
                  >
                    动态
                    <ArrowUpRight size={13} />
                  </Link>
                  <button
                    type="button"
                    className="friend-remove-btn"
                    onClick={() => removeFriend(selected)}
                    disabled={busy}
                  >
                    解除好友
                  </button>
                </div>
              </header>

              <div className="friends-chat-body" ref={messagesRef}>
                {loadingChat && !messages.length ? (
                  <div className="friends-chat-empty">
                    <Loader2 size={18} className="spin" />
                    <p>正在打开聊天…</p>
                  </div>
                ) : messages.length ? (
                  messages.map((message) => {
                    const mine = message.senderId === viewer.id;
                    return (
                      <div
                        className={cn(
                          "friend-message",
                          mine && "is-mine",
                        )}
                        key={message.id}
                      >
                        {!mine ? (
                          <Avatar
                            src={selected.avatar}
                            name={selected.displayName}
                            size={26}
                          />
                        ) : null}
                        <div className="friend-message-main">
                          <div className="friend-bubble">{message.content}</div>
                          <time dateTime={message.createdAt}>
                            {CHAT_TIME.format(new Date(message.createdAt))}
                          </time>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="friends-chat-empty">
                    <MessageCircle size={26} />
                    <p>这里只有你们两个人。</p>
                    <span>发一句你好，开始这段专属聊天。</span>
                  </div>
                )}
              </div>

              <form className="friend-composer" onSubmit={sendMessage}>
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={handleComposerKeyDown}
                  placeholder={`和 ${selected.displayName} 说点什么…`}
                  rows={2}
                  maxLength={2000}
                  aria-label="聊天内容"
                />
                <button
                  type="submit"
                  className="friend-send-btn"
                  disabled={!draft.trim() || busy}
                  aria-label="发送消息"
                >
                  {busy ? (
                    <Loader2 size={16} className="spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </form>
              <p className="friends-chat-note">
                专属聊天 · 只有你们两个人能看到 · Shift + Enter 换行
              </p>
            </>
          ) : (
            <div className="friends-chat-empty is-large">
              <MessageCircle size={34} />
              <h2>从一句你好开始。</h2>
              <p>在左侧按昵称找到一个人，成为好友后就能在这里聊天。</p>
            </div>
          )}
        </section>
      </div>

      <section className="friends-moments">
        <div className="friends-moments-head">
          <div>
            <span className="section-kicker">FRIEND MOMENTS / 好友动态</span>
            <h2>朋友最近在做什么。</h2>
          </div>
          <span className="friends-moments-note">
            成为好友后，彼此的最近动态会汇总在这里。
          </span>
        </div>

        {friendMoments.length ? (
          <div className="friend-moment-grid">
            {friendMoments.map((moment) => (
              <Link
                key={moment.id}
                href={`/u/${moment.authorHandle}/moments`}
                className="friend-moment-card glass"
              >
                <div className="friend-moment-top">
                  <Avatar
                    src={moment.authorAvatar}
                    name={moment.authorName}
                    size={30}
                  />
                  <div>
                    <strong>{moment.authorName}</strong>
                    <span>@{moment.authorHandle}</span>
                  </div>
                  <span className="friend-moment-mood">
                    {moment.mood || "·"}
                  </span>
                </div>
                <p>{moment.content}</p>
                <time dateTime={moment.createdAt}>
                  {formatDateTime(moment.createdAt)}
                </time>
                {moment.visibility !== "public" ? (
                  <span className="friend-moment-privacy">好友可见</span>
                ) : null}
              </Link>
            ))}
          </div>
        ) : (
          <div className="friends-empty glass">
            <Users size={22} />
            <p>加好友后，你们会在这里看到彼此最近的动态。</p>
          </div>
        )}
      </section>
    </div>
  );
}
