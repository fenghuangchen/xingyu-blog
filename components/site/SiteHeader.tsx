"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { StarMark } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { Site, Viewer } from "@/lib/types";

type HeaderProps = {
  site: Site;
  basePath: string;
  viewer: Viewer | null;
};

export function SiteHeader({ site, basePath, viewer }: HeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const homeHref = basePath || "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const links = [
    { label: "首页", href: homeHref, exact: true },
    { label: "学习笔记", href: `${basePath}/notes`, exact: false },
    { label: "动态", href: `${basePath}/moments`, exact: false },
    { label: "留言", href: `${basePath}/guestbook`, exact: false },
    { label: "关于", href: `${basePath}/about`, exact: false },
    { label: "发现", href: "/explore", exact: false },
  ];

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className={cn("site-header", scrolled && "is-scrolled")}>
      <div className="header-inner">
        <Link href={homeHref} className="brand" aria-label={site.siteTitle}>
          <span className="brand-mark">
            <StarMark size={17} />
          </span>
          <span className="brand-copy">
            <span className="brand-title">{site.siteTitle}</span>
            <span className="brand-sub">@{site.handle} · STAR ISLE</span>
          </span>
        </Link>

        <nav className="site-nav" aria-label="站点导航">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "nav-link",
                isActive(link.href, link.exact) && "is-active",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          {viewer ? (
            <Link href="/studio" className="user-chip">
              <Avatar
                src={viewer.avatar}
                name={viewer.displayName}
                size={28}
                eager
              />
              <span>{viewer.displayName}</span>
              <ArrowUpRight size={14} />
            </Link>
          ) : (
            <>
              <Link href="/login" className="link-quiet">
                登录
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm">
                开始书写
              </Link>
            </>
          )}

          <button
            type="button"
            className="menu-toggle"
            aria-label="打开菜单"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Menu size={19} />
          </button>
        </div>
      </div>

      {open ? (
        <div className="mobile-layer">
          <button
            type="button"
            className="mobile-scrim"
            aria-label="关闭菜单"
            onClick={() => setOpen(false)}
          />
          <div className="mobile-sheet">
            <div className="mobile-sheet-head">
              <span className="brand-mark">
                <StarMark size={17} />
              </span>
              <span className="brand-title">{site.siteTitle}</span>
              <button
                type="button"
                className="icon-btn"
                aria-label="关闭菜单"
                onClick={() => setOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <nav className="mobile-nav" aria-label="移动端导航">
              {links.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "mobile-nav-link",
                    isActive(link.href, link.exact) && "is-active",
                  )}
                >
                  <span className="mobile-nav-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mobile-sheet-actions">
              {viewer ? (
                <Link href="/studio" className="btn btn-primary">
                  进入创作台
                </Link>
              ) : (
                <>
                  <Link href="/login" className="btn btn-ghost">
                    登录
                  </Link>
                  <Link href="/register" className="btn btn-primary">
                    开始书写
                  </Link>
                </>
              )}
            </div>
            <p className="mobile-sheet-note">
              {site.tagline || "在这里，慢慢写下想记住的事。"}
            </p>
          </div>
        </div>
      ) : null}
    </header>
  );
}
