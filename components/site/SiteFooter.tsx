import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { GithubIcon, StarMark } from "@/components/icons";
import type { Site } from "@/lib/types";

export function SiteFooter({
  site,
  basePath,
}: {
  site: Site;
  basePath: string;
}) {
  const year = new Date().getFullYear();
  const homeHref = basePath || "/";

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="brand-mark brand-mark-lg">
            <StarMark size={20} />
          </span>
          <p className="footer-title">{site.siteTitle}</p>
          <p className="footer-note">
            {site.tagline || "一座记录学习、生活与想法的小岛。"}
          </p>
          <a
            className="footer-github"
            href={
              site.socials.find((item) =>
                item.label.toLowerCase().includes("git"),
              )?.url || "https://github.com/fenghuangchen"
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            <GithubIcon size={16} />
            <span>在 GitHub 上</span>
            <ArrowUpRight size={14} />
          </a>
        </div>

        <div className="footer-cols">
          <div className="footer-col">
            <span className="footer-label">浏览</span>
            <Link href={homeHref}>首页</Link>
            <Link href={`${basePath}/notes`}>学习笔记</Link>
            <Link href={`${basePath}/moments`}>动态</Link>
            <Link href={`${basePath}/guestbook`}>留言板</Link>
          </div>
          <div className="footer-col">
            <span className="footer-label">连接</span>
            {site.socials.length ? (
              site.socials.slice(0, 4).map((social) => (
                <a
                  key={`${social.label}-${social.url}`}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.label}
                </a>
              ))
            ) : (
              <span className="footer-muted">还没有添加链接</span>
            )}
            <Link href="/explore">发现其他小岛</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>
          © {year} {site.displayName} · 保留所有温柔
        </span>
        <span className="footer-meta">
          星屿手记 · 开源项目 · 由 Next.js 驱动
        </span>
      </div>
    </footer>
  );
}
