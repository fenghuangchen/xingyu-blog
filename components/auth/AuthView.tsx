"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Loader2,
  Palette,
  Sparkles,
  Users,
} from "lucide-react";
import { Backdrop } from "@/components/site/Backdrop";
import { StarMark } from "@/components/icons";
import { DEFAULT_THEME, themeStyle } from "@/lib/theme";

export function AuthView({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const isLogin = mode === "login";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    setPending(true);
    setError("");

    try {
      const response = await fetch(
        isLogin ? "/api/auth/login" : "/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isLogin
              ? { identifier, password }
              : { displayName, handle, password },
          ),
        },
      );

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        setError(data.error || "操作没有完成，请稍后再试。");
        return;
      }

      router.push("/studio");
      router.refresh();
    } catch {
      setError("网络开小差了，请稍后再试。");
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      className="site auth-page"
      data-preset={DEFAULT_THEME.preset}
      style={themeStyle(DEFAULT_THEME)}
    >
      <Backdrop stars />

      <div className="auth-shell">
        <section className="auth-intro">
          <Link href="/" className="auth-brand">
            <span className="brand-mark">
              <StarMark size={18} />
            </span>
            <span>星屿手记</span>
          </Link>

          <p className="auth-kicker">A SMALL ISLAND FOR YOUR THOUGHTS</p>
          <h1>
            把日子写成页，
            <br />
            把喜欢的事留在岛上。
          </h1>
          <p className="auth-sub">
            学习笔记、动态、留言，还有一块只属于你的小空间。
            注册之后，你会拥有自己的主题、自己的文字，和一座自己的岛。
          </p>

          <ul className="auth-points">
            <li>
              <BookOpen size={16} />
              Markdown 学习笔记，专为长文阅读设计
            </li>
            <li>
              <Palette size={16} />
              主题、配色、字体，都可以慢慢调成喜欢的样子
            </li>
            <li>
              <Users size={16} />
              留言与动态，让朋友也能参与你的记录
            </li>
          </ul>

          <p className="auth-foot">
            <Sparkles size={13} />
            星屿手记 · 开源个人博客 · 数据留在自己的服务器
          </p>
        </section>

        <section className="auth-card glass">
          <div className="auth-tabs" role="tablist" aria-label="切换登录或注册">
            <Link
              href="/login"
              className={isLogin ? "is-active" : ""}
              role="tab"
              aria-selected={isLogin}
            >
              登录
            </Link>
            <Link
              href="/register"
              className={!isLogin ? "is-active" : ""}
              role="tab"
              aria-selected={!isLogin}
            >
              注册
            </Link>
          </div>

          <h2>{isLogin ? "欢迎回到岛上" : "创建你的小岛"}</h2>
          <p className="auth-hint">
            {isLogin
              ? "用用户名和密码继续你的记录。"
              : "注册后自动登录，并拥有一个 /u/你的名字 的站点。"}
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin ? (
              <>
                <div className="field">
                  <label htmlFor="displayName">昵称</label>
                  <input
                    id="displayName"
                    className="input"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    placeholder="朋友怎么称呼你？"
                    maxLength={24}
                    autoComplete="nickname"
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="handle">用户名</label>
                  <div className="input-prefix">
                    <span>@</span>
                    <input
                      id="handle"
                      className="input"
                      value={handle}
                      onChange={(event) =>
                        setHandle(
                          event.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, ""),
                        )
                      }
                      placeholder="qicha"
                      maxLength={20}
                      autoComplete="username"
                      required
                    />
                  </div>
                  <span className="field-hint">
                    小写字母、数字或短横线，3–20 位。你的站点地址会像
                    /u/{handle || "yourname"}
                  </span>
                </div>
              </>
            ) : (
              <div className="field">
                <label htmlFor="identifier">用户名或昵称</label>
                <input
                  id="identifier"
                  className="input"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder="祁茶 或 qicha"
                  autoComplete="username"
                  required
                />
              </div>
            )}

            <div className="field">
              <label htmlFor="password">密码</label>
              <input
                id="password"
                type="password"
                className="input"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={isLogin ? "输入密码" : "至少 8 个字符"}
                autoComplete={isLogin ? "current-password" : "new-password"}
                minLength={isLogin ? undefined : 8}
                required
              />
            </div>

            {isLogin ? (
              <div className="auth-forgot-row">
                <Link href="/forgot">忘记密码？</Link>
              </div>
            ) : null}

            {error ? <p className="form-error">{error}</p> : null}

            <button
              type="submit"
              className="btn btn-primary btn-block auth-submit"
              disabled={pending}
            >
              {pending ? (
                <Loader2 size={16} className="spin" />
              ) : (
                <ArrowRight size={16} />
              )}
              {pending
                ? "请稍候"
                : isLogin
                  ? "登录，回到岛上"
                  : "注册，开始书写"}
            </button>
          </form>

          <p className="auth-switch">
            {isLogin ? "还没有账号？" : "已经有账号了？"}
            <Link href={isLogin ? "/register" : "/login"}>
              {isLogin ? "创建一座小岛" : "直接登录"}
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
