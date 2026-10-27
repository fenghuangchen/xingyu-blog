import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AboutView } from "@/components/site/AboutView";
import { getViewer } from "@/lib/auth";
import { getOwnerSite } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "关于",
  description: "岛主，与这座岛。",
};

export default async function AboutPage() {
  const site = getOwnerSite();
  if (!site) notFound();

  const viewer = await getViewer();

  return <AboutView site={site} basePath="" viewer={viewer} />;
}
