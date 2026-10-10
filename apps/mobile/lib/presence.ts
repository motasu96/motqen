import { useEffect, useState } from "react";
import { createPresenceClient, supabase } from "./supabase";
import { createSharedPresenceReader, ReaderClient } from "./sharedPresence";

// Mirrors lib/supabase/presence.ts on the web app — same two app-wide
// Realtime Presence channels (no database tables, state lives only as long
// as the websocket connection does), so a teacher's online/live status set
// from the website is visible here too, and vice versa.
const TEACHERS_CHANNEL = "presence-teachers-online";
const ROOMS_CHANNEL = "presence-rooms-live";

// One shared reader per topic — see sharedPresence.ts for why screens must
// not each open the channel themselves.
const mainClient = supabase as unknown as ReaderClient;
const teachersReader = createSharedPresenceReader(TEACHERS_CHANNEL, mainClient);
const roomsReader = createSharedPresenceReader(ROOMS_CHANNEL, mainClient);

// Used only to announce this device's presence (never to read), created on
// first use.
let presenceClient: ReturnType<typeof createPresenceClient> | null = null;
function getPresenceClient() {
  if (!presenceClient) presenceClient = createPresenceClient();
  return presenceClient;
}

// Teacher-side: marks this teacher as online for as long as the calling
// component stays mounted. Mounted once in the teacher tabs layout so the
// teacher stays "online" across navigation between their screens.
export function useTeacherOnlinePresence(teacherId: string | null) {
  useEffect(() => {
    if (!teacherId) return;
    const client = getPresenceClient();
    const channel = client.channel(TEACHERS_CHANNEL, { config: { presence: { key: teacherId } } });
    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ teacherId, online_at: new Date().toISOString() });
      }
    });
    return () => {
      client.removeChannel(channel);
    };
  }, [teacherId]);
}

// Read-only: the set of teacher ids currently online anywhere on the
// platform (web dashboard or this app).
export function useOnlineTeacherIds(): Set<string> {
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());

  useEffect(
    () => teachersReader.attach(() => setOnlineIds(new Set(Object.keys(teachersReader.state())))),
    []
  );

  return onlineIds;
}

// Marks this student as present in a specific video room for as long as the
// calling screen stays mounted (i.e. for as long as they're actually inside
// the call) — mount from the room screen itself.
export function useRoomPresence(roomId: string | null, participant: { role: "teacher" | "student"; name: string } | null) {
  useEffect(() => {
    if (!roomId || !participant) return;
    const client = getPresenceClient();
    const presenceKey = `${roomId}:${participant.role}:${Math.random().toString(36).slice(2)}`;
    const channel = client.channel(ROOMS_CHANNEL, { config: { presence: { key: presenceKey } } });
    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ room: roomId, role: participant.role, name: participant.name });
      }
    });
    return () => {
      client.removeChannel(channel);
    };
  }, [roomId, participant?.role, participant?.name]);
}

export type LiveRoomInfo = { teacherPresent: boolean; studentCount: number };

// Read-only: a map of roomId -> who's currently present in it.
export function useLiveRooms(): Map<string, LiveRoomInfo> {
  const [rooms, setRooms] = useState<Map<string, LiveRoomInfo>>(new Map());

  useEffect(
    () =>
      roomsReader.attach(() => {
        const state = roomsReader.state() as Record<string, { room: string; role: string; name: string }[]>;
        const next = new Map<string, LiveRoomInfo>();
        for (const entries of Object.values(state)) {
          for (const entry of entries) {
            const info = next.get(entry.room) ?? { teacherPresent: false, studentCount: 0 };
            if (entry.role === "teacher") info.teacherPresent = true;
            else info.studentCount += 1;
            next.set(entry.room, info);
          }
        }
        setRooms(next);
      }),
    []
  );

  return rooms;
}

// A teacher is "available now" only when they're both online right now AND
// the current time of day falls inside one of their declared available
// slots (each slot covers a one-hour booking window from its start time).
export function isWithinAvailableWindow(times: string[], now: Date): boolean {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return times.some((slot) => {
    const [h, m] = slot.split(":").map(Number);
    const start = h * 60 + m;
    return nowMinutes >= start && nowMinutes < start + 60;
  });
}
