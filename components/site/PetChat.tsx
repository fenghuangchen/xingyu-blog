"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Send, Star, X } from "lucide-react";

type PetMessage = {
  id: string;
  role: "pet" | "user";
  text: string;
  at: number;
};

const QUICK_PROMPTS = [
  "今天写点什么？",
  "陪我发会儿呆",
  "讲个星星的事",
  "帮我打打气",
];

const FALLBACKS = [
  "我在听，你慢慢说。",
  "这件事可以再想一会儿，不急着有答案。",
  "嗯，我记下了。要不要先喝口水？",
  "岛上的风现在很轻，适合把心里的话放下来。",
  "我不太懂人类的所有事，但我会认真听。",
  "如果现在不知道做什么，就先坐一会儿吧。",
];

function pickFallback(): string {
  return FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
}

function greeting(name: string): string {
  const hour = new Date().getHours();
  if (hour < 6) return `这么晚还没睡吗，${name}？我陪你到困为止。`;
  if (hour < 11) return `早上好，${name}。今天的光很轻，适合慢慢开始。`;
  if (hour < 18) return `下午好，${name}。我在岛上晒了一会儿星星。`;
  return `晚上好，${name}。茶还温着，今天想聊什么？`;
}

function reply(text: string, name: string, pathname: string): string {
  const value = text.trim();
  const lower = value.toLowerCase();
  const hour = new Date().getHours();
  const inNotes = pathname.includes("/notes");
  const inMoments = pathname.includes("/moments");
  const inGuestbook = pathname.includes("/guestbook");

  if (/你好|嗨|hi|hello|在吗/.test(lower)) {
    return name
      ? `我在。${name}，今天也辛苦啦，想聊什么都可以。`
      : "我在。今天也辛苦啦，想聊什么都可以。";
  }

  if (/累|困|疲惫|烦|压力|不想动|没力气/.test(lower)) {
    return "那就先不做什么。把肩膀放下来，慢慢呼吸三次。世界不会因为你休息一会儿就停下来的。";
  }

  if (/写|笔记|文章|代码|论文|作业/.test(lower)) {
    if (inNotes) {
      return "你已经在笔记页了。先写一句最想留下的话，不用一口气写完。写累了就抬头看看窗外。";
    }
    return "先写一句就好，不用等灵感完整。你可以从「今天最想记住的一件事」开始。";
  }

  if (/动态|心情|难过|开心|孤独|想哭|高兴/.test(lower)) {
    if (inMoments) {
      return "这里适合放一小块心情。你可以设成好友可见，或者只留给自己。";
    }
    return "心情不用马上被解释。想说的话可以写进动态，也可以只说给我听。";
  }

  if (/茶|喝|咖啡|水/.test(lower)) {
    return "去倒一杯温热的水吧。茶不用太浓，坐着喝两口，也算给今天留了一个停顿。";
  }

  if (/星|月亮|夜|晚上|天空/.test(lower)) {
    return hour >= 18
      ? "今晚的星星很安静。你看它们的时候，它们也在慢慢看你。"
      : "星星白天也在，只是被光藏起来了。就像一些还没说出口的话。";
  }

  if (/朋友|好友|聊天|孤独|陪我/.test(lower)) {
    if (inGuestbook) {
      return "留言板上的每一句话，都会在某个时刻被看见。你也可以先留一句给未来的自己。";
    }
    return "朋友不用很多，能认真听你说话的就很好。你也可以去好友页找一个人聊聊天。";
  }

  if (/喜欢|可爱|想你|抱抱|摸摸/.test(lower)) {
    return "喵。被这样说的话，我的尾巴会翘起来一点点。";
  }

  if (/谢谢|感谢/.test(lower)) {
    return "不用谢。你愿意停下来跟我说这些，我已经很开心了。";
  }

  if (/晚安|睡了|再见|拜拜/.test(lower)) {
    return "晚安。把今天轻轻放下，明天醒来再慢慢来。我会在岛上替你看一会儿星星。";
  }

  if (/怎么办|不知道|迷茫|选择|焦虑/.test(lower)) {
    return "先不用把所有答案都想出来。挑一件最小、最不费力的事做掉，路会慢慢显出来的。";
  }

  if (/[?？]$/.test(value)) {
    return "这个问题我可能答不好。但我可以陪你一起想：你现在最在意的是哪一部分？";
  }

  return pickFallback();
}

