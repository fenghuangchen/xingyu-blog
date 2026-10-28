"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronLeft,
  Clock,
  Code2,
  Eye,
  ImagePlus,
  Italic,
  Loader2,
  Maximize2,
  Minimize2,
  Save,
  Strikethrough,
  Trash2,
} from "lucide-react";
import { CoverArt } from "@/components/site/CoverArt";
import type { Note, NoteStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  CATEGORY_SUGGESTIONS,
  COVER_OPTIONS,
  estimateReadingMinutes,
  normalizeTags,
} from "@/lib/utils";

const DEFAULT_CONTENT = `## 今天想记下的事

从这里开始写。标题、列表、引用、表格和代码块都支持。

> 写下来，是为了在很久以后，还能认出当时的自己。

- 今天学到了什么？
- 有什么还没想明白？
`;

const CODE_LANGUAGE_BY_EXT: Record<string, string> = {
  py: "python",
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  java: "java",
  c: "c",
  h: "c",
  cpp: "cpp",
  cc: "cpp",
  hpp: "cpp",
  cs: "csharp",
  go: "go",
  rs: "rust",
  rb: "ruby",
  php: "php",
  sql: "sql",
  sh: "bash",
  bash: "bash",
  zsh: "bash",
  json: "json",
  yml: "yaml",
  yaml: "yaml",
  xml: "xml",
  html: "xml",
  vue: "xml",
  svelte: "xml",
  css: "css",
  scss: "scss",
  less: "less",
  lua: "lua",
  r: "r",
  m: "objectivec",
  swift: "swift",
  kt: "kotlin",
  dart: "dart",
  toml: "ini",
  ini: "ini",
  conf: "ini",
  md: "markdown",
  txt: "text",
};

const CODE_EXTENSIONS = Object.keys(CODE_LANGUAGE_BY_EXT);
const CODE_UPLOAD_ACCEPT = CODE_EXTENSIONS.map(
  (extension) => `.${extension}`,
).join(",");
const NEW_DRAFT_KEY = "xingyu:note-draft:new";

type LocalDraft = {
  title: string;
  summary: string;
  content: string;
  category: string;
  tagsText: string;
  cover: string;
  pinned: boolean;
  status: NoteStatus;
  savedAt: number;
};

function languageForFile(name: string): string {
  const extension = name.split(".").pop()?.toLowerCase() ?? "";
  return CODE_LANGUAGE_BY_EXT[extension] ?? "text";
}

function isCodeFile(name: string): boolean {
  const extension = name.split(".").pop()?.toLowerCase() ?? "";
  return CODE_EXTENSIONS.includes(extension);
}

