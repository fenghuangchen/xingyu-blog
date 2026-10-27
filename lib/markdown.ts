import hljs from "highlight.js/lib/common";
import { Marked } from "marked";
import sanitizeHtml from "sanitize-html";
import type { RenderedContent, TocItem } from "./types";
import { estimateReadingMinutes } from "./utils";

const marked = new Marked({
  gfm: true,
  breaks: false,
});

marked.use({
  renderer: {
    code(token: { text: string; lang?: string }) {
      const lang = (token.lang || "").trim().split(/\s+/)[0];
      let highlighted = "";

      try {
        highlighted =
          lang && hljs.getLanguage(lang)
            ? hljs.highlight(token.text, {
                language: lang,
                ignoreIllegals: true,
              }).value
            : hljs.highlightAuto(token.text).value;
      } catch {
        highlighted = escapeHtml(token.text);
      }

      const label = escapeHtml(lang || "text");
      return `<figure class="code-shell" data-lang="${label}"><figcaption><span class="code-lang">${label}</span></figcaption><pre><code class="hljs">${highlighted}</code></pre></figure>`;
    },
  } as never,
});

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function decodeEntities(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function stripHtml(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, "")).trim();
}

function slugifyHeading(value: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

  return slug || "section";
}

export function stripMarkdown(source: string): string {
  return source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_`~|]/g, " ")
    .replace(/^\s*[-+]\s+/gm, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function excerptFromMarkdown(source: string, max = 120): string {
  const plain = stripMarkdown(source);
  return plain.length > max ? `${plain.slice(0, max)}…` : plain;
}

export function renderMarkdown(source: string): RenderedContent {
  const raw = marked.parse(source ?? "", { async: false }) as string;

  const toc: TocItem[] = [];
  const used = new Map<string, number>();

  const withIds = raw.replace(
    /<h([23])>([\s\S]*?)<\/h\1>/g,
    (_match, level: string, inner: string) => {
      const plain = stripHtml(inner);
      const base = slugifyHeading(plain);
      const seen = used.get(base) ?? 0;
      used.set(base, seen + 1);
      const id = seen === 0 ? base : `${base}-${seen}`;

      toc.push({
        id,
        text: plain,
        level: level === "2" ? 2 : 3,
      });

      return `<h${level} id="${id}">${inner}</h${level}>`;
    },
  );

  const cleaned = sanitizeHtml(withIds, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "figure",
      "figcaption",
      "img",
      "del",
      "input",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "hr",
      "sup",
      "sub",
      "mark",
    ]),
    allowedAttributes: {
      "*": ["class", "id"],
      a: ["href", "name", "target", "rel", "title"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      input: ["type", "checked", "disabled"],
      code: ["class"],
      pre: ["class"],
      th: ["align"],
      td: ["align"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href || "";
        if (/^https?:/i.test(href)) {
          return {
            tagName,
            attribs: {
              ...attribs,
              target: "_blank",
              rel: "noopener noreferrer",
            },
          };
        }
        return { tagName, attribs };
      },
      img: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, loading: "lazy" },
      }),
    },
  });

  return {
    html: cleaned,
    toc,
    minutes: estimateReadingMinutes(source),
    words: stripMarkdown(source).length,
  };
}
