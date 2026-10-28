import type { Metadata, Viewport } from "next";
import { InteractionEffects } from "@/components/site/InteractionEffects";
import "./globals.css";
import "./styles/site.css";
import "./styles/reading.css";
import "./styles/platform.css";
import "./styles/studio.css";
import "./styles/responsive.css";

const siteUrl = process.env.SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "星屿手记 · 把日子写成页",
    template: "%s · 星屿手记",
  },
  description:
    "星屿手记是祁茶的小岛：记录 Agent、AI、代码、阅读与茶事的学习笔记，也收藏一些没有被写成文章的碎片。",
  applicationName: "星屿手记",
  authors: [{ name: "祁茶" }],
  creator: "祁茶",
  keywords: ["个人博客", "学习笔记", "Agent", "AI", "茶", "星屿手记"],
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "星屿手记",
    title: "星屿手记 · 把日子写成页",
    description: "一座记录学习、生活与想法的小岛。",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "星屿手记首页",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "星屿手记 · 把日子写成页",
    description: "一座记录学习、生活与想法的小岛。",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#070811",
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <InteractionEffects />
      </body>
    </html>
  );
}
