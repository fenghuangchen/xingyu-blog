import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuestbookView } from "@/components/site/GuestbookView";
import { getViewer } from "@/lib/auth";
import { getSite, listMessages } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const site = getSite(handle);
  return {
    title: site ? `${site.displayName}的留言板` : "留言板",
    description: site?.tagline,
  };
}

export default async function UserGuestbookPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const site = getSite(handle);
  if (!site) notFound();

  const viewer = await getViewer();
  const messages = listMessages(site.id, 100);

  return (
    <GuestbookView
      site={site}
      basePath={`/u/${site.handle}`}
      viewer={viewer}
      messages={messages}
    />
  );
}
