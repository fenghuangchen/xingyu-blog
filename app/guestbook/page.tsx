import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuestbookView } from "@/components/site/GuestbookView";
import { getViewer } from "@/lib/auth";
import { getOwnerSite, listMessages } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "留言板",
  description: "路过的话，就留一句吧。",
};

export default async function GuestbookPage() {
  const site = getOwnerSite();
  if (!site) notFound();

  const viewer = await getViewer();
  const messages = listMessages(site.id, 100);

  return (
    <GuestbookView
      site={site}
      basePath=""
      viewer={viewer}
      messages={messages}
    />
  );
}
