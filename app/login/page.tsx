import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthView } from "@/components/auth/AuthView";
import { getViewer } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "登录",
  description: "回到你的小岛，继续写下想记住的事。",
};

export default async function LoginPage() {
  const viewer = await getViewer();
  if (viewer) redirect("/studio");
  return <AuthView mode="login" />;
}
