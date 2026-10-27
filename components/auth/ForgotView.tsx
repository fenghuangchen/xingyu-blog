"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, ShieldQuestion } from "lucide-react";
import { Backdrop } from "@/components/site/Backdrop";
import { StarMark } from "@/components/icons";
import { DEFAULT_THEME, themeStyle } from "@/lib/theme";

type Step = "find" | "reset" | "done";

export function ForgotView() {
  const [step, setStep] = useState<Step>("find");
  const [identifier, setIdentifier] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function findQuestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/auth/recovery/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        question?: string;
        error?: string;
      };

      if (!response.ok) {
        setError(data.error || "没有找到这个账号。");
        return;
      }

      if (!data.question) {
        setError("没有找到这个账号，或该账号还没有设置密保问题。");
        return;
      }

      setQuestion(data.question);
      setStep("reset");
    } catch {
      setError("网络开小差了，请稍后再试。");
    } finally {
      setPending(false);
    }
  }

  async function resetPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    setError("");

    if (newPassword.length < 8) {
      setError("新密码至少需要 8 个字符。");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("两次输入的新密码不一致。");
      return;
    }

    setPending(true);
    try {
      const response = await fetch("/api/auth/recovery/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, answer, newPassword }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        setError(data.error || "密码没有重置，请稍后再试。");
        return;
      }

      setStep("done");
    } catch {
      setError("网络开小差了，请稍后再试。");
    } finally {
      setPending(false);
    }
  }

  function backToFind() {
    setStep("find");
    setQuestion("");
    setAnswer("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  }

  return (
    <div
      className="site auth-page"
      data-preset={DEFAULT_THEME.preset}
      style={themeStyle(DEFAULT_THEME)}
    >
      <Backdrop stars />

      <div className="auth-shell auth-shell-recovery">
        <section className="auth-intro">
          <Link href="/" className="auth-brand">
            <span className="brand-mark">
              <StarMark size={18} />
            </span>
            <span>星屿手记</span>
          </Link>

          <p className="auth-kicker">RECOVERY / 找回密码</p>
          <h1>
            忘记密码，
            <br />
            也能回到岛上。
          </h1>
          <p className="auth-sub">
            没有绑定微信、QQ 或邮箱，也可以回来。
            用注册后设置的密保问题验证身份，答案只保存哈希，站长也看不到。
          </p>

          <div className="recovery-note">
            <ShieldQuestion size={17} />
            <div>
              <strong>第一次使用？</strong>
              <p>
                先登录，在「站点设置 → 账号安全」里设置密保问题，
                以后忘记密码时就能自助找回。
              </p>
            </div>
          </div>

          <p className="auth-foot">星屿手记 · 开源个人博客 · 数据留在自己的服务器</p>
        </section>

        <section className="auth-card glass">
          {step === "done" ? (
            <div className="recovery-done">
              <span className="recovery-done-mark">✓</span>
              <h2>密码已经重置。</h2>
              <p>请用新密码重新登录。原来的登录会话已经失效。</p>
              <Link href="/login" className="btn btn-primary btn-block">
                去登录
                <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            <>
              <div className="recovery-head">
                <span className="section-kicker">STEP {step === "find" ? "01" : "02"}</span>
                <h2>{step === "find" ? "找回你的小岛" : "回答密保问题"}</h2>
                <p>
                  {step === "find"
                    ? "输入用户名，我们不会透露账号是否存在。"
                    : "答对问题后，设置一个新密码即可。"}
                </p>
              </div>

              {step === "find" ? (
                <form className="auth-form" onSubmit={findQuestion}>
                  <div className="field">
                    <label htmlFor="recovery-identifier">用户名或昵称</label>
                    <input
                      id="recovery-identifier"
                      className="input"
                      value={identifier}
                      onChange={(event) => setIdentifier(event.target.value)}
                      placeholder="祁茶 或 qicha"
                      autoComplete="username"
                      required
                    />
                    <span className="field-hint">
                      昵称和登录用户名都可以。
                    </span>
                  </div>

                  {error ? <p className="form-error">{error}</p> : null}

                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={pending}
                  >
                    {pending ? (
                      <Loader2 size={15} className="spin" />
                    ) : (
                      <ArrowRight size={15} />
                    )}
                    {pending ? "正在查找" : "下一步"}
                  </button>
                </form>
              ) : (
                <form className="auth-form" onSubmit={resetPassword}>
                  <div className="recovery-question">
                    <span>密保问题</span>
                    <strong>{question}</strong>
                  </div>

                  <div className="field">
                    <label htmlFor="recovery-answer">答案</label>
                    <input
                      id="recovery-answer"
                      className="input"
                      value={answer}
                      onChange={(event) => setAnswer(event.target.value)}
                      autoComplete="off"
                      required
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="recovery-password">新密码</label>
                    <input
                      id="recovery-password"
                      type="password"
                      className="input"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      placeholder="至少 8 个字符"
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="recovery-confirm">确认新密码</label>
                    <input
                      id="recovery-confirm"
                      type="password"
                      className="input"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      placeholder="再输入一次"
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />
                  </div>

                  {error ? <p className="form-error">{error}</p> : null}

                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={pending}
                  >
                    {pending ? (
                      <Loader2 size={15} className="spin" />
                    ) : (
                      <ArrowRight size={15} />
                    )}
                    {pending ? "正在重置" : "重置密码"}
                  </button>

                  <button
                    type="button"
                    className="recovery-back"
                    onClick={backToFind}
                  >
                    <ArrowLeft size={14} />
                    换一个用户名
                  </button>
                </form>
              )}

              <p className="auth-switch">
                想起密码了？
                <Link href="/login">回到登录</Link>
              </p>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