export function NoteEditor({
  initial,
  publicBase,
}: {
  initial: Note | null;
  publicBase: string;
}) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [content, setContent] = useState(initial?.content ?? DEFAULT_CONTENT);
  const [category, setCategory] = useState(initial?.category ?? "");
  const [tagsText, setTagsText] = useState(initial?.tags.join(", ") ?? "");
  const [cover, setCover] = useState(initial?.cover ?? "orbit");
  const [pinned, setPinned] = useState(initial?.pinned ?? false);
  const [status, setStatus] = useState<NoteStatus>(
    initial?.status ?? "draft",
  );

  const [previewHtml, setPreviewHtml] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingCode, setUploadingCode] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [focusMode, setFocusMode] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null);
  const [draftCandidate, setDraftCandidate] = useState<LocalDraft | null>(null);

  const minutes = estimateReadingMinutes(content);
  const chars = content.replace(/\s/g, "").length;
  const deferredContent = useDeferredValue(content);
  const tagCount = normalizeTags(tagsText).length;
  const draftKey = initial ? `xingyu:note-draft:${initial.id}` : NEW_DRAFT_KEY;
  const isDirty = initial
    ? title !== initial.title ||
      summary !== initial.summary ||
      content !== initial.content ||
      category !== initial.category ||
      tagsText !== initial.tags.join(", ") ||
      cover !== initial.cover ||
      pinned !== initial.pinned ||
      status !== initial.status
    : title.trim() !== "" ||
      summary.trim() !== "" ||
      content !== DEFAULT_CONTENT ||
      category.trim() !== "" ||
      tagsText.trim() !== "" ||
      cover !== "orbit" ||
      pinned ||
      status !== "draft";

  const draftTime = draftSavedAt
    ? new Intl.DateTimeFormat("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Shanghai",
      }).format(new Date(draftSavedAt))
    : null;

  useEffect(() => {
    if (!deferredContent.trim()) {
      setPreviewHtml("");
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setPreviewing(true);
      try {
        const response = await fetch("/api/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: deferredContent }),
          signal: controller.signal,
        });
        if (!response.ok) return;
        const data = (await response.json()) as { html?: string };
        if (!cancelled) setPreviewHtml(data.html || "");
      } catch {
        // 请求被取消或网络波动时保持上一次预览
      } finally {
        if (!cancelled) setPreviewing(false);
      }
    }, 500);

    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [deferredContent]);

  useEffect(() => {
    if (!saved) return;
    const timer = window.setTimeout(() => setSaved(false), 2400);
    return () => window.clearTimeout(timer);
  }, [saved]);

  useEffect(() => {
    if (initial) return;

    try {
      const raw = window.localStorage.getItem(NEW_DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as LocalDraft;
      if (
        draft &&
        (draft.title?.trim() ||
          draft.content !== DEFAULT_CONTENT ||
          draft.summary?.trim())
      ) {
        setDraftCandidate(draft);
      }
    } catch {
      // 本地草稿损坏时直接忽略，不影响正常写作
    }
  }, [initial]);

  useEffect(() => {
    if (!isDirty) return;

    const timer = window.setTimeout(() => {
      const draft: LocalDraft = {
        title,
        summary,
        content,
        category,
        tagsText,
        cover,
        pinned,
        status,
        savedAt: Date.now(),
      };

      try {
        window.localStorage.setItem(draftKey, JSON.stringify(draft));
        setDraftSavedAt(draft.savedAt);
      } catch {
        // 浏览器禁用本地存储时静默降级
      }
    }, 900);

    return () => window.clearTimeout(timer);
  }, [
    isDirty,
    draftKey,
    title,
    summary,
    content,
    category,
    tagsText,
    cover,
    pinned,
    status,
  ]);

  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!focusMode) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFocusMode(false);
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [focusMode]);

  function restoreDraft() {
    if (!draftCandidate) return;

    setTitle(draftCandidate.title);
    setSummary(draftCandidate.summary);
    setContent(draftCandidate.content);
    setCategory(draftCandidate.category);
    setTagsText(draftCandidate.tagsText);
    setCover(draftCandidate.cover);
    setPinned(draftCandidate.pinned);
    setStatus(draftCandidate.status);
    setDraftCandidate(null);
    setSaved(false);
  }

  function discardDraft() {
    try {
      window.localStorage.removeItem(NEW_DRAFT_KEY);
    } catch {
      // ignore
    }
    setDraftCandidate(null);
  }

  function insertSnippet(before: string, after = "", placeholder = "文字") {
    const element = textareaRef.current;
    const start = element?.selectionStart ?? content.length;
    const end = element?.selectionEnd ?? content.length;
    const selected = content.slice(start, end) || placeholder;
    const next =
      content.slice(0, start) + before + selected + after + content.slice(end);

    setContent(next);
    window.requestAnimationFrame(() => {
      if (!element) return;
      element.focus();
      element.selectionStart = start + before.length;
      element.selectionEnd = start + before.length + selected.length;
    });
  }

  function insertRaw(text: string) {
    const element = textareaRef.current;
    const start = element?.selectionStart ?? content.length;
    const end = element?.selectionEnd ?? content.length;
    const next = content.slice(0, start) + text + content.slice(end);

    setContent(next);
    window.requestAnimationFrame(() => {
      if (!element) return;
      const position = start + text.length;
      element.focus();
      element.selectionStart = position;
      element.selectionEnd = position;
    });
  }

  async function uploadImage(file: File) {
    if (uploadingImage) return;
    setError("");
    setUploadingImage(true);

    try {
      const form = new FormData();
      form.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });
      const data = (await response.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };

      if (!response.ok || !data.url) {
        setError(data.error || "图片上传失败，请稍后再试。");
        return;
      }

      insertRaw(`![图片](${data.url})`);
    } catch {
      setError("图片上传失败，请稍后再试。");
    } finally {
      setUploadingImage(false);
    }
  }

  async function uploadCode(file: File) {
    if (uploadingCode) return;
    setError("");

    if (file.size > 300 * 1024) {
      setError("代码文件不能超过 300KB。");
      return;
    }

    setUploadingCode(true);
    try {
      const code = await file.text();

      if (!code.trim()) {
        setError("这个代码文件是空的。");
        return;
      }

      if (code.length > 120000) {
        setError("代码太长了，请控制在 12 万字符以内。");
        return;
      }

      const language = languageForFile(file.name);
      const backtickRuns = code.match(/`+/g) ?? [];
      const longestRun = backtickRuns.reduce(
        (longest, run) => Math.max(longest, run.length),
        0,
      );
      const fence = "`".repeat(Math.max(3, longestRun + 1));

      insertRaw(
        `\n${fence}${language}\n${code.replace(/\s+$/g, "")}\n${fence}\n\n`,
      );
    } catch {
      setError("代码文件读取失败，请换成 UTF-8 文本再试。");
    } finally {
      setUploadingCode(false);
    }
  }

  async function handleSave() {
    if (saving) return;
    setError("");

    if (!title.trim()) {
      setError("先给这篇笔记一个标题。");
      return;
    }

    if (status === "published" && !content.trim()) {
      setError("发布的笔记需要一些正文。");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title,
        summary,
        content,
        category,
        tags: normalizeTags(tagsText),
        cover,
        pinned,
        status,
      };

      const response = await fetch(
        initial ? `/api/notes/${initial.id}` : "/api/notes",
        {
          method: initial ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        note?: Note;
      };

      if (!response.ok) {
        setError(data.error || "保存失败，请稍后再试。");
        return;
      }

      try {
        window.localStorage.removeItem(draftKey);
      } catch {
        // ignore
      }
      setDraftSavedAt(null);
      setDraftCandidate(null);

      if (!initial && data.note?.id) {
        router.replace(`/studio/notes/${data.note.id}`);
        router.refresh();
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

  async function handleDelete() {
    if (!initial || deleting) return;
    if (!window.confirm("删除后无法恢复，确定删除这篇笔记吗？")) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/notes/${initial.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        router.push("/studio/notes");
        router.refresh();
      }
    } finally {
      setDeleting(false);
    }
  }

  const previewHref =
    initial && status === "published"
      ? `${publicBase}/notes/${initial.slug}`
      : null;

  return (
    <div className={cn("studio-page editor-page", focusMode && "is-focus")}>
      <div className="editor-topbar">
        <Link href="/studio/notes" className="editor-back">
          <ChevronLeft size={16} />
          返回笔记
        </Link>

        <div className="editor-topbar-center">
          <div className="segmented" role="group" aria-label="笔记状态">
            <button
              type="button"
              className={status === "draft" ? "is-active" : ""}
              onClick={() => setStatus("draft")}
            >
              草稿
            </button>
            <button
              type="button"
              className={status === "published" ? "is-active" : ""}
              onClick={() => setStatus("published")}
            >
              发布
            </button>
          </div>
          <span
            className={cn(
              "editor-save-state",
              isDirty && !saved && "is-dirty",
            )}
          >
            {saving ? (
              "保存中…"
            ) : !isDirty && (saved || initial) ? (
              <>
                <Check size={13} /> 已保存
              </>
            ) : draftTime ? (
              `本地草稿 ${draftTime}`
            ) : initial ? (
              "未保存"
            ) : (
              "新笔记"
            )}
          </span>
        </div>

        <div className="editor-topbar-actions">
          <button
            type="button"
            className="btn btn-ghost btn-sm editor-focus-btn"
            onClick={() => setFocusMode((value) => !value)}
            title={focusMode ? "退出专注模式" : "专注写作"}
            aria-pressed={focusMode}
          >
            {focusMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            <span>{focusMode ? "退出专注" : "专注"}</span>
          </button>
          {previewHref ? (
            <Link
              href={previewHref}
              className="btn btn-ghost btn-sm editor-preview-link"
            >
              <Eye size={14} />
              查看
            </Link>
          ) : null}
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <Loader2 size={14} className="spin" />
            ) : (
              <Save size={14} />
            )}
            {saving
              ? "保存中"
              : status === "published"
                ? "发布笔记"
                : "保存草稿"}
          </button>
        </div>
      </div>

      {error ? <p className="form-error editor-error">{error}</p> : null}

      {draftCandidate ? (
        <div className="editor-draft-banner glass">
          <div>
            <strong>发现上次没保存的草稿</strong>
            <span>
              本地保存于{" "}
              {new Intl.DateTimeFormat("zh-CN", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Asia/Shanghai",
              }).format(new Date(draftCandidate.savedAt))}
              ，要恢复吗？
            </span>
          </div>
          <div className="editor-draft-actions">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={restoreDraft}
            >
              恢复草稿
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={discardDraft}
            >
              忽略
            </button>
          </div>
        </div>
      ) : null}

      <div className="editor-grid">
        <div className="editor-main glass">
          <div className="editor-head-fields">
            <span className="editor-kicker">
              WRITING DESK ·{" "}
              {status === "published" ? "PUBLIC NOTE" : "PRIVATE DRAFT"}
            </span>
            <input
              className="editor-title-input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="给这篇笔记一个标题"
              maxLength={120}
              aria-label="笔记标题"
            />
            <input
              className="editor-summary-input"
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              placeholder="用一句话介绍这篇笔记（留空会自动截取正文）"
              maxLength={200}
              aria-label="笔记摘要"
            />
          </div>

          <div className="editor-toolbar">
            <div className="editor-tabs">
              <button
                type="button"
                className={tab === "write" ? "is-active" : ""}
                onClick={() => setTab("write")}
              >
                写作
              </button>
              <button
                type="button"
                className={tab === "preview" ? "is-active" : ""}
                onClick={() => setTab("preview")}
              >
                预览
              </button>
            </div>

            <div className="editor-tools" aria-label="插入 Markdown">
              <button
                type="button"
                onClick={() => insertSnippet("## ", "", "小标题")}
                title="二级标题"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => insertSnippet("**", "**", "加粗文字")}
                title="加粗（Ctrl/Cmd + B）"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => insertSnippet("_", "_", "斜体文字")}
                title="斜体（Ctrl/Cmd + I）"
              >
                <Italic size={14} />
              </button>
              <button
                type="button"
                onClick={() => insertSnippet("~~", "~~", "删除线文字")}
                title="删除线"
              >
                <Strikethrough size={14} />
              </button>
              <button
                type="button"
                onClick={() => insertSnippet("> ", "", "引用")}
                title="引用"
              >
                “
              </button>

              <span className="editor-tool-divider" aria-hidden="true" />

              <button
                type="button"
                onClick={() => insertSnippet("- ", "", "列表项")}
                title="无序列表"
              >
                •
              </button>
              <button
                type="button"
                onClick={() =>
                  insertRaw("\n- [ ] 待办事项\n- [ ] 待办事项\n\n")
                }
                title="任务清单"
              >
                ☑
              </button>
              <button
                type="button"
                onClick={() =>
                  insertSnippet("[", "](https://)", "链接文字")
                }
                title="链接（Ctrl/Cmd + K）"
              >
                ↗
              </button>
              <button
                type="button"
                onClick={() => insertSnippet("`", "`", "行内代码")}
                title="行内代码"
              >
                `
              </button>

              <span className="editor-tool-divider" aria-hidden="true" />

              <button
                type="button"
                onClick={() => insertRaw("\n---\n\n")}
                title="分隔线"
              >
                —
              </button>
              <button
                type="button"
                onClick={() =>
                  insertRaw(
                    "\n| 标题 | 标题 |\n| --- | --- |\n| 内容 | 内容 |\n\n",
                  )
                }
                title="插入表格"
              >
                ▦
              </button>
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                title="上传图片"
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <Loader2 size={14} className="spin" />
                ) : (
                  <ImagePlus size={14} />
                )}
              </button>
              <button
                type="button"
                onClick={() => codeInputRef.current?.click()}
                title="上传代码文件，自动识别语言并高亮"
                disabled={uploadingCode}
              >
                {uploadingCode ? (
                  <Loader2 size={14} className="spin" />
                ) : (
                  <Code2 size={14} />
                )}
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) void uploadImage(file);
                }}
              />
              <input
                ref={codeInputRef}
                type="file"
                accept={CODE_UPLOAD_ACCEPT}
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) void uploadCode(file);
                }}
              />
            </div>

            <span className="editor-toolbar-note">Ctrl+S 保存</span>
          </div>

          <div className="editor-panes" data-tab={tab}>
            <textarea
              ref={textareaRef}
              className="editor-textarea"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              onKeyDown={(event) => {
                if (!(event.metaKey || event.ctrlKey)) return;

                const key = event.key.toLowerCase();
                if (key === "b") {
                  event.preventDefault();
                  insertSnippet("**", "**", "加粗文字");
                } else if (key === "i") {
                  event.preventDefault();
                  insertSnippet("_", "_", "斜体文字");
                } else if (key === "k") {
                  event.preventDefault();
                  insertSnippet("[", "](https://)", "链接文字");
                } else if (key === "s") {
                  event.preventDefault();
                  void handleSave();
                } else if (key === "enter") {
                  event.preventDefault();
                  void handleSave();
                }
              }}
              onPaste={(event) => {
                const file = Array.from(event.clipboardData.files).find((item) =>
                  item.type.startsWith("image/"),
                );
                if (file) {
                  event.preventDefault();
                  void uploadImage(file);
                }
              }}
              onDragOver={(event) => {
                if (event.dataTransfer.types.includes("Files")) {
                  event.preventDefault();
                }
              }}
              onDrop={(event) => {
                const file = event.dataTransfer.files?.[0];
                if (!file) return;

                event.preventDefault();
                if (file.type.startsWith("image/")) {
                  void uploadImage(file);
                } else if (isCodeFile(file.name)) {
                  void uploadCode(file);
                }
              }}
              placeholder="从这里开始写……"
              spellCheck={false}
              aria-label="Markdown 正文"
            />

            <div className="editor-preview-pane">
              <div className="editor-preview-label">
                {previewing ? "正在渲染预览…" : "实时预览"}
              </div>
              {previewHtml ? (
                <div
                  className="prose editor-prose"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              ) : (
                <div className="editor-preview-empty">
                  在左边写下一点什么，预览会出现在这里。
                </div>
              )}
            </div>
          </div>

          <div className="editor-foot">
            <span>{chars} 字</span>
            <span className="meta-dot" />
            <span>
              <Clock size={13} />约 {minutes} 分钟
            </span>
            <span className="meta-dot" />
            <span>{status === "published" ? "发布后公开可见" : "仅自己可见"}</span>
          </div>
        </div>

        <aside className="editor-side">
          <div className="editor-side-card glass editor-stats-card">
            <span className="editor-side-title">这篇笔记</span>
            <div className="editor-stats">
              <div>
                <strong>{chars}</strong>
                <span>字</span>
              </div>
              <div>
                <strong>{minutes}</strong>
                <span>分钟</span>
              </div>
              <div>
                <strong>{tagCount}</strong>
                <span>标签</span>
              </div>
            </div>
            <span className="editor-stat-status">
              {status === "published" ? "公开笔记" : "仅自己可见"}
            </span>
          </div>

          <div className="editor-side-card glass">
            <span className="editor-side-title">封面</span>
            <div className="cover-picker">
              {COVER_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`cover-option${cover === option.id ? " is-active" : ""}`}
                  onClick={() => setCover(option.id)}
                  title={option.name}
                  aria-pressed={cover === option.id}
                >
                  <CoverArt cover={option.id} />
                  <span>{option.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="editor-side-card glass">
            <span className="editor-side-title">归类</span>

            <div className="field">
              <label htmlFor="note-category">分类</label>
              <input
                id="note-category"
                className="input"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="AI / 阅读 / 茶事…"
                list="category-options"
                maxLength={24}
              />
              <datalist id="category-options">
                {CATEGORY_SUGGESTIONS.map((item) => (
                  <option value={item} key={item} />
                ))}
              </datalist>
            </div>

            <div className="field">
              <label htmlFor="note-tags">标签</label>
              <input
                id="note-tags"
                className="input"
                value={tagsText}
                onChange={(event) => setTagsText(event.target.value)}
                placeholder="Agent, 记忆, RAG"
                maxLength={120}
              />
              <span className="field-hint">用逗号分隔，最多 6 个</span>
            </div>

            <label className="switch-row">
              <span>
                <strong>置顶这篇</strong>
                <small>会优先出现在首页与笔记列表</small>
              </span>
              <input
                type="checkbox"
                checked={pinned}
                onChange={(event) => setPinned(event.target.checked)}
              />
              <span className="switch-track" aria-hidden="true">
                <span />
              </span>
            </label>
          </div>

          <div className="editor-side-card glass editor-tips">
            <span className="editor-side-title">写作提示</span>
            <ul>
              <li>用 ## 分节，文章会自动生成目录。</li>
              <li>代码块支持高亮：三个反引号加语言名。</li>
              <li>点工具栏的 &lt;/&gt; 上传 .py / .ts 等代码文件，会自动识别语言。</li>
              <li>也可以把图片或代码文件直接拖进编辑区。</li>
              <li>Ctrl / Cmd + B / I / K 快捷插入，Ctrl / Cmd + S 保存。</li>
              <li>按 Esc 可以退出专注模式。</li>
              <li>摘要留空时，会从正文自动截取。</li>
              <li>保存草稿不会出现在公开站点。</li>
            </ul>
          </div>

          {initial ? (
            <button
              type="button"
              className="btn btn-danger btn-sm editor-delete"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 size={14} className="spin" />
              ) : (
                <Trash2 size={14} />
              )}
              删除这篇笔记
            </button>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
