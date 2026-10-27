import type { Metadata } from "next";
import { ForgotView } from "@/components/auth/ForgotView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "找回密码",
  description: "用用户名和密保问题，找回你在星屿手记的账号。",
};

export default function ForgotPage() {
  return <ForgotView />;
}
