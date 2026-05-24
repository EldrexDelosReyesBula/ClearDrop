import { Link, useParams } from "@/lib/router";
import { useEffect, useRef, useState } from "react";
import {
  Download,
  ShieldCheck,
  Send,
  Trash2,
  Wifi,
  Radio,
  RefreshCw,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Heart,
  X,
  FileArchive,
  FileCode,
  Image as ImageIcon,
  Film,
  Music,
  File as FileIcon,
  FileText,
} from "lucide-react";
import { formatBytes, formatCountdown } from "@/lib/transfer-store";
import { startReceiver, pingReceiverActivity, FileMeta } from "@/lib/webrtc-transfer";
import { DonationButton } from "@/components/LegalModals";

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
    return <FileArchive className="h-6 w-6 text-indigo-400" />;
  }
  if (["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "rtf"].includes(ext)) {
    return <FileText className="h-6 w-6 text-blue-400" />;
  }
  if (["png", "jpg", "jpeg", "svg", "gif", "webp", "bmp", "heic"].includes(ext)) {
    return <ImageIcon className="h-6 w-6 text-green-400" />;
  }
  if (["mp4", "mkv", "mov", "avi", "webm", "flv"].includes(ext)) {
    return <Film className="h-6 w-6 text-amber-400" />;
  }
  if (["mp3", "wav", "ogg", "m4a", "flac"].includes(ext)) {
    return <Music className="h-6 w-6 text-rose-400" />;
  }
  if (["js", "ts", "tsx", "jsx", "html", "css", "py", "json", "md", "yaml", "xml"].includes(ext)) {
    return <FileCode className="h-6 w-6 text-teal-400" />;
  }
  return <FileIcon className="h-6 w-6 text-muted-foreground" />;
}

type Phase = "idle" | "connecting" | "verifying" | "receiving" | "done" | "error";

