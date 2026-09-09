import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import RoomClient from "@/components/dashboard/RoomClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Dashboard" });
  return {
    title: t("roomMetaTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function RoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ roomName: string; locale: string }>;
  searchParams: Promise<{ name?: string; subject?: string; lobby?: string }>;
}) {
  const { roomName, locale } = await params;
  const { name, subject, lobby } = await searchParams;
  const t = await getTranslations({ locale, namespace: "Dashboard.common" });

  return (
    <RoomClient
      room={roomName}
      displayName={name || t("guest")}
      subject={subject || t("defaultSessionSubject")}
      enableLobby={lobby === "1"}
    />
  );
}
