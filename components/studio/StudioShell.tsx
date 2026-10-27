"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { StarMark } from "@/components/icons";
import type { Site, Viewer } from "@/lib/types";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/studio", label: "概览", icon: LayoutDashboard, exact: true },
  { href: "/studio/notes", label: "学习笔记", icon: BookOpen, exact: false },
  { href: "/studio/moments", label: "动态", icon: Sparkles, exact: false },
  {
    href: "/studio/messages",
    label: "留言",
    icon: MessageSquare,
    exact: false,
  },
  { href: "/studio/settings", label: "站点设置", icon: Settings, exact: false },
];

export function StudioShell({
  site,
  viewer,
  publicPath,
  children,
}: {
  site: Site;
  viewer: Viewer;
  publicPath: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="studio-shell">
      {open ? (
        <button
          type="button"
          className="studio-scrim"
          aria-label="关闭菜单"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside className={cn("studio-sidebar glass", open && "is-open")}>
        <div className="studio-sidebar-head">
          <Link href="/studio" className="studio-brand">
            <span className="brand-mark">
              <StarMark size={16} />
            </span>
            <span className="studio-brand-copy">
              <strong>{site.siteTitle}</strong>
              <small>创作台 · STUDIO</small>
            </span>
          </Link>
          <button
            type="button"
            className="icon-btn studio-sidebar-close"
            aria-label="关闭菜单"
            onClick={() => setOpen(false)}
          >
            <X size={17} />
          </button>
        </div>

        <nav className="studio-nav" aria-label="创作台导航">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href ||
                pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn("studio-nav-link", active && "is-active")}
              >
                <Icon size={17} />
                <span>{item.label}</span>
                {active ? <span className="studio-nav-dot" /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="studio-sidebar-foot">
          <Link href="/studio/notes/new" className="btn btn-primary btn-sm">
            <Plus size={15} />
            写新笔记
          </Link>
          <Link href={publicPath} className="studio-side-link">
            <ExternalLink size={15} />
            查看我的站点
          </Link>

          <div className="studio-user">
            <Avatar
              src={viewer.avatar}
              name={viewer.displayName}
              size={36}
            />
            <div>
              <strong>{viewer.displayName}</strong>
              <span>@{viewer.handle}</span>
            </div>
            <button
              type="button"
              className="icon-btn"
              onClick={handleLogout}
              disabled={loggingOut}
              aria-label="退出登录"
              title="退出登录"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      <div className="studio-main">
        <header className="studio-topbar">
          <button
            type="button"
            className="icon-btn studio-menu-btn"
            aria-label="打开菜单"
            onClick={() => setOpen(true)}
          >
            <Menu size={18} />
          </button>
          <span className="studio-topbar-title">{site.siteTitle}</span>
          <div className="studio-topbar-actions">
            <Link href={publicPath} className="topbar-link">
              预览
            </Link>
            <Avatar
              src={viewer.avatar}
              name={viewer.displayName}
              size={28}
            />
          </div>
        </header>

        <div className="studio-content">{children}</div>
      </div>
    </div>
  );
}
