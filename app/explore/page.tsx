import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { Backdrop } from "@/components/site/Backdrop";
import { PlatformHeader } from "@/components/site/PlatformHeader";
import { getViewer } from "@/lib/auth";
import { listCreators } from "@/lib/db";
import { DEFAULT_THEME, presetMeta, themeStyle } from "@/lib/theme";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "发现小岛",
  description: "在星屿手记上，认识其他认真记录的人。",
};

export default async function ExplorePage() {
  const viewer = await getViewer();
  const creators = listCreators();

  return (
    <div
      className="site platform-page"
      data-preset={DEFAULT_THEME.preset}
      style={themeStyle(DEFAULT_THEME)}
    >
      <Backdrop stars />
      <PlatformHeader viewer={viewer} />

      <main className="platform-main">
        <section className="page-hero">
          <span className="section-kicker">DISCOVER / 发现</span>
          <h1 className="page-title">岛上的其他居民。</h1>
          <p className="page-subtitle">
            每个人都可以注册、拥有自己的站点、写下自己的字。
            这里是一个一直在生长的列表。
          </p>
        </section>

        <div className="creator-grid">
          {creators.map((creator) => {
            const meta = presetMeta(creator.theme.preset);
            return (
              <Link
                key={creator.id}
                href={`/u/${creator.handle}`}
                className="creator-card glass"
                style={
                  {
                    "--accent": creator.theme.accent,
                  } as React.CSSProperties
                }
              >
                <div className="creator-top">
                  <Avatar
                    src={creator.avatar}
                    name={creator.displayName}
                    size={64}
                  />
                  <span className="creator-theme" title={meta.name}>
                    {meta.name}
                  </span>
                </div>

                <h2>{creator.displayName}</h2>
                <p className="creator-handle">@{creator.handle}</p>
                <p className="creator-tagline">
                  {creator.tagline || "一个安静记录的人。"}
                </p>

                <div className="creator-stats">
                  <span>
                    <strong>{creator.stats.notes}</strong> 笔记
                  </span>
                  <span>
                    <strong>{creator.stats.moments}</strong> 动态
                  </span>
                  <span>
                    <strong>{creator.stats.messages}</strong> 留言
                  </span>
                </div>

                <span className="creator-link">
                  去岛上看看
                  <ArrowUpRight size={15} />
                </span>
              </Link>
            );
          })}

          <Link href="/register" className="creator-card creator-card-join glass">
            <span className="join-mark">+</span>
            <h2>成为下一个岛主</h2>
            <p className="creator-tagline">
              注册一个账号，你会得到自己的笔记、动态、留言板和一套可自定义的主题。
            </p>
            <span className="creator-link">
              创建我的小岛
              <ArrowRight size={15} />
            </span>
          </Link>

          <div className="creator-card creator-card-info glass">
            <span className="creator-theme">ABOUT</span>
            <h2>一座岛，四种记录方式。</h2>
            <ul className="creator-features">
              <li>
                <strong>学习笔记</strong>：Markdown、目录、代码高亮
              </li>
              <li>
                <strong>动态</strong>：短句、心情与生活碎片
              </li>
              <li>
                <strong>留言板</strong>：朋友不注册也能留言
              </li>
              <li>
                <strong>主题</strong>：配色、壁纸、字体都能换
              </li>
            </ul>
            <span className="creator-link">
              开源 · 数据留在自己的服务器
            </span>
          </div>
        </div>

        <p className="explore-footnote">
          目前有 {creators.length} 座小岛在星屿手记上亮着灯。
        </p>
      </main>

      <footer className="platform-footer">
        <span>星屿手记 · 开源个人博客</span>
        <Link href="/">回到主岛</Link>
      </footer>
    </div>
  );
}
