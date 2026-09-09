import type { Metadata } from "next";
import RoomClient from "@/components/dashboard/RoomClient";

export const metadata: Metadata = {
  title: "غرفة الحصة | متقن",
  robots: { index: false, follow: false },
};

export default async function RoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ roomName: string }>;
  searchParams: Promise<{ name?: string; subject?: string; lobby?: string }>;
}) {
  const { roomName } = await params;
  const { name, subject, lobby } = await searchParams;

  return (
    <RoomClient
      room={roomName}
      displayName={name || "ضيف"}
      subject={subject || "حصة متقن"}
      enableLobby={lobby === "1"}
    />
  );
}
