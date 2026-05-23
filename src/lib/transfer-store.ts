// Lightweight in-memory + sessionStorage share store with INACTIVITY-based
// expiry: a share dies if no receiver activity happens within the chosen
// window. Each receiver visit / download bumps `lastActivityAt`.
//
// Cross-device transfers use Supabase Realtime as a signaling layer
// (see webrtc-transfer.ts) and stream over a real WebRTC data channel.

export type ShareStatus = "ready" | "transferring" | "delivered" | "expired";

export type ShareSession = {
  id: string;
  name: string;
  size: number;
  type: string;
  createdAt: number;
  /** Resets on every receiver activity; expiry = lastActivityAt + ttlMs. */
  lastActivityAt: number;
  ttlMs: number;
  maxDownloads: number;
  downloads: number;
  password?: string | null;
  status: ShareStatus;
  autoRevoke?: boolean;
};

const KEY = "cleardrop:sessions";

export function loadSessions(): ShareSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as ShareSession[];
    // Backfill lastActivityAt for older entries.
    return list.map((s) => ({
      ...s,
      lastActivityAt: s.lastActivityAt ?? s.createdAt,
    }));
  } catch {
    return [];
  }
}

export function saveSessions(sessions: ShareSession[]) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(sessions));
}

export function makeId() {
  return Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 8);
}

export function expiresAt(s: ShareSession) {
  return s.lastActivityAt + s.ttlMs;
}

export function isExpired(s: ShareSession, now = Date.now()) {
  return now >= expiresAt(s) || s.downloads >= s.maxDownloads;
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export function formatCountdown(ms: number) {
  if (ms <= 0) return "00:00";
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    return `${String(h).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

// File blobs are kept in-memory only on the sender (privacy by default).
const fileBlobs = new Map<string, File>();
export function putBlob(id: string, file: File) {
  fileBlobs.set(id, file);
}
export function getBlob(id: string) {
  return fileBlobs.get(id);
}
export function deleteBlob(id: string) {
  fileBlobs.delete(id);
}