export function PetChat({
  open,
  onClose,
  viewerName,
}: {
  open: boolean;
  onClose: () => void;
  viewerName?: string;
}) {
  const pathname = usePathname();
  const name = viewerName || "旅人";
  const storageKey = `xingyu:pet-chat:${viewerName || "guest"}`;
  const [messages, setMessages] = useState<PetMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const stored = JSON.parse(raw) as PetMessage[];
        if (Array.isArray(stored) && stored.length) {
          setMessages(stored.slice(-40));
          setLoaded(true);
          return;
        }
      }
    } catch {
      // ignore malformed history
    }

    setMessages([
      {
        id: `pet-${Date.now()}`,
        role: "pet",
        text: greeting(name),
        at: Date.now(),
      },
    ]);
    setLoaded(true);
  }, [name, storageKey]);

  useEffect(() => {
    if (!loaded || !messages.length) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(messages.slice(-40)));
    } catch {
      // browser storage may be disabled
    }
  }, [loaded, messages, storageKey]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 240);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    const node = bodyRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, typing]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  useEffect(() => {
    return () => {
      if (replyTimer.current) clearTimeout(replyTimer.current);
    };
  }, []);

  function send(text: string) {
    const content = text.trim();
    if (!content || typing) return;

    const mine: PetMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: content.slice(0, 200),
      at: Date.now(),
    };

    setMessages((current) => [...current, mine]);
    setDraft("");
    setTyping(true);

    const delay = 650 + Math.random() * 550;
    replyTimer.current = setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: `pet-${Date.now()}`,
          role: "pet",
          text: reply(content, name, pathname),
          at: Date.now(),
        },
      ]);
      setTyping(false);
    }, delay);
  }

  if (!open) return null;

  const time = (value: number) =>
    new Intl.DateTimeFormat("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Shanghai",
    }).format(new Date(value));

  return (
    <section
      className="pet-chat"
      role="dialog"
      aria-label="和星屿猫聊天"
      aria-modal="false"
    >
      <header className="pet-chat-head">
        <div className="pet-chat-profile">
          <span className="pet-chat-avatar" aria-hidden="true">
            <Star size={15} />
          </span>
          <div>
            <strong>星屿猫</strong>
            <span>在线 · 会认真听你说话</span>
          </div>
        </div>
        <button
          type="button"
          className="pet-chat-close"
          onClick={onClose}
          aria-label="关闭宠物聊天"
        >
          <X size={15} />
        </button>
      </header>

      <div className="pet-chat-body" ref={bodyRef} aria-live="polite">
        {messages.map((message) => (
          <div
            className={`pet-chat-message is-${message.role}`}
            key={message.id}
          >
            {message.role === "pet" ? (
              <span className="pet-chat-dot" aria-hidden="true">
                ✦
              </span>
            ) : null}
            <div>
              <p>{message.text}</p>
              <time dateTime={new Date(message.at).toISOString()}>
                {time(message.at)}
              </time>
            </div>
          </div>
        ))}
        {typing ? (
          <div className="pet-chat-message is-pet">
            <span className="pet-chat-dot" aria-hidden="true">
              ✦
            </span>
            <div className="pet-typing" aria-label="星屿猫正在输入">
              <i />
              <i />
              <i />
            </div>
          </div>
        ) : null}
      </div>

      <div className="pet-chat-prompts">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => send(prompt)}
            disabled={typing}
          >
            {prompt}
          </button>
        ))}
      </div>

      <form
        className="pet-chat-composer"
        onSubmit={(event) => {
          event.preventDefault();
          send(draft);
        }}
      >
        <input
          ref={inputRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value.slice(0, 200))}
          placeholder={`和星屿猫说点什么，${name}…`}
          maxLength={200}
          aria-label="和星屿猫聊天"
        />
        <button type="submit" disabled={!draft.trim() || typing} aria-label="发送">
          <Send size={15} />
        </button>
      </form>
    </section>
  );
}
