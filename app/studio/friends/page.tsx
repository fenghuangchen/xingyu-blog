import type { Metadata } from "next";
import { FriendsPanel } from "@/components/studio/FriendsPanel";
import { requireViewer } from "@/lib/auth";
import { listFriendMoments, listFriendState } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "好友",
  description: "按昵称找到其他岛主，聊天并查看彼此的动态。",
};

export default async function StudioFriendsPage() {
  const viewer = await requireViewer();
  const state = listFriendState(viewer.id);
  const friendMoments = listFriendMoments(viewer.id, 12);

  return (
    <FriendsPanel
      viewer={{
        id: viewer.id,
        displayName: viewer.displayName,
        handle: viewer.handle,
        avatar: viewer.avatar,
      }}
      initialState={state}
      friendMoments={friendMoments}
    />
  );
}
