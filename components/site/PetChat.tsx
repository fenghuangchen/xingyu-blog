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
  "我有点焦虑",
  "帮我拆解任务",
  "陪我复盘今天",
  "我睡不着",
  "帮我算 12 × 8",
  "给我一句晚安",
];

const FALLBACKS = [
  "我在听，你慢慢说。",
  "这件事可以再想一会儿，不急着有答案。",
  "嗯，我记下了。要不要先喝口水？",
  "岛上的风现在很轻，适合把心里的话放下来。",
  "我不太懂人类的所有事，但我会认真听。",
  "如果现在不知道做什么，就先坐一会儿吧。",
  "先照顾好此刻的自己，剩下的可以一步一步来。",
];

function pickFallback(): string {
  return FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
}

function parseArithmetic(source: string): number | null {
  const input = source.replace(/\s+/g, "");
  let index = 0;

  function parseFactor(): number {
    let sign = 1;
    if (input[index] === "+" || input[index] === "-") {
      sign = input[index] === "-" ? -1 : 1;
      index += 1;
    }

    if (input[index] === "(") {
      index += 1;
      const value = parseExpression();
      if (input[index] !== ")") throw new Error("paren");
      index += 1;
      return sign * value;
    }

    const start = index;
    while (/[\d.]/.test(input[index] ?? "")) index += 1;
    if (start === index) throw new Error("number");
    const value = Number(input.slice(start, index));
    if (!Number.isFinite(value)) throw new Error("number");
    return sign * value;
  }

  function parseTerm(): number {
    let value = parseFactor();
    while (input[index] === "*" || input[index] === "/" || input[index] === "%") {
      const operator = input[index];
      index += 1;
      const right = parseFactor();
      if (operator === "*") value *= right;
      else if (operator === "/") value /= right;
      else value %= right;
    }
    return value;
  }

  function parseExpression(): number {
    let value = parseTerm();
    while (input[index] === "+" || input[index] === "-") {
      const operator = input[index];
      index += 1;
      const right = parseTerm();
      value = operator === "+" ? value + right : value - right;
    }
    return value;
  }

  try {
    const result = parseExpression();
    if (index !== input.length || !Number.isFinite(result)) return null;
    return result;
  } catch {
    return null;
  }
}

