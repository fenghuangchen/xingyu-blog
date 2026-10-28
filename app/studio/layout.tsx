import { Backdrop } from "@/components/site/Backdrop";
import { StudioShell } from "@/components/studio/StudioShell";
import { requireViewer } from "@/lib/auth";
import { getOwnerSite, getSite, listFriendState } from "@/lib/db";
import { themeStyle } from "@/lib/theme";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const viewer = await requireViewer();
  const site = getSite(viewer.handle);
  if (!site) notFound();

  const owner = getOwnerSite();
  const publicPath = owner?.id === site.id ? "/" : `/u/${site.handle}`;
  const friendState = listFriendState(viewer.id);
  const friendAlerts = friendState.incoming.length + friendState.unread;

  return (
    <div
      className="site studio-site"
      data-preset={site.theme.preset}
      style={themeStyle(site.theme)}
    >
      <Backdrop stars={false} />
      <StudioShell
        site={site}
        viewer={viewer}
        publicPath={publicPath}
        friendAlerts={friendAlerts}
      >
        {children}
      </StudioShell>
    </div>
  );
}