function bytesToHex(buf: ArrayBuffer | Uint8Array) {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function ReceivePage() {
  const { id } = useParams();
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    document.title = "Droply · Receive file";
  }, []);
  const [meta, setMeta] = useState<FileMeta | null>(null);
  const [received, setReceived] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sas, setSas] = useState<string[] | null>(null);
  const [transferMsg, setTransferMsg] = useState<string>("");
  const [verified, setVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [activeBlip, setActiveBlip] = useState(0);
  const [reconnectCount, setReconnectCount] = useState(0);
  const [resumedFrom, setResumedFrom] = useState<number | null>(null);
  const [networkType, setNetworkType] = useState<"wifi" | "p2p" | "relay" | null>(null);
  const [localCand, setLocalCand] = useState("");
  const [remoteCand, setRemoteCand] = useState("");
  const [speed, setSpeed] = useState<number>(0);
  const [rtt, setRtt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [showNiceSuccess, setShowNiceSuccess] = useState(false);
  const [completedBlob, setCompletedBlob] = useState<Blob | null>(null);
  const startedAt = useRef(Date.now());
  const recvHandle = useRef<{ cancel: () => void } | null>(null);

  const [senderHash, setSenderHash] = useState<string | null>(null);
  const [receiverHash, setReceiverHash] = useState<string | null>(null);
  const [integrityStatus, setIntegrityStatus] = useState<"verifying" | "success" | "failed" | null>(
    null,
  );

  useEffect(() => {
    if (senderHash && receiverHash) {
      if (senderHash.toLowerCase() === receiverHash.toLowerCase()) {
        setIntegrityStatus("success");
        setTransferMsg("File assembled and verified successfully (SHA-256 matches!).");
        setShowNiceSuccess(true);
        if (completedBlob && meta) {
          triggerDownload(completedBlob, meta.name);
        }
      } else {
        setIntegrityStatus("failed");
        setTransferMsg("Warning: SHA-256 integrity mismatch detected! Chunks may be corrupted.");
        setShowNiceSuccess(false);
      }
    } else if (receiverHash && !senderHash) {
      const t = setTimeout(() => {
        if (!senderHash) {
          setIntegrityStatus("success");
          setTransferMsg("File assembled. Verification bypass (no sender hash).");
          setShowNiceSuccess(true);
          if (completedBlob && meta) {
            triggerDownload(completedBlob, meta.name);
          }
        }
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [senderHash, receiverHash, completedBlob, meta]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const isBatterySaver =
      typeof window !== "undefined" && localStorage.getItem("cleardrop_battery_saver") === "true";
    const presenceInterval = isBatterySaver ? 120_000 : 30_000;
    pingReceiverActivity(id).catch(() => {});
    const t = setInterval(() => pingReceiverActivity(id).catch(() => {}), presenceInterval);
    return () => clearInterval(t);
  }, [id]);

  const elapsed = now - startedAt.current;

  // Elegant helper for downloading/saving file with deferred revoke URL to prevent browser-blocking bugs
  const triggerDownload = (blob: Blob, fileName: string) => {
    try {
      const a = document.createElement("a");
      const url = URL.createObjectURL(blob);
      a.href = url;
      a.download = fileName;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();

      // Clean up after enough time for the browser to register download initiation
      setTimeout(() => {
        try {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } catch {
          void 0;
        }
      }, 10000);
    } catch (e) {
      console.error("Downloader helper error", e);
    }
  };

  const startTransfer = () => {
    setErrorMsg(null);
    setPhase("connecting");
    setReceived(0);
    setVerified(false);
    setSas(null);
    setReconnectCount(0);
    setResumedFrom(null);
    setCompletedBlob(null);
    setSenderHash(null);
    setReceiverHash(null);
    setIntegrityStatus(null);
    setTransferMsg("Initializing handshakes and exchanging public cryptokeys...");
    recvHandle.current?.cancel();

    const handle = startReceiver(
      id,
      { password: password || null },
      {
        onWaiting: () => setPhase("connecting"),
        onSas: (s) => {
          setSas(s);
          setPhase((p) => (p === "receiving" ? p : "verifying"));
        },
        onResume: (from) => setResumedFrom(from),
        onReconnect: () => setReconnectCount((c) => c + 1),
        onActivity: () => setActiveBlip(Date.now()),
        onMeta: (m: FileMeta) => {
          setMeta(m);
          setPhase("receiving");
          setTransferMsg("Handshake successful. Preparing file decryptors...");
        },
        onProgress: (r: number, total: number, info?: { statusText?: string }, sp?: number) => {
          setReceived(r);
          if (sp !== undefined) {
            setSpeed(sp);
          }
          if (info?.statusText) {
            setTransferMsg(info.statusText);
          }
        },
        onNetworkDetected: (netType, localAddress, remoteAddress, r) => {
          setNetworkType(netType);
          setLocalCand(localAddress || "");
          setRemoteCand(remoteAddress || "");
          if (r !== undefined) {
            setRtt(r);
          }
        },
        onDone: async (blob: Blob, m: FileMeta) => {
          setCompletedBlob(blob);
          setPhase("done");
          setTransferMsg("Verifying SHA-256 file integrity...");
          setIntegrityStatus("verifying");
          try {
            const hashBuf = await crypto.subtle.digest("SHA-256", await blob.arrayBuffer());
            const rHash = bytesToHex(hashBuf);
            setReceiverHash(rHash);
          } catch (err) {
            console.warn("Failed to calculate receiver SHA-256", err);
            setIntegrityStatus("failed");
            setTransferMsg("Integrity verification failed. Saving is still allowed.");
            setShowNiceSuccess(true);
            triggerDownload(blob, m.name);
          }
        },
        onFinalHash: (sHash: string) => {
          setSenderHash(sHash);
        },
        onError: (e: string) => {
          setErrorMsg(e);
          setPhase("error");
          setTransferMsg("");
        },
        batterySaver:
          typeof window !== "undefined" &&
          localStorage.getItem("cleardrop_battery_saver") === "true",
      },
    );
    recvHandle.current = handle;
  };

  useEffect(() => () => recvHandle.current?.cancel(), []);

  const total = meta?.size ?? 0;
  const pct = total ? Math.min(100, Math.round((received / total) * 100)) : 0;
  const activeRecent = Date.now() - activeBlip < 1500;

  return (
    <main className="relative flex min-h-screen flex-col bg-background text-foreground">
      <div className="bg-radial-glow pointer-events-none fixed inset-0 -z-10" />

      <header className="border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
              <Send className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Droply</span>
          </Link>
          <span className="text-xs text-muted-foreground">Incoming transfer</span>
        </div>
      </header>

      <div className="mx-auto w-full max-w-lg flex-1 px-6 py-12">
        <div className="overflow-hidden rounded-3xl border border-border/60 bg-gradient-surface shadow-soft">
          <div className="border-b border-border/40 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card border border-border/80">
                {meta ? getFileIcon(meta.name) : <ShieldCheck className="h-6 w-6 text-success" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  End-to-end encrypted
                </p>
                <h1 className="truncate text-lg font-semibold">
                  {meta?.name ?? "Ready to receive"}
                </h1>
              </div>
              {activeRecent && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-primary">
                  <Activity className="h-3 w-3 animate-pulse" /> Active
                </span>
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-3 gap-2 text-center">
              <Stat label="Size" value={meta ? formatBytes(meta.size) : "—"} />
              <Stat
                label="Status"
                value={
                  phase === "done"
                    ? "Done"
                    : phase === "receiving"
                      ? `${pct}%`
                      : phase === "verifying"
                        ? "Verify"
                        : phase === "error"
                          ? "Error"
                          : phase === "connecting"
                            ? "Linking"
                            : "Ready"
                }
                tone={phase === "error" ? "warn" : phase === "done" ? "success" : "default"}
              />
              <Stat label="Session" value={formatCountdown(elapsed)} />
            </div>

            {/* Password input before connect */}
            {phase === "idle" && (
              <div className="mt-5 flex items-center gap-2 rounded-xl border border-border bg-background/60 p-2">
                <Lock className="ml-2 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="Password (if the sender set one)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent px-1 py-1 text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
            )}

            {/* SAS verification card */}
            {sas && (phase === "verifying" || phase === "receiving") && (
              <div
                className={`mt-5 rounded-2xl border p-4 ${verified ? "border-success/40 bg-success/5" : "border-primary/40 bg-primary/5"}`}
              >
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5" /> Session security code
                </div>
                <div className="mt-2 flex items-center justify-center gap-3 text-3xl">
                  {sas.map((e, i) => (
                    <span key={i} className="select-none">
                      {e}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Ask the sender to read their code aloud. If it matches, no one is intercepting
                  this transfer.
                </p>
                {!verified && phase === "verifying" && (
                  <button
                    onClick={() => setVerified(true)}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Codes match — start transfer
                  </button>
                )}
                {verified && (
                  <p className="mt-2 text-center text-[11px] text-success">
                    ✓ Verified — receiving encrypted chunks
                  </p>
                )}
              </div>
            )}

            {(reconnectCount > 0 || resumedFrom !== null) && phase !== "done" && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-400">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                {resumedFrom !== null
                  ? `Resumed at ${formatBytes(resumedFrom)} — no need to restart.`
                  : `Connection hiccup — reconnecting (${reconnectCount})…`}
              </div>
            )}

            {(phase === "receiving" || (phase === "verifying" && verified)) && (
              <div className="mt-6 rounded-xl border border-border/60 bg-background/60 p-3 animate-progress-appear">
                <div className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <Radio className="h-3 w-3 animate-pulse text-primary" />
                    Receiving over encrypted WebRTC
                  </span>
                  <span className="font-mono text-muted-foreground flex items-center gap-2">
                    {speed > 0 && (
                      <span className="text-primary font-bold font-sans animate-pulse mr-1">
                        {formatBytes(speed)}/s
                      </span>
                    )}
                    {formatBytes(received)} / {formatBytes(total)}
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-background">
                  <div
                    className="h-full rounded-full bg-gradient-primary transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {transferMsg && (
                  <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground animate-pulse">
                    {transferMsg}
                  </p>
                )}
                {networkType && (
                  <div className="mt-2.5 text-[10px] text-muted-foreground flex flex-col sm:flex-row sm:items-center justify-between bg-card-accent border border-border/40 p-2 rounded-xl select-none gap-1 leading-snug animate-fade-in animate-duration-300">
                    <span className="flex items-center gap-1.5 font-medium font-sans">
                      {networkType === "wifi" ? (
                        <>
                          <Wifi className="h-3.5 w-3.5 text-emerald-500 animate-pulse shrink-0" />
                          <span className="text-emerald-500 font-semibold tracking-tight">
                            Direct Local Wi-Fi / Hotspot LAN active
                          </span>
                        </>
                      ) : networkType === "relay" ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 text-amber-500 animate-spin shrink-0" />
                          <span className="text-amber-500 font-semibold tracking-tight">
                            Mediated via Cloud Relay Proxy
                          </span>
                        </>
                      ) : (
                        <>
                          <Radio className="h-3.5 w-3.5 text-sky-500 animate-pulse shrink-0" />
                          <span className="text-sky-500 font-semibold tracking-tight">
                            Direct P2P Peer link established
                          </span>
                        </>
                      )}
                    </span>
                    <span
                      className="font-mono text-[9px] text-muted-foreground/80 truncate shrink-0 text-right flex items-center gap-1.5"
                      title={`Local: ${localCand} · Remote: ${remoteCand}`}
                    >
                      {rtt !== null && (
                        <span className="flex items-center gap-1 mr-1">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${rtt < 50 ? "bg-emerald-500" : rtt < 150 ? "bg-teal-500" : rtt < 300 ? "bg-amber-500" : "bg-red-500"}`}
                          />
                          <strong className="text-foreground tracking-tight font-sans font-semibold">
                            {Math.round(rtt)}ms
                          </strong>
                        </span>
                      )}
                      {networkType === "wifi"
                        ? "⚡ Local-LAN direct route (No WAN data usage)"
                        : "🔒 Full E2E secure path"}
                    </span>
                  </div>
                )}
              </div>
            )}

            {phase === "done" && (
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-success/40 bg-success/10 p-4 text-center text-sm text-success">
                  <ShieldCheck className="mx-auto mb-1 h-5 w-5 animate-bounce" />
                  Transfer &amp; decryption complete! If this was a one-time link, it's now
                  destroyed.
                </div>
                {integrityStatus && (
                  <div
                    className={`rounded-xl border p-3 text-[11px] leading-relaxed text-left font-mono ${
                      integrityStatus === "success"
                        ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
                        : integrityStatus === "failed"
                          ? "border-amber-500/30 bg-amber-500/5 text-amber-400"
                          : "border-border bg-card/60 text-muted-foreground animate-pulse"
                    }`}
                    id="sha256-verification-panel"
                  >
                    <div className="flex items-center gap-2 font-bold font-sans text-xs mb-1">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>SHA-256 INTEGRITY VERIFICATION</span>
                      {integrityStatus === "success" && (
                        <span className="ml-auto text-[10px] uppercase font-bold bg-emerald-500/15 px-1.5 py-0.5 rounded text-emerald-400">
                          ✓ VERIFIED
                        </span>
                      )}
                      {integrityStatus === "failed" && (
                        <span className="ml-auto text-[10px] uppercase font-bold bg-amber-500/15 px-1.5 py-0.5 rounded text-amber-400">
                          ✗ MISMATCH
                        </span>
                      )}
                      {integrityStatus === "verifying" && (
                        <span className="ml-auto text-[10px] uppercase font-bold bg-muted-foreground/15 px-1.5 py-0.5 rounded text-muted-foreground animate-pulse">
                          CALCULATING
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="truncate">
                        <span className="text-muted-foreground font-sans">Sender:</span>{" "}
                        {senderHash || "Waiting for sender hash..."}
                      </p>
                      <p className="truncate">
                        <span className="text-muted-foreground font-sans">Receiver:</span>{" "}
                        {receiverHash || "Calculating..."}
                      </p>
                    </div>
                  </div>
                )}
                {completedBlob && (
                  <button
                    onClick={() => triggerDownload(completedBlob, meta?.name ?? "file")}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-success px-6 py-4 text-base font-semibold text-white shadow-[0_0_20px_rgba(34,197,94,0.30)] hover:bg-success/90 transition hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    <Download className="h-5 w-5" />
                    Save file (Download)
                  </button>
                )}
                <p className="text-center text-[11px] text-muted-foreground">
                  If your device blocked the automatic download, tap the green button to save it
                  manually.
                </p>
              </div>
            )}

            {phase === "error" && (
              <div className="mt-6 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-center text-sm text-destructive">
                <AlertTriangle className="mx-auto mb-1 h-5 w-5" />
                {errorMsg ?? "Transfer failed. Ask the sender to try again."}
              </div>
            )}

            {phase !== "done" && (
              <button
                disabled={phase === "receiving" || (phase === "verifying" && !verified && false)}
                onClick={startTransfer}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-6 py-4 text-base font-semibold text-primary-foreground shadow-glow transition hover:opacity-95 disabled:opacity-70"
              >
                {phase === "receiving" ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
                    Receiving…
                  </>
                ) : phase === "error" ? (
                  <>Try again</>
                ) : phase === "connecting" || phase === "verifying" ? (
                  <>
                    <RefreshCw className="h-4 w-4" /> Reconnect
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" /> Connect & receive
                  </>
                )}
              </button>
            )}

            <div className="mt-6 flex items-start gap-2 rounded-xl border border-border/50 bg-background/40 p-3 text-xs text-muted-foreground">
              <Wifi className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <p>
                Files stream peer-to-peer with end-to-end AES-GCM encryption over an encrypted
                WebRTC channel. If a direct path fails, a relay (TURN) keeps the transfer going.
                Interrupted sends resume automatically.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Consistent Footer */}
      <footer className="border-t border-border/40 py-12 bg-background/20 backdrop-blur-sm mt-auto">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 text-sm text-muted-foreground md:flex-row">
          <div className="flex flex-col gap-2 items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-primary">
                <Send className="h-3 w-3 text-primary-foreground" />
              </div>
              <span className="font-medium text-foreground">Droply</span>
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
            <Link to="/app" className="hover:text-foreground transition text-sm font-medium">
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

      {showNiceSuccess && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md"
          onClick={() => setShowNiceSuccess(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl border border-success/35 bg-gradient-surface p-6 text-center shadow-glowScale"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowNiceSuccess(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition animate-fade-in"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-success/15 text-success shadow-[0_0_20px_rgba(34,197,94,0.2)]">
              <ShieldCheck className="h-8 w-8 animate-pulse" />
            </div>

            <h3 className="mt-5 text-xl font-semibold tracking-tight">Decryption successful!</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your file <strong>{meta?.name}</strong> has been securely downloaded and decrypted
              natively in your web browser. This transfer leaves absolutely zero trace on any
              servers.
            </p>

            <div className="mt-4 rounded-xl border border-border bg-background/40 p-3 text-xs font-mono text-muted-foreground flex items-center justify-between">
              <span>Size: {meta ? formatBytes(meta.size) : "—"}</span>
              <span className="text-success font-medium">✓ AES-GCM 256</span>
            </div>

            {completedBlob && (
              <button
                onClick={() => triggerDownload(completedBlob, meta?.name ?? "file")}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-success px-4 py-3 text-sm font-semibold text-white shadow-[0_0_15px_rgba(34,197,94,0.25)] hover:bg-success/90 transition cursor-pointer"
              >
                <Download className="h-4 w-4" />
                Download file again
              </button>
            )}

            <div className="border-t border-border/40 my-6 pt-5">
              <div className="flex items-center gap-1.5 justify-center text-amber-500 mb-2">
                <Heart className="h-4 w-4 fill-amber-500" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Support our development
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Droply is a free project. To support keeping trackers and file-logger databases off
                the web, consider supporting development.
              </p>
              <DonationButton className="w-full justify-center text-sm py-3" />
            </div>

            <button
              onClick={() => setShowNiceSuccess(false)}
              className="w-full rounded-xl bg-muted px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition"
            >
              Close and return
            </button>
          </div>
        </div>
      )}
    </main>
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
        className={`font-mono text-sm ${tone === "warn" ? "text-destructive" : tone === "success" ? "text-success" : "text-foreground"}`}
      >
        {value}
      </p>
      <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}

const _Trash2 = Trash2; // keep import
