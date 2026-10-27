import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SettingsPanel } from "@/components/studio/SettingsPanel";
import { requireViewer } from "@/lib/auth";
import { getSite } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "站点设置",
};

export default async function StudioSettingsPage() {
  const viewer = await requireViewer();
  const site = getSite(viewer.handle);
  if (!site) notFound();

  return <SettingsPanel user={site} />;
}
