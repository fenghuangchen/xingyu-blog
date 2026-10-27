import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthView } from "@/components/auth/AuthView";
import { getViewer } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "注册",
  description: "注册一个账号，拥有自己的小岛、笔记与主题。",
};

export default async function RegisterPage() {
  const viewer = await getViewer();
  if (viewer) redirect("/studio");
  return <AuthView mode="register" />;
}
