import { Link } from "@/lib/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import {
  Upload,
  Send,
  QrCode,
  Copy,
  Check,
  Trash2,
  Wifi,
  Bluetooth,
  Smartphone,
  Link as LinkIcon,
  Shield,
  Timer,
  ArrowLeft,
  Sparkles,
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  File as FileIcon,
  FileArchive,
  FileCode,
  BookOpen,
  RefreshCw,
  Radio,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  Heart,
  X,
  Download,
} from "lucide-react";
import {
  ShareSession,
  formatBytes,
  formatCountdown,
  loadSessions,
  saveSessions,
  makeId,
  putBlob,
  getBlob,
  deleteBlob,
  expiresAt,
  isExpired,
} from "@/lib/transfer-store";
import { startSender, watchReceiverActivity } from "@/lib/webrtc-transfer";
import { PrivacyModal, TermsModal, DonationButton } from "@/components/LegalModals";

const TTL_OPTIONS = [
  { label: "5 min", ms: 5 * 60 * 1000 },
  { label: "30 min", ms: 30 * 60 * 1000 },
  { label: "1 hour", ms: 60 * 60 * 1000 },
  { label: "24 hours", ms: 24 * 60 * 60 * 1000 },
];

function fileIcon(type: string) {
  if (type.startsWith("image/")) return ImageIcon;
  if (type.startsWith("video/")) return Film;
  if (type.startsWith("audio/")) return Music;
  if (type.includes("zip") || type.includes("compressed") || type.includes("tar"))
    return FileArchive;
  if (
    type.includes("json") ||
    type.includes("javascript") ||
    type.includes("html") ||
    type.includes("xml") ||
    type.includes("css")
  )
    return FileCode;
  if (
    type.includes("pdf") ||
    type.includes("text") ||
    type.includes("document") ||
    type.includes("sheet") ||
    type.includes("msword")
  )
    return FileText;
  return FileIcon;
}

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

type TransferState = {
  status: "idle" | "waiting" | "connecting" | "transferring" | "delivered";
  sent: number;
  total: number;
  sas?: string[];
  resumedFrom?: number;
  reconnects?: number;
  networkType?: "wifi" | "p2p" | "relay";
  localCand?: string;
  remoteCand?: string;
  rtt?: number;
  speed?: number;
};

function estimateCompressionSaving(name: string, size: number, type: string) {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  const t = type.toLowerCase();

  if (
    ext === "txt" ||
    ext === "json" ||
    ext === "csv" ||
    ext === "xml" ||
    ext === "html" ||
    ext === "css" ||
    ext === "js" ||
    ext === "ts" ||
    ext === "md" ||
    ext === "sql" ||
    ext === "ini" ||
    t.includes("text/") ||
    t.includes("json") ||
    t.includes("javascript") ||
    t.includes("xml")
  ) {
    const ratio = 0.72; // 72% average savings
    return { pct: 72, bytesSec: size * ratio };
  }

  if (
    ext === "pdf" ||
    ext === "doc" ||
    ext === "xls" ||
    ext === "ppt" ||
    ext === "rtf" ||
    ext === "svg" ||
    t.includes("pdf") ||
    t.includes("msword") ||
    t.includes("excel") ||
    t.includes("powerpoint")
  ) {
    const ratio = 0.38; // 38% average savings
    return { pct: 38, bytesSec: size * ratio };
  }

  if (
    ext === "zip" ||
    ext === "rar" ||
    ext === "7z" ||
    ext === "tar" ||
    ext === "gz" ||
    ext === "xz" ||
    ext === "jpg" ||
    ext === "jpeg" ||
    ext === "png" ||
    ext === "gif" ||
    ext === "webp" ||
    ext === "mp4" ||
    ext === "mkv" ||
    ext === "avi" ||
    ext === "mp3" ||
    ext === "wav" ||
    ext === "flac" ||
    t.includes("zip") ||
    t.includes("compressed") ||
    t.includes("image/") ||
    t.includes("video/") ||
    t.includes("audio/")
  ) {
    const ratio = 0.03; // already highly compressed, ~3% savings
    return { pct: 3, bytesSec: size * ratio };
  }

  return { pct: 15, bytesSec: size * 0.15 };
}