function tryMath(raw: string): string | null {
  const cleaned = raw
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/帮我算(一下|一算)?|算一下|请问|等于多少|等于|是多少|多少/g, "")
    .replace(/[?？=]/g, "")
    .trim();

  if (
    !cleaned ||
    !/^[\d+\-*/().%\s]+$/.test(cleaned) ||
    !/[+\-*/%]/.test(cleaned)
  ) {
    return null;
  }

  // Don't turn a date into an arithmetic result.
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(cleaned)) return null;

  const result = parseArithmetic(cleaned);
  if (result === null) return null;

  const display = Number.isInteger(result)
    ? String(result)
    : String(Number(result.toFixed(4)));
  return `${cleaned} = ${display}`;
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

  if (/不想活|自杀|伤害自己|结束生命|活着没意思/.test(lower)) {
    return "我很在意你现在的安全。先不要一个人扛着，好吗？请立刻联系一个你信任的人，或者拨打当地急救 / 心理援助电话。如果你现在就在危险中，请先离开可能伤害自己的东西，去有人的地方。";
  }

  if (/你叫什么|你是谁|你的名字/.test(lower)) {
    return "我是星屿猫，住在这座小岛的右下角。不是万能的，但会认真听你说话，也会陪你把事情拆小一点。";
  }

  if (/几点|现在时间|今天几号|日期|星期几/.test(lower)) {
    const now = new Date();
    const time = new Intl.DateTimeFormat("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Shanghai",
    }).format(now);
    const date = new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
      timeZone: "Asia/Shanghai",
    }).format(now);
    return `现在是 ${time}，${date}。${hour >= 22 ? "夜有点深了，记得给自己留一点休息。" : "时间还在，不用一下子把所有事做完。"}`;
  }

  const math = tryMath(value);
  if (math) {
    return `${math}。如果还有下一步，可以继续写给我。`;
  }

  if (/你好|嗨|hi|hello|在吗/.test(lower)) {
    return `我在。${name}，今天也辛苦啦，想聊什么都可以。`;
  }

  if (/睡不着|失眠|熬夜|睡不好/.test(lower)) {
    return "先把屏幕放远一点，做三轮慢呼吸：吸气 4 秒、停 4 秒、呼气 6 秒。别要求自己立刻睡着，只要让身体先安静下来就好。";
  }

  if (/焦虑|紧张|慌|害怕|不安|心跳快/.test(lower)) {
    return "先看一眼周围，找出 3 样你能看到的东西、2 种能听到的声音、1 个能碰到的物体。把注意力拉回现在，再决定下一步。";
  }

  if (/累|困|疲惫|烦|压力|不想动|没力气/.test(lower)) {
    return "那就先不做什么。把肩膀放下来，慢慢呼吸三次。世界不会因为你休息一会儿就停下来的。";
  }

  if (/难过|伤心|想哭|委屈|孤独|寂寞|没人懂/.test(lower)) {
    return "听起来你现在不太好受。先不用急着振作，能把这些说出来已经很不容易了。你想让我陪你安静一会儿，还是帮你理一理发生了什么？";
  }

  if (/生气|愤怒|吵架|讨厌|气死/.test(lower)) {
    return "生气的时候，先别急着回消息。给自己十分钟，把想说的话先写下来，不发送也可以。等身体没那么紧了，再决定要不要回应。";
  }

  if (/报错|错误|bug|debug|不运行|跑不起来|代码问题/.test(lower)) {
    return "先把报错最后一行、你期望发生的结果、实际发生的结果发我。然后按顺序查：最近改了什么、能不能复现、把问题缩到最小、在关键位置打印变量。我们一步一步来。";
  }

  if (/写|笔记|文章|代码|论文|作业|学习|复习|考试/.test(lower)) {
    if (inNotes) {
      return "你已经在笔记页了。先写一句最想留下的话，不用一口气写完。写累了就抬头看看窗外。";
    }
    return "先写一句就好，不用等灵感完整。你可以从「今天最想记住的一件事」开始；如果是学习任务，就先做 10 分钟，再决定要不要继续。";
  }

  if (/动态|心情|开心|高兴/.test(lower)) {
    if (inMoments) {
      return "这里适合放一小块心情。你可以设成好友可见，或者只留给自己；不想被别人看见也没关系。";
    }
    return "开心或不开心的心情，都值得被轻轻放下来。可以写进动态，也可以只告诉我。";
  }

  if (/不知道怎么办|怎么办|迷茫|选择|纠结|决定/.test(lower)) {
    return "先不用把所有答案都想出来。把选项写成两列：现在能做的、暂时不能控制的；再从「能做的」里挑一件最小的事。你也可以告诉我具体在纠结什么。";
  }

  if (/拖延|开始不了|不想开始|没动力|坚持不下去/.test(lower)) {
    return "把任务缩小到「只做 5 分钟」，时间到了就可以停。开始的门槛越低，身体越愿意动起来。你想先做哪一件？";
  }

  if (/计划|安排|复盘|总结|拆解|任务/.test(lower)) {
    return "可以只写三行：今天完成了什么、卡住了什么、明天最小的一步是什么。不用写得很漂亮，能看见下一步就够了。";
  }

  if (/朋友|好友|聊天|陪我|关系|人际/.test(lower)) {
    if (inGuestbook) {
      return "留言板上的每一句话，都会在某个时刻被看见。你也可以先留一句给未来的自己。";
    }
    return "朋友不用很多，能认真听你说话的就很好。如果是在意一段关系，可以先说你观察到的事实，再说你的感受，最后说一个具体的请求。";
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

  if (/茶|喝|咖啡|水/.test(lower)) {
    return "去倒一杯温热的水吧。茶不用太浓，坐着喝两口，也算给今天留了一个停顿。";
  }

  if (/星|月亮|夜|晚上|天空/.test(lower)) {
    return hour >= 18
      ? "今晚的星星很安静。你看它们的时候，它们也在慢慢看你。"
      : "星星白天也在，只是被光藏起来了。就像一些还没说出口的话。";
  }

  if (/[?？]$/.test(value)) {
    return "这个问题我可能答不好。但我可以陪你一起想：你现在最在意的是哪一部分？";
  }

  if (/嗯|哦|好|知道了/.test(lower)) {
    return "我在。想继续说的话，我听着；想安静一会儿，我也可以陪你安静。";
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
  const nameStorageKey = `xingyu:pet-name:${viewerName || "guest"}`;
  const [messages, setMessages] = useState<PetMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [preferredName, setPreferredName] = useState<string | null>(null);
  const callName = preferredName || name;
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let nickname: string | null = null;
    try {
      nickname = window.localStorage.getItem(nameStorageKey);
      if (nickname) setPreferredName(nickname);
    } catch {
      // ignore
    }

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
        text: greeting(nickname || name),
        at: Date.now(),
      },
    ]);
    setLoaded(true);
  }, [name, nameStorageKey, storageKey]);

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

    let response = "";
    let nextName = callName;
    const rename = content.match(
      /(?:以后)?叫我\s*([A-Za-z0-9_\-\u4e00-\u9fa5]{1,12})/,
    );
    const nameIntro = content.match(/我叫\s*([A-Za-z0-9_\-\u4e00-\u9fa5]{1,12})/);

    if (rename || nameIntro) {
      nextName = (rename?.[1] || nameIntro?.[1] || "").trim();
      setPreferredName(nextName);
      try {
        window.localStorage.setItem(nameStorageKey, nextName);
      } catch {
        // ignore
      }
      response = `好，${nextName}。我会记住这个名字。以后你来找我，我就这样叫你。`;
    } else {
      response = reply(content, callName, pathname);
    }

    const delay = 650 + Math.random() * 550;
    replyTimer.current = setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: `pet-${Date.now()}`,
          role: "pet",
          text: response,
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
            <span>陪伴模式 · 在线</span>
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
