import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StarMark } from "@/components/icons";
import type { Viewer } from "@/lib/types";

export function PlatformHeader({ viewer }: { viewer: Viewer | null }) {
  return (
    <header className="platform-header">
      <Link href="/" className="brand">
        <span className="brand-mark">
          <StarMark size={17} />
        </span>
        <span className="brand-copy">
          <span className="brand-title">星屿手记</span>
          <span className="brand-sub">STAR ISLE · OPEN SOURCE</span>
        </span>
      </Link>

      <nav className="platform-nav">
        <Link href="/">首页</Link>
        <Link href="/explore">发现</Link>
        {viewer ? (
          <Link href="/studio" className="btn btn-primary btn-sm">
            创作台
            <ArrowRight size={14} />
          </Link>
        ) : (
          <>
            <Link href="/login">登录</Link>
            <Link href="/register" className="btn btn-primary btn-sm">
              开始书写
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
