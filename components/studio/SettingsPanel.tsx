"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Check,
  Loader2,
  Palette,
  Plus,
  Save,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import { Avatar } from "@/components/Avatar";
import {
  THEME_PRESETS,
  themeStyle,
} from "@/lib/theme";
import type {
  PublicUser,
  SocialLink,
  ThemeConfig,
  ThemePreset,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const ACCENT_SWATCHES = [
  "#e7a9c4",
  "#b9a7ff",
  "#8fd8ff",
  "#7fe3d2",
  "#f0b47a",
  "#f0a6c0",
  "#e8e8ee",
];

export function SettingsPanel({ user }: { user: PublicUser }) {
  const router = useRouter();
  const [tab, setTab] = useState<"profile" | "theme">("profile");

  const [displayName, setDisplayName] = useState(user.displayName);
  const [siteTitle, setSiteTitle] = useState(user.siteTitle);
  const [tagline, setTagline] = useState(user.tagline);
  const [bio, setBio] = useState(user.bio);
  const [now, setNow] = useState(user.now);
  const [location, setLocation] = useState(user.location);
  const [tagsText, setTagsText] = useState(user.tags.join(", "));
  const [avatar, setAvatar] = useState(user.avatar);
  const [socials, setSocials] = useState<SocialLink[]>(
    user.socials.length ? user.socials : [{ label: "GitHub", url: "" }],
  );
  const [theme, setTheme] = useState<ThemeConfig>(user.theme);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordPending, setPasswordPending] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  function updateTheme(patch: Partial<ThemeConfig>) {
    setTheme((current) => ({ ...current, ...patch }));
    setSaved(false);
  }

  function choosePreset(preset: ThemePreset) {
    const meta = THEME_PRESETS.find((item) => item.id === preset);
    updateTheme({ preset, accent: meta?.accent ?? theme.accent });
  }

  function updateSocial(index: number, patch: Partial<SocialLink>) {
    setSocials((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
    setSaved(false);
  }

  async function handleSave() {
    if (saving) return;
    setError("");
    setSaved(false);

    if (!displayName.trim()) {
      setError("昵称不能为空。");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          siteTitle,
          tagline,
          bio,
          now,
          location,
          tags: tagsText,
          avatar,
          socials: socials.filter(
            (social) => social.label.trim() && social.url.trim(),
          ),
          theme,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        setError(data.error || "保存失败，请稍后再试。");
        return;
      }

      setSaved(true);
      router.refresh();
    } catch {
      setError("网络开小差了，请稍后再试。");
    } finally {
      setSaving(false);
    }
  }

  const themeMeta =
    THEME_PRESETS.find((item) => item.id === theme.preset) ?? THEME_PRESETS[0];

  async function handlePasswordChange(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    if (passwordPending) return;

    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword.length < 8) {
      setPasswordError("新密码至少需要 8 个字符。");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("两次输入的新密码不一致。");
      return;
    }

    setPasswordPending(true);
    try {
      const response = await fetch("/api/settings/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        setPasswordError(data.error || "密码没有更新，请稍后再试。");
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess("密码已更新，请记住新的密码。");
    } catch {
      setPasswordError("网络开小差了，请稍后再试。");
    } finally {
      setPasswordPending(false);
    }
  }

  return (
    <div className="studio-page settings-page">
      <header className="studio-page-head">
        <div>
          <span className="section-kicker">SETTINGS / 设置</span>
          <h1>把小岛变成喜欢的样子。</h1>
          <p>资料与主题都会即时应用到你的公开站点。</p>
        </div>
        <div className="head-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <Loader2 size={15} className="spin" />
            ) : saved ? (
              <Check size={15} />
            ) : (
              <Save size={15} />
            )}
            {saving ? "保存中" : saved ? "已保存" : "保存修改"}
          </button>
        </div>
      </header>

      <div className="settings-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "profile"}
          className={tab === "profile" ? "is-active" : ""}
          onClick={() => setTab("profile")}
        >
          <User size={15} />
          个人资料
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "theme"}
          className={tab === "theme" ? "is-active" : ""}
          onClick={() => setTab("theme")}
        >
          <Palette size={15} />
          主题外观
        </button>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="settings-grid">
        <div className="settings-main">
          {tab === "profile" ? (
            <>
              <section className="settings-panel glass">
                <div className="settings-panel-head">
                  <span className="section-kicker">IDENTITY</span>
                  <h2>你是谁</h2>
                  <p>这些文字会出现在首页名片、文章作者栏和「关于」页。</p>
                </div>

                <div className="avatar-editor">
                  <div className="avatar-frame avatar-frame-sm">
                    <span className="avatar-halo" aria-hidden="true" />
                    <Avatar
                      src={avatar}
                      name={displayName || user.displayName}
                      size={72}
                    />
                  </div>
                  <div className="avatar-editor-fields">
                    <div className="field">
                      <label htmlFor="avatar">头像</label>
                      <input
                        id="avatar"
                        className="input"
                        value={avatar}
                        onChange={(event) => setAvatar(event.target.value)}
                        placeholder="/avatar.jpg 或 https://… 或一个 emoji"
                        maxLength={300}
                      />
                      <span className="field-hint">
                        支持图片链接、站内路径，或一个不超过 8 个字符的 emoji。
                      </span>
                    </div>
                  </div>
                </div>

                <div className="field-grid">
                  <div className="field">
                    <label htmlFor="displayName">昵称</label>
                    <input
                      id="displayName"
                      className="input"
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                      maxLength={24}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="siteTitle">站点名</label>
                    <input
                      id="siteTitle"
                      className="input"
                      value={siteTitle}
                      onChange={(event) => setSiteTitle(event.target.value)}
                      placeholder="星屿手记"
                      maxLength={24}
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="tagline">一句话简介</label>
                  <textarea
                    id="tagline"
                    className="textarea"
                    value={tagline}
                    onChange={(event) => setTagline(event.target.value)}
                    rows={2}
                    maxLength={120}
                    placeholder="一句话，让别人记住你。"
                  />
                </div>

                <div className="field-grid">
                  <div className="field">
                    <label htmlFor="location">所在地</label>
                    <input
                      id="location"
                      className="input"
                      value={location}
                      onChange={(event) => setLocation(event.target.value)}
                      maxLength={30}
                      placeholder="江苏"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="tags">兴趣标签</label>
                    <input
                      id="tags"
                      className="input"
                      value={tagsText}
                      onChange={(event) => setTagsText(event.target.value)}
                      maxLength={120}
                      placeholder="日常, Agent, AI, 品茗"
                    />
                    <span className="field-hint">用逗号分隔，最多 8 个</span>
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="bio">关于我</label>
                  <textarea
                    id="bio"
                    className="textarea"
                    value={bio}
                    onChange={(event) => setBio(event.target.value)}
                    rows={5}
                    maxLength={1200}
                    placeholder="写一段自我介绍。空行会被保留为段落。"
                  />
                </div>

                <div className="field">
                  <label htmlFor="now">此刻在做什么</label>
                  <textarea
                    id="now"
                    className="textarea"
                    value={now}
                    onChange={(event) => setNow(event.target.value)}
                    rows={2}
                    maxLength={160}
                    placeholder="最近在忙的事，会显示在首页的 NOW 卡片。"
                  />
                </div>
              </section>

              <section className="settings-panel glass">
                <div className="settings-panel-head">
                  <span className="section-kicker">LINKS</span>
                  <h2>社交链接</h2>
                  <p>最多 6 个。会显示在首页底部和「关于」页。</p>
                </div>

                <div className="social-editor">
                  {socials.map((social, index) => (
                    <div className="social-row" key={index}>
                      <input
                        className="input social-label-input"
                        value={social.label}
                        onChange={(event) =>
                          updateSocial(index, { label: event.target.value })
                        }
                        placeholder="GitHub"
                        maxLength={16}
                        aria-label="链接名称"
                      />
                      <input
                        className="input"
                        value={social.url}
                        onChange={(event) =>
                          updateSocial(index, { url: event.target.value })
                        }
                        placeholder="https://github.com/yourname"
                        maxLength={300}
                        aria-label="链接地址"
                      />
                      <button
                        type="button"
                        className="icon-btn icon-btn-danger"
                        onClick={() =>
                          setSocials((current) =>
                            current.filter((_, itemIndex) => itemIndex !== index),
                          )
                        }
                        aria-label="删除链接"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() =>
                    setSocials((current) =>
                      current.length >= 6
                        ? current
                        : [...current, { label: "", url: "" }],
                    )
                  }
                  disabled={socials.length >= 6}
                >
                  <Plus size={14} />
                  添加链接
                </button>
              </section>

              <section className="settings-panel glass">
                <div className="settings-panel-head">
                  <span className="section-kicker">SECURITY</span>
                  <h2>账号安全</h2>
                  <p>
                    修改密码后，当前登录状态会保留。首次部署时请记得替换演示密码。
                  </p>
                </div>

                <form className="password-form" onSubmit={handlePasswordChange}>
                  <div className="field">
                    <label htmlFor="current-password">当前密码</label>
                    <input
                      id="current-password"
                      type="password"
                      className="input"
                      value={currentPassword}
                      onChange={(event) =>
                        setCurrentPassword(event.target.value)
                      }
                      autoComplete="current-password"
                      placeholder="输入现在的密码"
                      required
                    />
                  </div>

                  <div className="field-grid">
                    <div className="field">
                      <label htmlFor="new-password">新密码</label>
                      <input
                        id="new-password"
                        type="password"
                        className="input"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        autoComplete="new-password"
                        placeholder="至少 8 个字符"
                        minLength={8}
                        required
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="confirm-password">确认新密码</label>
                      <input
                        id="confirm-password"
                        type="password"
                        className="input"
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(event.target.value)
                        }
                        autoComplete="new-password"
                        placeholder="再输入一次"
                        minLength={8}
                        required
                      />
                    </div>
                  </div>

                  {passwordError ? (
                    <p className="form-error">{passwordError}</p>
                  ) : null}
                  {passwordSuccess ? (
                    <p className="form-success">{passwordSuccess}</p>
                  ) : null}

                  <button
                    type="submit"
                    className="btn btn-ghost btn-sm"
                    disabled={passwordPending}
                  >
                    {passwordPending ? (
                      <Loader2 size={14} className="spin" />
                    ) : (
                      <Check size={14} />
                    )}
                    {passwordPending ? "正在更新" : "更新密码"}
                  </button>
                </form>
              </section>
            </>
          ) : (
            <>
              <section className="settings-panel glass">
                <div className="settings-panel-head">
                  <span className="section-kicker">WALLPAPER</span>
                  <h2>底色</h2>
                  <p>六套预设，决定整座岛的空气与光线。</p>
                </div>

                <div className="preset-grid">
                  {THEME_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      className={cn(
                        "preset-option",
                        theme.preset === preset.id && "is-active",
                      )}
                      onClick={() => choosePreset(preset.id)}
                      aria-pressed={theme.preset === preset.id}
                    >
                      <span
                        className="preset-preview"
                        style={{
                          background: `radial-gradient(120% 100% at 20% 0%, ${preset.swatch[1]}aa, transparent 60%), linear-gradient(150deg, ${preset.swatch[0]}, ${preset.swatch[2]}55)`,
                        }}
                      >
                        <span className="preset-star" />
                      </span>
                      <span className="preset-name">{preset.name}</span>
                      <span className="preset-note">{preset.note}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="settings-panel glass">
                <div className="settings-panel-head">
                  <span className="section-kicker">ACCENT</span>
                  <h2>强调色</h2>
                  <p>按钮、链接、星空和选中状态都会使用这个颜色。</p>
                </div>

                <div className="accent-row">
                  {ACCENT_SWATCHES.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={cn(
                        "color-dot",
                        theme.accent.toLowerCase() === color && "is-active",
                      )}
                      style={{ background: color }}
                      onClick={() => updateTheme({ accent: color })}
                      aria-label={`选择颜色 ${color}`}
                    />
                  ))}
                  <label className="color-picker">
                    <Palette size={15} />
                    自定义
                    <input
                      type="color"
                      value={theme.accent}
                      onChange={(event) =>
                        updateTheme({ accent: event.target.value })
                      }
                      aria-label="自定义强调色"
                    />
                  </label>
                </div>
              </section>

              <section className="settings-panel glass">
                <div className="settings-panel-head">
                  <span className="section-kicker">TEXTURE</span>
                  <h2>质感与排版</h2>
                  <p>玻璃的通透度、圆角与标题字体。</p>
                </div>

                <div className="range-field">
                  <label htmlFor="glass">玻璃强度</label>
                  <input
                    id="glass"
                    type="range"
                    min={3}
                    max={16}
                    step={1}
                    value={Math.round(theme.glass * 100)}
                    onChange={(event) =>
                      updateTheme({ glass: Number(event.target.value) / 100 })
                    }
                  />
                  <span>{Math.round(theme.glass * 100)}%</span>
                </div>

                <div className="range-field">
                  <label htmlFor="radius">圆角</label>
                  <input
                    id="radius"
                    type="range"
                    min={12}
                    max={36}
                    step={1}
                    value={theme.radius}
                    onChange={(event) =>
                      updateTheme({ radius: Number(event.target.value) })
                    }
                  />
                  <span>{theme.radius}px</span>
                </div>

                <div className="font-choice">
                  <span>标题字体</span>
                  <div className="segmented">
                    <button
                      type="button"
                      className={theme.font === "serif" ? "is-active" : ""}
                      onClick={() => updateTheme({ font: "serif" })}
                    >
                      衬线 · 文艺
                    </button>
                    <button
                      type="button"
                      className={theme.font === "sans" ? "is-active" : ""}
                      onClick={() => updateTheme({ font: "sans" })}
                    >
                      无衬线 · 简洁
                    </button>
                  </div>
                </div>

                <label className="switch-row">
                  <span>
                    <strong>显示星空</strong>
                    <small>关闭后背景会更干净</small>
                  </span>
                  <input
                    type="checkbox"
                    checked={theme.stars}
                    onChange={(event) =>
                      updateTheme({ stars: event.target.checked })
                    }
                  />
                  <span className="switch-track" aria-hidden="true">
                    <span />
                  </span>
                </label>
              </section>
            </>
          )}

          <div className="settings-save-bar glass">
            <div>
              <strong>满意的样子，就存下来。</strong>
              <span>保存后会立即应用到你的公开站点。</span>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 size={15} className="spin" />
              ) : saved ? (
                <Check size={15} />
              ) : (
                <Save size={15} />
              )}
              {saving ? "保存中" : saved ? "已保存" : "保存修改"}
            </button>
          </div>
        </div>

        <aside className="settings-side">
          <div className="settings-side-sticky">
            <div
              className="theme-preview site"
              data-preset={theme.preset}
              style={themeStyle(theme)}
            >
              <div className="theme-preview-bg" />
              <div className="theme-preview-inner">
                <div className="theme-preview-brand">
                  <span className="brand-mark">
                    <Sparkles size={13} />
                  </span>
                  <span>{siteTitle || "你的小岛"}</span>
                </div>

                <div className="theme-preview-card glass">
                  <div className="theme-preview-profile">
                    <Avatar
                      src={avatar}
                      name={displayName || user.displayName}
                      size={44}
                    />
                    <div>
                      <strong>{displayName || user.displayName}</strong>
                      <span>@{user.handle}</span>
                    </div>
                  </div>
                  <p className="theme-preview-tagline">
                    {tagline || "一句话，让别人记住你。"}
                  </p>
                  <div className="theme-preview-chips">
                    <span>笔记</span>
                    <span>动态</span>
                    <span>{themeMeta.name}</span>
                  </div>
                  <div className="theme-preview-note">
                    <span className="section-kicker">LATEST NOTE</span>
                    <strong>在星夜下写一点什么</strong>
                    <span className="theme-preview-line" />
                    <span className="theme-preview-line short" />
                  </div>
                </div>
              </div>
            </div>

            <p className="settings-side-note">
              预览中的颜色、字体与玻璃质感，和访客看到的完全一致。
              保存后可以打开你的站点确认。
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