export default function AppPage() {
  const [sessions, setSessions] = useState<ShareSession[]>([]);

  useEffect(() => {
    document.title = "Droply · Web App";
  }, []);
  const [dragging, setDragging] = useState(false);
  const [ttlMs, setTtlMs] = useState(TTL_OPTIONS[1].ms);
  const [limitDownloads, setLimitDownloads] = useState(true);
  const [maxDownloadsVal, setMaxDownloadsVal] = useState(1);
  const [password, setPassword] = useState("");
  const [autoRevoke, setAutoRevoke] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("cleardrop_auto_revoke") === "true";
    }
    return false;
  });
  const [autoCopyToClipboard, setAutoCopyToClipboard] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("cleardrop_auto_copy_to_clipboard") === "true";
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cleardrop_auto_copy_to_clipboard", String(autoCopyToClipboard));
    }
  }, [autoCopyToClipboard]);

  const [batterySaver, setBatterySaver] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("cleardrop_battery_saver") === "true";
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cleardrop_battery_saver", String(batterySaver));
    }
  }, [batterySaver]);

  const [activeQr, setActiveQr] = useState<string | null>(null);
  const [removing, setRemoving] = useState<Set<string>>(new Set());
  const [transfer, setTransfer] = useState<Record<string, TransferState>>({});
  const [activityBlip, setActivityBlip] = useState<Record<string, number>>({});
  const [showCompletedModal, setShowCompletedModal] = useState<ShareSession | null>(null);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [customTurn, setCustomTurn] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("cleardrop_custom_turn") || "";
    }
    return "";
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const now = useNow(1000);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cleardrop_auto_revoke", String(autoRevoke));
    }
  }, [autoRevoke]);

  // Active WebRTC senders per-share (active only while their tab is open).
  const senderHandles = useRef<Map<string, { cancel: () => void }>>(new Map());
  const presenceUnsubs = useRef<Map<string, () => void>>(new Map());

  // Load + persist
  useEffect(() => {
    setSessions(loadSessions());
  }, []);
  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  // Inactivity-based expiry sweeper with deletion animation.
  useEffect(() => {
    const expiredIds = sessions
      .filter((s) => s.status !== "expired" && isExpired(s, now))
      .map((s) => s.id);

    if (expiredIds.length === 0) return;

    setRemoving((prev) => {
      const next = new Set(prev);
      expiredIds.forEach((id) => next.add(id));
      return next;
    });

    const t = setTimeout(() => {
      setSessions((prev) => prev.filter((s) => !expiredIds.includes(s.id)));
      expiredIds.forEach((id) => {
        deleteBlob(id);
        senderHandles.current.get(id)?.cancel();
        senderHandles.current.delete(id);
        presenceUnsubs.current.get(id)?.();
        presenceUnsubs.current.delete(id);
      });
      setRemoving((prev) => {
        const next = new Set(prev);
        expiredIds.forEach((id) => next.delete(id));
        return next;
      });
    }, 900);

    return () => clearTimeout(t);
  }, [now, sessions]);

  const bumpActivity = useCallback((id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, lastActivityAt: Date.now() } : s)),
    );
    setActivityBlip((b) => ({ ...b, [id]: Date.now() }));
  }, []);

  // Boot a real WebRTC sender per session + presence watcher.
  const ensureSender = useCallback(
    (session: ShareSession) => {
      if (senderHandles.current.has(session.id)) return;
      const file = getBlob(session.id);
      if (!file) return;

      const handle = startSender(session.id, file, {
        autoRevoke: session.autoRevoke,
        batterySaver,
        onReceiverJoin: () => {
          bumpActivity(session.id);
          setTransfer((t) => ({
            ...t,
            [session.id]: {
              ...(t[session.id] ?? { sent: 0, total: session.size }),
              status: "connecting",
            },
          }));
        },
        onSas: (sas) => {
          setTransfer((t) => ({
            ...t,
            [session.id]: {
              ...(t[session.id] ?? { status: "connecting", sent: 0, total: session.size }),
              sas,
            },
          }));
        },
        onResume: (from) => {
          setTransfer((t) => ({
            ...t,
            [session.id]: {
              ...(t[session.id] ?? { status: "transferring", sent: from, total: session.size }),
              resumedFrom: from,
            },
          }));
        },
        onReconnect: () => {
          setTransfer((t) => {
            const cur = t[session.id] ?? {
              status: "connecting" as const,
              sent: 0,
              total: session.size,
            };
            return { ...t, [session.id]: { ...cur, reconnects: (cur.reconnects ?? 0) + 1 } };
          });
        },
        onProgress: (sent, total, speed) => {
          bumpActivity(session.id);
          setTransfer((t) => ({
            ...t,
            [session.id]: { ...(t[session.id] ?? {}), status: "transferring", sent, total, speed },
          }));
        },
        onNetworkDetected: (netType, localCand, remoteCand, rtt) => {
          setTransfer((t) => ({
            ...t,
            [session.id]: {
              ...(t[session.id] ?? { status: "transferring", sent: 0, total: session.size }),
              networkType: netType,
              localCand,
              remoteCand,
              rtt,
            },
          }));
        },
        onDone: () => {
          setTransfer((t) => ({
            ...t,
            [session.id]: {
              ...(t[session.id] ?? {}),
              status: "delivered",
              sent: session.size,
              total: session.size,
            },
          }));
          const updatedSession: ShareSession = {
            ...session,
            downloads: session.downloads + 1,
            lastActivityAt: Date.now(),
          };
          setSessions((prev) => prev.map((s) => (s.id === session.id ? updatedSession : s)));
          setShowCompletedModal(updatedSession);
          if (session.autoRevoke) {
            setTimeout(() => {
              revoke(session.id);
            }, 1000);
          }
        },
        onError: (e) => console.warn("sender error", e),
      });
      if (session.password) handle.setPassword?.(session.password);
      senderHandles.current.set(session.id, handle);

      const unsub = watchReceiverActivity(session.id, () => {
        bumpActivity(session.id);
      });
      presenceUnsubs.current.set(session.id, unsub);
    },
    [bumpActivity, batterySaver],
  );

  // Spin up senders for any session we have a blob for.
  useEffect(() => {
    sessions.forEach((s) => {
      if (!isExpired(s, now)) {
        ensureSender(s);
      } else {
        if (senderHandles.current.has(s.id)) {
          senderHandles.current.get(s.id)?.cancel();
          senderHandles.current.delete(s.id);
          presenceUnsubs.current.get(s.id)?.();
          presenceUnsubs.current.delete(s.id);
        }
      }
    });
  }, [sessions, ensureSender, now]);

  // Cleanup all on unmount.
  useEffect(() => {
    return () => {
      senderHandles.current.forEach((h) => h.cancel());
      presenceUnsubs.current.forEach((u) => u());
      senderHandles.current.clear();
      presenceUnsubs.current.clear();
    };
  }, []);

  const onFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const additions: ShareSession[] = [];
      const created = Date.now();
      Array.from(files).forEach((file) => {
        const id = makeId();
        putBlob(id, file);
        additions.push({
          id,
          name: file.name,
          size: file.size,
          type: file.type || "application/octet-stream",
          createdAt: created,
          lastActivityAt: created,
          ttlMs,
          maxDownloads: limitDownloads ? maxDownloadsVal : 9999,
          downloads: 0,
          password: password || null,
          status: "ready",
          autoRevoke,
        });
      });
      setSessions((prev) => [...additions, ...prev]);
      setActiveQr(additions[0]?.id ?? null);

      if (typeof window !== "undefined" && autoCopyToClipboard && additions.length > 0) {
        const primaryId = additions[0].id;
        const link = `${window.location.origin}/receive/${primaryId}`;
        navigator.clipboard
          .writeText(link)
          .then(() => {
            console.log("Autocopied link to clipboard:", link);
          })
          .catch((err) => {
            console.warn("Auto copy to clipboard failed:", err);
          });
      }
    },
    [ttlMs, limitDownloads, maxDownloadsVal, password, autoRevoke, autoCopyToClipboard],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      onFiles(e.dataTransfer.files);
    },
    [onFiles],
  );

  const revoke = (id: string) => {
    setRemoving((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setSessions((prev) => prev.filter((s) => s.id !== id));
      deleteBlob(id);
      senderHandles.current.get(id)?.cancel();
      senderHandles.current.delete(id);
      presenceUnsubs.current.get(id)?.();
      presenceUnsubs.current.delete(id);
      setRemoving((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      if (activeQr === id) setActiveQr(null);
    }, 600);
  };

  const extendShare = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, lastActivityAt: Date.now() } : s)),
    );
  };

  const activeSession = sessions.find((s) => s.id === activeQr) ?? null;

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground flex flex-col justify-between">
      <div>
        <div className="bg-radial-glow pointer-events-none fixed inset-0 -z-10" />

        <header className="sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
                <Send className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold tracking-tight">Droply</span>
            </Link>
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to="/guide"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border bg-card/40 px-3 py-1.5 text-xs text-muted-foreground transition hover:text-foreground"
              >
                <BookOpen className="h-3.5 w-3.5" /> Step-by-step
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/40 px-3 py-1.5 text-xs text-muted-foreground transition hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Home
              </Link>
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 grid-cols-1 lg:grid-cols-12">
          {/* Left: dropzone, methods, sessions */}
          <section className="lg:col-span-7 flex flex-col gap-8">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`group relative cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed p-10 text-center transition ${
                dragging
                  ? "scale-[1.01] border-primary bg-primary/10 shadow-glow"
                  : "border-border bg-card/30 hover:border-primary/60 hover:bg-card/50"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                multiple
                hidden
                onChange={(e) => onFiles(e.target.files)}
              />
              <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
                <Upload className="h-8 w-8 text-primary-foreground" />
                <span className="absolute inset-0 -z-10 rounded-2xl bg-primary/40 animate-pulse-ring" />
              </div>
              <h2 className="mt-6 text-2xl font-semibold">Drag &amp; drop files here</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                or click to browse — multiple files supported
              </p>

              {sessions.length > 0 &&
                sessions.some((s) => {
                  const status = transfer[s.id]?.status;
                  return !status || (status !== "transferring" && status !== "delivered");
                }) && (
                  <div
                    className="mt-4 mx-auto max-w-sm rounded-xl border border-primary/20 bg-primary/10 p-2.5 text-xs text-primary flex items-center justify-center gap-2 animate-fade-in"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FileArchive className="h-4 w-4 shrink-0 animate-pulse text-primary" />
                    <div className="text-left font-sans leading-tight">
                      <p className="font-semibold">Optimize before sending:</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Compressing <strong className="text-foreground">{sessions[0].name}</strong>{" "}
                        to .zip first saves ~
                        {Math.round(
                          estimateCompressionSaving(
                            sessions[0].name,
                            sessions[0].size,
                            sessions[0].type,
                          ).pct,
                        )}
                        % (
                        {formatBytes(
                          Math.round(
                            estimateCompressionSaving(
                              sessions[0].name,
                              sessions[0].size,
                              sessions[0].type,
                            ).bytesSec,
                          ),
                        )}
                        ).
                      </p>
                    </div>
                  </div>
                )}

              <div
                onClick={(e) => e.stopPropagation()}
                className="mx-auto mt-8 flex max-w-xl flex-col gap-4 rounded-2xl border border-border/60 bg-background/40 p-4 backdrop-blur"
              >
                <div className="flex items-center gap-2 text-left">
                  <Timer className="h-4 w-4 text-primary" />
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    Inactivity window
                  </span>
                  <span className="ml-auto text-[11px] text-muted-foreground">
                    resets on activity
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TTL_OPTIONS.map((o) => (
                    <button
                      key={o.label}
                      onClick={() => setTtlMs(o.ms)}
                      className={`rounded-full border px-3 py-1.5 text-xs transition ${
                        ttlMs === o.ms
                          ? "border-primary bg-primary/20 text-foreground"
                          : "border-border bg-card/50 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setShowLimitModal(true)}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card/40 p-3 text-left hover:border-primary/40 transition-all cursor-pointer"
                  >
                    <Smartphone className="h-4 w-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
                        Advanced Settings
                      </span>
                      <span className="block text-xs font-semibold text-foreground truncate">
                        {limitDownloads
                          ? `Limit (${maxDownloadsVal}×) & TURN`
                          : "TURN & Unlimited Users"}
                      </span>
                    </div>
                    <span className="text-[10px] border border-primary/20 bg-primary/10 text-primary rounded-md px-1.5 py-0.5 shrink-0 font-medium font-sans">
                      Setup
                    </span>
                  </button>
                  <div className="flex items-center gap-2 rounded-xl border border-border bg-card/40 px-3 py-2">
                    <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Optional password"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Methods */}
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Choose how to send
                </h3>
                <Link to="/guide" className="text-xs font-medium text-primary hover:underline">
                  See step-by-step →
                </Link>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <MethodCard
                  icon={QrCode}
                  title="Scan to receive"
                  steps={[
                    "Pick a file above",
                    "Open the QR on this screen",
                    "Scan with the other phone's camera",
                  ]}
                  badge="Easiest"
                />
                <MethodCard
                  icon={LinkIcon}
                  title="Private link"
                  steps={[
                    "Copy the auto-generated link",
                    "Send it via any chat app",
                    "It self-destructs after download",
                  ]}
                />
                <MethodCard
                  icon={Wifi}
                  title="Wi-Fi / Hotspot"
                  steps={[
                    "Put both devices on the same Wi-Fi or hotspot",
                    "Open the link or scan the QR",
                    "Files stream peer-to-peer",
                  ]}
                />
                <MethodCard
                  icon={Bluetooth}
                  title="Bluetooth fallback"
                  steps={[
                    "Pair the two devices in system settings",
                    "Share the link via 'Send via Bluetooth'",
                    "Open the link on the other device",
                  ]}
                />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                <Sparkles className="mr-1 inline h-3 w-3" />
                Works across networks — files stream peer-to-peer over WebRTC. No uploads, no
                servers in the middle.
              </p>
            </div>

            {/* Sessions */}
            <div className="mt-10">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Active shares
                </h3>
                <span className="text-xs text-muted-foreground">{sessions.length} active</span>
              </div>
              <div className="mt-4 space-y-3">
                {sessions.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-border bg-card/20 p-8 text-center text-sm text-muted-foreground">
                    Drop a file to create your first share.
                  </div>
                )}
                {sessions.map((s) => (
                  <SessionRow
                    key={s.id}
                    session={s}
                    now={now}
                    removing={removing.has(s.id)}
                    active={s.id === activeQr}
                    transfer={transfer[s.id]}
                    activeBlip={activityBlip[s.id] ?? 0}
                    onSelect={() => setActiveQr(s.id)}
                    onRevoke={() => revoke(s.id)}
                    onExtend={() => extendShare(s.id)}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Right: QR panel */}
          <aside className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start">
            <SharePanel
              session={activeSession}
              now={now}
              transfer={activeSession ? transfer[activeSession.id] : undefined}
              activeBlip={activeSession ? (activityBlip[activeSession.id] ?? 0) : 0}
              onExtend={() => activeSession && extendShare(activeSession.id)}
            />
          </aside>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 bg-background/20 backdrop-blur-sm mt-12">
        <div className="mx-auto flex h-full max-w-7xl flex-col items-center justify-between gap-6 px-6 text-sm text-muted-foreground md:flex-row">
          <div className="flex flex-col gap-2 items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-primary">
                <Send className="h-3 w-3 text-primary-foreground" />
              </div>
              <span className="font-medium text-foreground">Droply Dashboard</span>
              <span className="text-muted-foreground">· Fast. Private. Temporary.</span>
            </div>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Droply · Part of the LanDecs ecosystem.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 justify-center">
            <Link to="/features" className="hover:text-foreground transition text-sm font-medium">
              Features
            </Link>
            <Link to="/how" className="hover:text-foreground transition text-sm font-medium">
              How it works
            </Link>
            <Link to="/guide" className="hover:text-foreground transition text-sm font-medium">
              Guide
            </Link>
            <Link
              to="/app"
              className="hover:text-foreground transition text-sm font-medium text-foreground font-semibold"
            >
              App
            </Link>
            <Link
              to="/privacy"
              className="hover:text-foreground transition text-sm font-medium text-foreground"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="hover:text-foreground transition text-sm font-medium text-foreground"
            >
              Terms of Use
            </Link>
            <DonationButton />
          </div>
        </div>
      </footer>

      {showCompletedModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md"
          onClick={() => setShowCompletedModal(null)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl border border-success/35 bg-gradient-surface p-6 text-center shadow-glowScale"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowCompletedModal(null)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition animate-fade-in"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-success/15 text-success shadow-[0_0_20px_rgba(34,197,94,0.2)]">
              <CheckCircle2 className="h-8 w-8 animate-bounce" />
            </div>

            <h3 className="mt-5 text-xl font-semibold tracking-tight">Transmission Delivered!</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your file <strong>{showCompletedModal.name}</strong> has been successfully received,
              decrypted, and downloaded at the remote peer device.
            </p>

            <div className="mt-4 rounded-xl border border-border bg-background/40 p-3 text-xs font-mono text-muted-foreground grid grid-cols-2 gap-2 text-left">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase">State</span>
                <span className="text-success font-semibold">100% Shared</span>
              </div>
              <div className="text-right">
                <span className="text-muted-foreground block text-[10px] uppercase">Receivers</span>
                <span className="text-foreground font-semibold">
                  {showCompletedModal.downloads}/
                  {showCompletedModal.maxDownloads >= 9999
                    ? "unlimited"
                    : showCompletedModal.maxDownloads}{" "}
                  downloads
                </span>
              </div>
            </div>

            <div className="border-t border-border/40 my-6 pt-5">
              <div className="flex items-center gap-1.5 justify-center text-amber-500 mb-2">
                <Heart className="h-4 w-4 fill-amber-500" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Support our development
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Thank you for choosing Droply! To support continuous development and help keep
                trackers off peer transactions, consider supporting the author.
              </p>
              <DonationButton className="w-full justify-center text-sm py-3" />
            </div>

            <button
              onClick={() => setShowCompletedModal(null)}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition shadow-glow"
            >
              Back to dashboard
            </button>
          </div>
        </div>
      )}

      <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />

      {showLimitModal && (
        <div
          className="fixed inset-0 z-50 bg-background/50 backdrop-blur-sm flex lg:justify-end justify-center overflow-y-auto lg:overflow-hidden animate-fade-in"
          onClick={() => setShowLimitModal(false)}
        >
          <div
            className="relative w-full min-h-[100dvh] lg:h-full lg:min-h-0 bg-background lg:bg-gradient-surface border-0 lg:border-l border-border flex flex-col justify-between shadow-2xl lg:w-[460px] p-6 lg:p-8 animate-slide-in-bottom lg:animate-slide-in-right overflow-y-auto shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-border/40">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary animate-pulse shrink-0">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold">Advanced Settings</h3>
                    <p className="text-xs text-muted-foreground">
                      Transfers limiters and TURN router setup
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLimitModal(false)}
                  className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-border bg-card/40 p-3 animate-fade-in">
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-semibold">Enable Limit</span>
                    <span className="text-[11px] text-muted-foreground">
                      Restrict downloading devices
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={limitDownloads}
                    onChange={(e) => setLimitDownloads(e.target.checked)}
                    className="h-5 w-5 cursor-pointer accent-[var(--color-primary)] rounded border-border bg-background"
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border bg-card/40 p-3 animate-fade-in">
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-semibold">Auto-Revoke Session</span>
                    <span className="text-[11px] text-muted-foreground">
                      Revoke session immediately on first download
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoRevoke}
                    onChange={(e) => setAutoRevoke(e.target.checked)}
                    className="h-5 w-5 cursor-pointer accent-[var(--color-primary)] rounded border-border bg-background"
                  />
                </div>

                <div
                  className="flex items-center justify-between rounded-xl border border-border bg-card/40 p-3 animate-fade-in"
                  id="settings-auto-copy-toggle"
                >
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-semibold">Auto-Copy Share Link</span>
                    <span className="text-[11px] text-muted-foreground">
                      Copy share link to clipboard on file drops
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoCopyToClipboard}
                    onChange={(e) => setAutoCopyToClipboard(e.target.checked)}
                    className="h-5 w-5 cursor-pointer accent-[var(--color-primary)] rounded border-border bg-background"
                  />
                </div>

                <div
                  className="flex items-center justify-between rounded-xl border border-border bg-card/40 p-3 animate-fade-in"
                  id="settings-battery-saver-toggle"
                >
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-semibold">Battery Saver Mode</span>
                    <span className="text-[11px] text-muted-foreground">
                      Reduce CPU usage via less frequent connection stats polls
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={batterySaver}
                    onChange={(e) => setBatterySaver(e.target.checked)}
                    className="h-5 w-5 cursor-pointer accent-[var(--color-primary)] rounded border-border bg-background"
                  />
                </div>

                {limitDownloads && (
                  <div className="space-y-2 text-left animate-fade-in">
                    <label className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider">
                      Select Max Receivers
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[1, 2, 5, 10, 25].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setMaxDownloadsVal(val)}
                          className={`rounded-xl border p-2 font-mono text-xs font-semibold transition cursor-pointer ${
                            maxDownloadsVal === val
                              ? "border-primary bg-primary/20 text-foreground shadow-[0_0_12px_rgba(59,130,246,0.25)]"
                              : "border-border bg-card/30 text-muted-foreground hover:bg-card/50"
                          }`}
                        >
                          {val === 1 ? "1×" : `${val}`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2 text-left pt-2 border-t border-border/40">
                  <label className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider">
                    Custom TURN Servers (Optional)
                  </label>
                  <p className="text-[10px] text-muted-foreground leading-normal mb-1.5">
                    Input custom iceServers JSON object below to use your own TURN routing servers:
                  </p>
                  <textarea
                    value={customTurn}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomTurn(val);
                      if (!val.trim()) {
                        localStorage.removeItem("cleardrop_custom_turn");
                      } else {
                        try {
                          const parsed = JSON.parse(val);
                          if (parsed && Array.isArray(parsed.iceServers)) {
                            localStorage.setItem("cleardrop_custom_turn", val);
                          }
                        } catch {
                          // Keep typing safely
                        }
                      }
                    }}
                    placeholder='{"iceServers": [{"urls": "turn:your-server.com:3478", "username": "user", "credential": "pw"}]}'
                    className="w-full h-20 rounded-xl border border-border bg-card/40 p-2 text-[10px] font-mono outline-none focus:border-primary/60 transition block resize-none placeholder:text-muted-foreground/55"
                  />
                  <p className="text-[9px] text-muted-foreground leading-normal italic text-right select-none">
                    * Empty falls back to Droply built-in TURN network
                  </p>
                </div>

                <div className="rounded-xl border border-border/40 bg-background/30 p-3 text-xs text-left text-muted-foreground leading-snug space-y-1.5 font-sans">
                  <p>
                    * Droply utilizes{" "}
                    <strong className="text-foreground">Google public STUN servers</strong> to
                    discover public WAN IP addresses for real-time direct P2P connection
                    coordinates.
                  </p>
                  <p>
                    * Direct P2P pathways automatically match local LAN speeds when on the same
                    network. Symmetric-NAT firewalls may restrict direct WAN linkups, falling back
                    safely to encrypted Cloud Relay TURN routing.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-border/40 shrink-0">
              <button
                onClick={() => setShowLimitModal(false)}
                className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition shadow-glow cursor-pointer"
              >
                Apply Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function MethodCard({
  icon: Icon,
  title,
  steps,
  badge,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  steps: string[];
  badge?: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/40 p-5 transition hover:border-primary/40">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        {badge && (
          <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-success">
            {badge}
          </span>
        )}
      </div>
      <h4 className="mt-4 text-base font-semibold">{title}</h4>
      <ol className="mt-2 space-y-1.5 text-sm text-muted-foreground">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-background/60 font-mono text-[10px] text-muted-foreground">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}

function SessionRow({
  session,
  now,
  removing,
  active,
  transfer,
  activeBlip,
  onSelect,
  onRevoke,
  onExtend,
}: {
  session: ShareSession;
  now: number;
  removing: boolean;
  active: boolean;
  transfer?: TransferState;
  activeBlip: number;
  onSelect: () => void;
  onRevoke: () => void;
  onExtend: () => void;
}) {
  const activeRecent = Date.now() - activeBlip < 1500;
  const Icon = fileIcon(session.type);
  const remaining = Math.max(0, expiresAt(session) - now);
  const totalPct = Math.max(0, Math.min(100, (remaining / session.ttlMs) * 100));
  const expired = remaining <= 0 || session.downloads >= session.maxDownloads;
  const lowTime = remaining > 0 && remaining < 60_000;
  const transferring = transfer?.status === "transferring";
  const xferPct = transfer ? Math.round((transfer.sent / Math.max(1, transfer.total)) * 100) : 0;

  const [revealPassword, setRevealPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const rtt = transfer?.rtt;
  let connectionQuality: { color: string; label: string; textClass: string } | null = null;
  if (transferring && rtt !== undefined) {
    if (rtt < 50) {
      connectionQuality = {
        color: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]",
        label: `Excellent link quality (RTT: ${Math.round(rtt)}ms)`,
        textClass: "text-emerald-500",
      };
    } else if (rtt < 150) {
      connectionQuality = {
        color: "bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]",
        label: `Good link quality (RTT: ${Math.round(rtt)}ms)`,
        textClass: "text-teal-500",
      };
    } else if (rtt < 300) {
      connectionQuality = {
        color: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]",
        label: `Fair link quality (RTT: ${Math.round(rtt)}ms)`,
        textClass: "text-amber-500",
      };
    } else {
      connectionQuality = {
        color: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]",
        label: `Poor link quality (RTT: ${Math.round(rtt)}ms)`,
        textClass: "text-red-500",
      };
    }
  } else if (transferring) {
    connectionQuality = {
      color: "bg-slate-400 animate-pulse",
      label: "Calibrating connection quality statistics...",
      textClass: "text-muted-foreground",
    };
  }

  return (
    <div
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSelect();
      }}
      className={`group relative block w-full cursor-pointer overflow-hidden rounded-2xl border p-4 text-left transition ${
        removing
          ? "scale-[0.97] border-destructive/40 bg-destructive/5 opacity-0 blur-sm"
          : active
            ? "border-primary/60 bg-card/60 shadow-glow"
            : "border-border/60 bg-card/40 hover:border-primary/30"
      }`}
      style={{ transition: "all 0.6s ease" }}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Icon className="h-4 w-4 shrink-0 text-muted-foreground/85" />
              <p className="truncate text-sm font-medium">{session.name}</p>
            </div>
            {expired ? (
              <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-destructive">
                Destroyed
              </span>
            ) : transferring ? (
              <div className="flex flex-col gap-1 shrink-0 animate-progress-appear">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
                  <Radio className="h-2.5 w-2.5 animate-pulse" /> Sending ({xferPct}%)
                  {connectionQuality && (
                    <span
                      className="inline-flex items-center gap-1 ml-1.5 pl-1.5 border-l border-primary/25"
                      title={connectionQuality.label}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${connectionQuality.color}`} />
                      <span
                        className={`text-[8.5px] lowercase font-semibold ${connectionQuality.textClass}`}
                      >
                        {rtt !== undefined ? `${Math.round(rtt)}ms` : "init"}
                      </span>
                    </span>
                  )}
                </span>
                <div className="h-1 w-20 bg-primary/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-primary rounded-full transition-all duration-300"
                    style={{ width: `${xferPct}%` }}
                  />
                </div>
              </div>
            ) : (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                  lowTime ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success"
                }`}
              >
                Live
              </span>
            )}
            <span className="rounded-full bg-muted/80 px-2 py-0.5 text-[10px] font-mono font-medium text-muted-foreground shrink-0 border border-border/10">
              {session.downloads}/{session.maxDownloads} downloads
            </span>
          </div>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span>{formatBytes(session.size)}</span>
            <span>
              · <span className="font-mono">{formatCountdown(remaining)}</span> until self-destruct
            </span>
            {session.password && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-500 px-2 py-0.5 text-[10px] font-medium border border-amber-500/25">
                <Shield className="h-2.5 w-2.5 shrink-0" />
                <span>Password: {revealPassword ? session.password : "••••••"}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRevealPassword(!revealPassword);
                  }}
                  className="ml-1 text-amber-500/70 hover:text-amber-500 hover:bg-amber-500/20 p-0.5 rounded transition shrink-0"
                  title={revealPassword ? "Hide password" : "Show password"}
                >
                  {revealPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </button>
              </span>
            )}
            {activeRecent && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                <Activity className="h-2.5 w-2.5 animate-pulse" /> Activity detected
              </span>
            )}
          </p>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-background/60">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                transferring
                  ? "bg-gradient-primary"
                  : lowTime
                    ? "bg-destructive"
                    : "bg-gradient-primary"
              }`}
              style={{
                width: `${transferring ? xferPct : totalPct}%`,
              }}
            />
          </div>
          {transfer && transfer.status === "transferring" && transfer.networkType && (
            <div className="mt-2.5 text-[10px] text-muted-foreground flex flex-col sm:flex-row sm:items-center justify-between bg-card-accent border border-border/40 p-2 rounded-xl select-none gap-1.5 leading-snug animate-fade-in animate-duration-300">
              <span className="flex items-center gap-1.5 font-medium font-sans">
                {transfer.networkType === "wifi" ? (
                  <>
                    <Wifi className="h-3.5 w-3.5 text-emerald-500 animate-pulse shrink-0" />
                    <span className="text-emerald-500 font-semibold tracking-tight">
                      Direct Local LAN (Wi-Fi / Hotspot) route active
                    </span>
                  </>
                ) : transfer.networkType === "relay" ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 text-amber-500 animate-spin shrink-0" />
                    <span className="text-amber-500 font-semibold tracking-tight font-sans">
                      Proxy Route mediated via TURN Cloud relay
                    </span>
                  </>
                ) : (
                  <>
                    <Radio className="h-3.5 w-3.5 text-sky-500 animate-pulse shrink-0" />
                    <span className="text-sky-500 font-semibold tracking-tight">
                      Direct P2P STUN WAN route active
                    </span>
                  </>
                )}
              </span>
              <span
                className="font-mono text-[9px] text-muted-foreground/80 truncate shrink-0 flex items-center gap-1.5"
                title={`Local: ${transfer.localCand} · Remote: ${transfer.remoteCand}`}
              >
                {transfer.speed !== undefined && transfer.speed > 0 && (
                  <span className="text-primary font-bold mr-1.5 animate-pulse font-sans">
                    ⚡ {formatBytes(transfer.speed)}/s
                  </span>
                )}
                {transfer.networkType === "wifi"
                  ? "⚡ Gigabit speed · Free local data usage"
                  : "🔒 End-to-end route"}
              </span>
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5 animate-fade-in">
          <button
            onClick={async (e) => {
              e.stopPropagation();
              const link = `${window.location.origin}/receive/${session.id}`;
              try {
                await navigator.clipboard.writeText(link);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              } catch (_) {
                console.warn("Share link copy failed.");
              }
            }}
            className="rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary px-2.5 py-1 text-xs font-medium transition flex items-center gap-1 shrink-0"
            title="Copy share link"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Share</span>
              </>
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExtend();
            }}
            className="rounded-lg p-2 text-muted-foreground transition hover:bg-primary/10 hover:text-primary shrink-0"
            aria-label="Reset inactivity timer"
            title="Reset inactivity timer"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRevoke();
            }}
            className="rounded-lg p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive shrink-0"
            aria-label="Revoke share"
            title="Revoke share"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function SharePanel({
  session,
  now,
  transfer,
  activeBlip,
  onExtend,
}: {
  session: ShareSession | null;
  now: number;
  transfer?: TransferState;
  activeBlip: number;
  onExtend: () => void;
}) {
  const [verified, setVerified] = useState(false);
  const activeRecent = Date.now() - activeBlip < 1500;
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const link = useMemo(() => {
    if (!session || typeof window === "undefined") return "";
    return `${window.location.origin}/receive/${session.id}`;
  }, [session]);

  useEffect(() => {
    if (!link) {
      setQrDataUrl(null);
      return;
    }
    QRCode.toDataURL(link, {
      width: 360,
      margin: 1,
      color: { dark: "#ffffff", light: "#00000000" },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [link]);

  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* noop */
    }
  };

  if (!session) {
    return (
      <div className="rounded-3xl border border-border/60 bg-card/30 p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <QrCode className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No share selected</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Drop a file to generate a QR code and one-time link.
        </p>
      </div>
    );
  }

  const remaining = Math.max(0, expiresAt(session) - now);
  const expired = isExpired(session, now);
  const transferring = transfer?.status === "transferring";
  const delivered = transfer?.status === "delivered";
  const xferPct = transfer ? Math.round((transfer.sent / Math.max(1, transfer.total)) * 100) : 0;

  return (
    <div className="overflow-hidden rounded-3xl border border-border/60 bg-gradient-surface shadow-soft">
      <div className="border-b border-border/40 p-5">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Share session
            </p>
            <h3 className="mt-1 truncate text-lg font-semibold">{session.name}</h3>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              expired
                ? "bg-destructive/15 text-destructive"
                : delivered
                  ? "bg-success/15 text-success"
                  : "bg-success/15 text-success"
            }`}
          >
            {expired ? "Destroyed" : delivered ? "Delivered" : "Live"}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="relative mx-auto flex aspect-square w-full max-w-xs items-center justify-center rounded-2xl border border-border/60 bg-background/60 p-4">
          {qrDataUrl && !expired ? (
            <img
              src={qrDataUrl}
              alt="QR code to receive file"
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="text-center text-sm text-muted-foreground">
              {expired ? "This share has self-destructed." : "Generating QR…"}
            </div>
          )}
          {!expired && (
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-primary/20" />
          )}
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Point any phone's camera at the QR — no app needed.
        </p>

        {qrDataUrl && !expired && (
          <button
            onClick={() => {
              const a = document.createElement("a");
              a.href = qrDataUrl;
              a.download = `cleardrop-qr-${session.id}.png`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }}
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-card/60 px-4 py-2 text-xs font-semibold hover:bg-card hover:text-foreground transition text-muted-foreground cursor-pointer"
            id="download-qr-btn"
          >
            <Download className="h-3.5 w-3.5" /> Download QR as Image
          </button>
        )}

        <div className="mt-5 flex items-center gap-2 rounded-xl border border-border bg-background/60 p-2">
          <span className="truncate pl-2 font-mono text-xs text-muted-foreground">{link}</span>
          <button
            onClick={copy}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-gradient-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-95"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> Copy
              </>
            )}
          </button>
        </div>

        {/* Activity blip */}
        {activeRecent && (
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-primary">
            <Activity className="h-3.5 w-3.5 animate-pulse" />
            Activity detected — inactivity timer reset
          </div>
        )}

        {/* SAS verification */}
        {transfer?.sas && (
          <div
            className={`mt-5 rounded-2xl border p-4 ${verified ? "border-success/40 bg-success/5" : "border-primary/40 bg-primary/5"}`}
          >
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" /> Session security code
            </div>
            <div className="mt-2 flex items-center justify-center gap-3 text-3xl">
              {transfer.sas.map((e, i) => (
                <span key={i} className="select-none">
                  {e}
                </span>
              ))}
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Read these emoji to the receiver. If their screen shows the same code, the channel is
              end-to-end secure.
            </p>
            {!verified && (
              <button
                onClick={() => setVerified(true)}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                <CheckCircle2 className="h-4 w-4" /> Codes match
              </button>
            )}
          </div>
        )}

        {/* Reconnect / resume info */}
        {transfer && (transfer.reconnects || transfer.resumedFrom) ? (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-400">
            <RefreshCw className="h-3.5 w-3.5" />
            {transfer.resumedFrom
              ? `Resumed from ${formatBytes(transfer.resumedFrom)} — no restart needed.`
              : `Reconnected ${transfer.reconnects}× — keeping the transfer alive.`}
          </div>
        ) : null}

        {/* Live transfer status */}
        {(transferring || delivered) && (
          <div className="mt-5 rounded-xl border border-border/60 bg-background/60 p-3 animate-progress-appear">
            <div className="flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Radio
                  className={`h-3 w-3 ${
                    transferring ? "animate-pulse text-primary" : "text-success"
                  }`}
                />
                {delivered ? "Delivered" : "Sending peer-to-peer"}
              </span>
              <span className="font-mono text-muted-foreground flex items-center gap-2">
                {transferring && transfer.speed !== undefined && transfer.speed > 0 && (
                  <span className="text-primary font-semibold font-sans animate-pulse mr-1">
                    {formatBytes(transfer.speed)}/s
                  </span>
                )}
                {Math.min(100, xferPct)}%
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-background">
              <div
                className="h-full rounded-full bg-gradient-primary transition-all"
                style={{ width: `${Math.min(100, xferPct)}%` }}
              />
            </div>
            {transferring && transfer.rtt !== undefined && (
              <div className="mt-2.5 flex items-center justify-between text-[10px] text-muted-foreground pt-1.5 border-t border-border/10 select-none">
                <span>Latency (round-trip):</span>
                <span className="flex items-center gap-1">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${transfer.rtt < 50 ? "bg-emerald-500" : transfer.rtt < 150 ? "bg-teal-500" : transfer.rtt < 300 ? "bg-amber-500" : "bg-red-500"}`}
                  />
                  <strong className="font-mono text-foreground">
                    {Math.round(transfer.rtt)}ms
                  </strong>
                </span>
              </div>
            )}
          </div>
        )}

        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <Stat
            label="Self-destruct in"
            value={formatCountdown(remaining)}
            tone={remaining < 60_000 && remaining > 0 ? "warn" : "default"}
          />
          <Stat label="Downloads" value={`${session.downloads}/${session.maxDownloads}`} />
          <Stat
            label="Password"
            value={session.password ? "On" : "Off"}
            tone={session.password ? "success" : "default"}
          />
        </div>

        <button
          onClick={onExtend}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card/40 px-3 py-2 text-xs font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reset inactivity timer
        </button>

        <div className="mt-5 rounded-xl border border-border/50 bg-background/40 p-3 text-xs text-muted-foreground">
          <p className="flex items-start gap-1.5">
            <Smartphone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <span>
              <span className="text-foreground">Keep this tab open.</span> The file lives in your
              browser memory and streams peer-to-peer when the receiver connects. The countdown
              resets every time someone opens the link.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "warn" | "success" | "default";
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-background/40 p-3">
      <p
        className={`font-mono text-sm ${
          tone === "warn"
            ? "text-destructive"
            : tone === "success"
              ? "text-success"
              : "text-foreground"
        }`}
      >
        {value}
      </p>
      <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}
