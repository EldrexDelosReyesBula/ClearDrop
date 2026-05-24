import { useNavigate, Link } from "@/lib/router";
import { useCallback, useRef, useState, useEffect } from "react";
import { makeId, putBlob, loadSessions, saveSessions, ShareSession } from "@/lib/transfer-store";
import {
  Upload,
  Share2,
  Send,
  Trash2,
  Wifi,
  Timer,
  Lock,
  QrCode,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  FileText,
  Image as ImageIcon,
  Film,
  Menu,
  X,
} from "lucide-react";
import { PrivacyModal, TermsModal, DonationButton } from "@/components/LegalModals";

function Nav({
  onOpenPrivacy,
  onOpenTerms,
}: {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
            <Send className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Droply</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <Link to="/features" className="transition hover:text-foreground">
            Features
          </Link>
          <Link to="/how" className="transition hover:text-foreground">
            How it works
          </Link>
          <Link to="/guide" className="transition hover:text-foreground">
            Guide
          </Link>
          <Link to="/privacy" className="transition hover:text-foreground">
            Privacy Policy
          </Link>
          <Link to="/terms" className="transition hover:text-foreground">
            Terms of Use
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <DonationButton />
          </div>
          <Link
            to="/app"
            className="hidden md:inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90"
          >
            Try free
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border/40 bg-card/40 text-muted-foreground hover:bg-card hover:text-foreground transition md:hidden cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border/40 md:hidden p-6 shadow-xl animate-fade-in">
          <nav className="flex flex-col gap-4 text-sm font-medium">
            <Link
              to="/features"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between text-muted-foreground hover:text-foreground transition py-2 border-b border-border/10"
            >
              <span>Features</span>
              <ArrowRight className="h-4 w-4 opacity-50" />
            </Link>
            <Link
              to="/how"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between text-muted-foreground hover:text-foreground transition py-2 border-b border-border/10"
            >
              <span>How it works</span>
              <ArrowRight className="h-4 w-4 opacity-50" />
            </Link>
            <Link
              to="/guide"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between text-muted-foreground hover:text-foreground transition py-2 border-b border-border/10"
            >
              <span>Guide</span>
              <ArrowRight className="h-4 w-4 opacity-50" />
            </Link>
            <Link
              to="/privacy"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between text-muted-foreground hover:text-foreground transition py-2 border-b border-border/10"
            >
              <span>Privacy Policy</span>
              <ArrowRight className="h-4 w-4 opacity-50" />
            </Link>
            <Link
              to="/terms"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between text-muted-foreground hover:text-foreground transition py-2 border-b border-border/10"
            >
              <span>Terms of Use</span>
              <ArrowRight className="h-4 w-4 opacity-50" />
            </Link>
            <div className="pt-4 flex flex-col gap-3">
              <DonationButton className="w-full justify-center" />
              <Link
                to="/app"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-semibold text-background transition hover:opacity-90"
              >
                Try Droply Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function FileCard({
  icon: Icon,
  name,
  meta,
  className = "",
  style,
}: {
  icon: React.ComponentType<{ className?: string }>;
  name: string;
  meta: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`absolute flex w-56 items-center gap-3 rounded-2xl border border-border/60 bg-card/80 p-3 shadow-soft backdrop-blur-md animate-float ${className}`}
      style={style}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">{meta}</p>
      </div>
      <div className="ml-auto h-2 w-2 rounded-full bg-success shadow-[0_0_10px_currentColor]" />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-24">
      <div className="bg-radial-glow absolute inset-0 -z-10" />
      <div className="absolute inset-x-0 top-20 -z-10 mx-auto h-[500px] max-w-3xl rounded-full bg-primary/10 blur-3xl" />

      <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Fast. Private. Temporary.
          </div>
          <h1 className="mt-6 text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
            Share files <br />
            <span className="text-gradient">instantly.</span> Securely.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-muted-foreground">
            Temporary file sharing designed for speed, privacy, and simplicity. No accounts. No
            tracking. Just clean, encrypted transfers that disappear when you're done.
          </p>

          <div className="mt-10 flex items-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-success" /> End-to-end encrypted
            </div>
            <div className="flex items-center gap-2">
              <EyeOff className="h-4 w-4 text-success" /> Zero tracking
            </div>
          </div>
        </div>

        {/* Visual */}
        <div className="relative mx-auto h-[520px] w-full max-w-lg">
          {/* Center node */}
          <div className="absolute left-1/2 top-1/2 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-3xl bg-gradient-primary shadow-glow">
            <Send className="h-12 w-12 text-primary-foreground" />
            <span className="absolute inset-0 -z-10 rounded-3xl bg-primary/40 animate-pulse-ring" />
            <span
              className="absolute inset-0 -z-10 rounded-3xl bg-primary/40 animate-pulse-ring"
              style={{ animationDelay: "1s" }}
            />
          </div>

          {/* connection lines */}
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 520" fill="none">
            <defs>
              <linearGradient id="ln" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="oklch(0.58 0.21 264)" stopOpacity="0.6" />
                <stop offset="100%" stopColor="oklch(0.58 0.21 264)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M70 80 Q200 260 200 260" stroke="url(#ln)" strokeWidth="1.5" />
            <path d="M340 90 Q200 260 200 260" stroke="url(#ln)" strokeWidth="1.5" />
            <path d="M60 440 Q200 260 200 260" stroke="url(#ln)" strokeWidth="1.5" />
            <path d="M350 450 Q200 260 200 260" stroke="url(#ln)" strokeWidth="1.5" />
          </svg>

          <FileCard
            icon={ImageIcon}
            name="sunset-trip.jpg"
            meta="4.2 MB · 02:14"
            className="left-0 top-4"
            style={{ "--r": "-3deg" } as React.CSSProperties}
          />
          <FileCard
            icon={FileText}
            name="contract.pdf"
            meta="318 KB · 04:58"
            className="right-0 top-10"
            style={{ "--r": "4deg", animationDelay: "1.2s" } as React.CSSProperties}
          />
          <FileCard
            icon={Film}
            name="demo-reel.mp4"
            meta="22 MB · 00:42"
            className="left-2 bottom-8"
            style={{ "--r": "2deg", animationDelay: "2.1s" } as React.CSSProperties}
          />
          <FileCard
            icon={QrCode}
            name="Device · iPhone"
            meta="LAN · paired"
            className="right-0 bottom-16"
            style={{ "--r": "-2deg", animationDelay: "0.6s" } as React.CSSProperties}
          />
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: Wifi,
    title: "Local Sharing",
    desc: "Browser-to-browser transfers over your network. No installs, no friction.",
  },
  {
    icon: Timer,
    title: "Self-Destruct Links",
    desc: "Choose 5 min, 30 min, 1 hour, or custom. Files vanish when time's up.",
  },
  {
    icon: Lock,
    title: "Encrypted Transfers",
    desc: "End-to-end encryption with optional password protection on every share.",
  },
  {
    icon: QrCode,
    title: "QR Connect",
    desc: "Scan to pair devices and beam files instantly across screens.",
  },
  {
    icon: EyeOff,
    title: "No Tracking",
    desc: "No analytics, no profiles, no logs. Your files stay yours.",
  },
  {
    icon: ShieldCheck,
    title: "One-Time Download",
    desc: "Auto-deletes after the first download. Share once and move on.",
  },
];

function Features() {
  return (
    <section id="features" className="relative py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Features</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            Everything you need.
            <br />
            Nothing you don't.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Droply is intentionally light — just the essentials for fast, secure transfers.
          </p>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur transition hover:border-primary/40 hover:bg-card/60"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary/20">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/10 opacity-0 blur-2xl transition group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  { icon: Upload, title: "Upload", desc: "Drop a file into the dropzone." },
  { icon: Share2, title: "Share", desc: "Generate a link or scan a QR code." },
  { icon: Send, title: "Transfer", desc: "Encrypted delivery in seconds." },
  { icon: Trash2, title: "Auto Delete", desc: "Gone after download or expiry." },
];

function HowItWorks() {
  return (
    <section id="how" className="relative py-28">
      <div className="absolute inset-x-0 top-0 -z-10 mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
            How it works
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            Four steps. That's it.
          </h2>
        </div>

        <div className="relative mt-16 grid gap-6 md:grid-cols-4">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="relative rounded-2xl border border-border/60 bg-gradient-surface p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <s.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-mono text-muted-foreground">0{i + 1}</span>
              </div>
              <h3 className="mt-6 text-lg font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Dropzone() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const TTL_OPTIONS = [
    { label: "5 min", ms: 5 * 60 * 1000 },
    { label: "30 min", ms: 30 * 60 * 1000 },
    { label: "1 hour", ms: 60 * 60 * 1000 },
    { label: "Custom", ms: 24 * 60 * 60 * 1000 },
  ];
  const [ttlMs, setTtlMs] = useState(TTL_OPTIONS[1].ms);

  const processFiles = useCallback(
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
          maxDownloads: 9999, // unlimited by default on landing
          downloads: 0,
          status: "ready",
        });
      });
      const existing = loadSessions();
      saveSessions([...additions, ...existing]);
      navigate({ to: "/app" });
    },
    [ttlMs, navigate],
  );

  useEffect(() => {
    const handleGlobalDragOver = (e: DragEvent) => {
      e.preventDefault();
    };
    const handleGlobalDrop = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    };
    window.addEventListener("dragover", handleGlobalDragOver);
    window.addEventListener("drop", handleGlobalDrop);
    return () => {
      window.removeEventListener("dragover", handleGlobalDragOver);
      window.removeEventListener("drop", handleGlobalDrop);
    };
  }, [processFiles]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setDragging(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      processFiles(e.dataTransfer.files);
    },
    [processFiles],
  );

  const onClickZone = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      processFiles(e.target.files);
    },
    [processFiles],
  );

  return (
    <section id="app" className="relative py-28 select-none">
      <div className="mx-auto max-w-4xl px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-surface p-10 shadow-soft md:p-16">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-success/10 blur-3xl" />

          <div className="relative text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-primary">Try it</p>
            <h2 className="mt-3 text-3xl font-semibold md:text-4xl">Drop a file to begin.</h2>

            <input
              type="file"
              ref={fileInputRef}
              onChange={onFileChange}
              className="hidden"
              multiple
            />

            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={onClickZone}
              className={`mt-10 cursor-pointer rounded-2xl border-2 border-dashed p-12 transition ${
                dragging
                  ? "border-primary bg-primary/10 shadow-glowScale"
                  : "border-border bg-background/40 hover:border-primary/60 hover:bg-background/60"
              }`}
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
                <Upload className="h-7 w-7 text-primary-foreground" />
              </div>
              <p className="mt-5 text-base font-medium">
                Drag & drop, or <span className="text-primary">browse</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Up to 2 GB · Encrypted in your browser
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
              {TTL_OPTIONS.map((o) => (
                <button
                  key={o.label}
                  onClick={() => setTtlMs(o.ms)}
                  className={`rounded-full border px-3 py-1.5 transition ${
                    ttlMs === o.ms
                      ? "border-primary/60 bg-primary/15 text-foreground font-medium"
                      : "border-border bg-card/40 hover:bg-card hover:text-foreground"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Privacy() {
  return (
    <section id="privacy" className="relative py-28">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Privacy</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            Privacy without complexity.
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Droply is designed to transfer files — not collect your data. No accounts. No analytics.
            No hidden profiles. Just a clean conduit between you and the person on the other side.
          </p>
          <ul className="mt-8 space-y-4 text-sm">
            {[
              "End-to-end encrypted transport",
              "Encrypted temporary storage",
              "Optional password protection",
              "Automatic deletion on download or expiry",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success/15 text-success">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </span>
                <span className="text-foreground/90">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="rounded-3xl border border-border/60 bg-card/40 p-8 backdrop-blur shadow-soft">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/15 text-success">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Secure transfer</p>
                  <p className="text-xs text-muted-foreground">contract.pdf · 318 KB</p>
                </div>
              </div>
              <span className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium text-success">
                Encrypted
              </span>
            </div>

            <div className="mt-6">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-background">
                <div
                  className="h-full w-3/4 rounded-full bg-gradient-primary"
                  style={{
                    backgroundSize: "200% 100%",
                    animation: "shimmer 2s linear infinite",
                  }}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>Transferring…</span>
                <span>74%</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Expires", value: "04:58" },
                { label: "Downloads", value: "0 / 1" },
                { label: "Devices", value: "2" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-border/50 bg-background/40 p-3"
                >
                  <p className="font-mono text-base">{s.value}</p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute -inset-4 -z-10 rounded-3xl bg-primary/10 blur-3xl" />
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-4xl font-semibold tracking-tight md:text-6xl">
          Share without limits.
          <br />
          <span className="text-gradient">Keep your privacy.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
          Open Droply in your browser and send your first file in seconds.
        </p>
        <a
          href="/app"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-95"
        >
          Try free <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}

function Footer({
  onOpenPrivacy,
  onOpenTerms,
}: {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}) {
  return (
    <footer className="border-t border-border/40 py-12">
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
  );
}

export default function Index() {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    document.title = "Droply — Fast, Private, Temporary Encrypted File Sharing";
  }, []);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <Nav onOpenPrivacy={() => setShowPrivacy(true)} onOpenTerms={() => setShowTerms(true)} />
      <Hero />
      <Features />
      <HowItWorks />
      <Dropzone />
      <Privacy />
      <CTA />
      <Footer onOpenPrivacy={() => setShowPrivacy(true)} onOpenTerms={() => setShowTerms(true)} />

      <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </main>
  );
}
