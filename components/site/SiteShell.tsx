import type { ReactNode } from "react";
import { themeStyle } from "@/lib/theme";
import type { Site, Viewer } from "@/lib/types";
import { Backdrop } from "./Backdrop";
import { Companion } from "./Companion";
import { CursorGlow } from "./CursorGlow";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

type SiteShellProps = {
  site: Site;
  basePath: string;
  viewer: Viewer | null;
  children: ReactNode;
};

export function SiteShell({
  site,
  basePath,
  viewer,
  children,
}: SiteShellProps) {
  return (
    <div
      className="site"
      data-preset={site.theme.preset}
      style={themeStyle(site.theme)}
    >
      <Backdrop stars={site.theme.stars} />
      <CursorGlow />
      <SiteHeader site={site} basePath={basePath} viewer={viewer} />
      <main className="site-main">{children}</main>
      <SiteFooter site={site} basePath={basePath} />
      <Companion viewerName={viewer?.displayName} />
    </div>
  );
}
