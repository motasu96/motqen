// One Realtime Presence reader per topic, shared by every screen that needs it.
//
// Why this exists: supabase.channel(topic) returns the *already open* channel
// when that topic exists, and realtime-js refuses to add presence callbacks to
// a channel that is joined ("cannot add `presence` callbacks ... after
// `subscribe()`"). Expo Router keeps tab screens mounted once visited, so a
// second screen calling useLiveRooms() (e.g. the teacher's Home, then
// Schedule) threw inside its effect and the screen went blank. Here the
// first attach opens the channel, later attaches just add a listener, and the
// channel is closed only when the last listener leaves.

export type PresenceState = Record<string, unknown[]>;

export type ReaderChannel = {
  on(type: "presence", filter: { event: "sync" }, callback: () => void): unknown;
  subscribe(): unknown;
  presenceState(): PresenceState;
};

export type ReaderClient = {
  channel(topic: string): ReaderChannel;
  removeChannel(channel: ReaderChannel): unknown;
};

// Short grace period so a screen that unmounts and remounts immediately
// (navigation, fast refresh) reuses the open channel instead of racing the
// asynchronous teardown of the old one.
const RELEASE_DELAY_MS = 500;

export function createSharedPresenceReader(topic: string, client: ReaderClient) {
  let channel: ReaderChannel | null = null;
  let releaseTimer: ReturnType<typeof setTimeout> | null = null;
  const listeners = new Set<() => void>();

  function open() {
    const opened = client.channel(topic);
    opened.on("presence", { event: "sync" }, () => listeners.forEach((l) => l()));
    opened.subscribe();
    channel = opened;
  }

  return {
    // Calls `listener` now and on every presence change; returns a detach function.
    attach(listener: () => void): () => void {
      listeners.add(listener);
      if (releaseTimer) {
        clearTimeout(releaseTimer);
        releaseTimer = null;
      }
      if (!channel) {
        try {
          open();
        } catch {
          // Presence badges are a nicety; never take a screen down because
          // the live channel could not be opened.
          channel = null;
        }
      }
      listener();

      return () => {
        listeners.delete(listener);
        if (listeners.size > 0 || releaseTimer) return;
        releaseTimer = setTimeout(() => {
          releaseTimer = null;
          if (listeners.size === 0 && channel) {
            const closing = channel;
            channel = null;
            try {
              void client.removeChannel(closing);
            } catch {
              // already closed
            }
          }
        }, RELEASE_DELAY_MS);
      };
    },

    state(): PresenceState {
      try {
        return channel ? channel.presenceState() : {};
      } catch {
        return {};
      }
    },
  };
}
