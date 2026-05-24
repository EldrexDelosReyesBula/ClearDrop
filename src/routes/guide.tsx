import { Link } from "@/lib/router";
import { useState, useEffect } from "react";
import {
  QrCode,
  Wifi,
  Bluetooth,
  Smartphone,
  ArrowLeft,
  ArrowRight,
  Send,
  Upload,
  ScanLine,
  Download,
  Camera,
  Radio,
  Settings,
  Share2,
  Link2,
  Menu,
  X,
} from "lucide-react";
import { DonationButton } from "@/components/LegalModals";

export default function GuidePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.title = "Droply · How to send a photo";
  }, []);

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <div className="bg-radial-glow pointer-events-none fixed inset-0 -z-10" />

      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-xl">
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
            <Link to="/guide" className="text-foreground font-semibold">
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
            <Link
              to="/app"
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90"
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

      <div className="mx-auto max-w-5xl px-6 py-14">
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
            Send a photo in 3 steps
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Pick the way that feels easiest.
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Three friendly walk-throughs. No accounts, no installs, no settings menus — just
            pictures and one button each.
          </p>
        </div>

        <div className="mt-14 space-y-10">
          <GuideSection
            tag="QR scan"
            color="primary"
            icon={QrCode}
            title="Scan the code with the other phone's camera"
            subtitle="Best when both phones are next to each other."
            steps={[
              {
                title: "Open Droply and drop the photo",
                body: "On the device that has the photo, open the app and drop the image into the big circle.",
                illo: <IlloDrop />,
              },
              {
                title: "Show the QR code",
                body: "A black-and-white square will appear on the right. Hold the screen up so it's visible.",
                illo: <IlloQrShow />,
              },
              {
                title: "Scan from the other phone",
                body: "On the other phone, open the camera app and point it at the QR. Tap the link that pops up.",
                illo: <IlloQrScan />,
              },
              {
                title: "Tap 'Receive file'",
                body: "The photo arrives in a few seconds. It then disappears from Droply automatically.",
                illo: <IlloReceive />,
              },
            ]}
          />

          <GuideSection
            tag="Wi-Fi or Hotspot"
            color="success"
            icon={Wifi}
            title="Both devices on the same Wi-Fi or hotspot"
            subtitle="Fastest for big photos and videos."
            steps={[
              {
                title: "Get both devices on the same network",
                body: "Either connect them to the same Wi-Fi, or turn on Personal Hotspot on one phone and connect the other to it.",
                illo: <IlloWifi />,
              },
              {
                title: "Drop the photo on the sender",
                body: "Open Droply on the device with the photo and drop it in.",
                illo: <IlloDrop />,
              },
              {
                title: "Open the link on the other device",
                body: "Tap 'Copy' and send the short link through any chat. Open it on the other device.",
                illo: <IlloLink />,
              },
              {
                title: "Tap 'Receive file'",
                body: "The photo streams across the local network — no cloud, no upload, no waiting.",
                illo: <IlloReceive />,
              },
            ]}
          />

          <GuideSection
            tag="Bluetooth"
            color="muted"
            icon={Bluetooth}
            title="Already paired over Bluetooth?"
            subtitle="Great when there's no Wi-Fi at all."
            steps={[
              {
                title: "Pair the two devices in settings",
                body: "Open Settings → Bluetooth on both phones. Tap the other one and accept the pairing prompt.",
                illo: <IlloBluetoothPair />,
              },
              {
                title: "Drop the photo on the sender",
                body: "Open Droply and drop the image in. A short link appears.",
                illo: <IlloDrop />,
              },
              {
                title: "Share that link via Bluetooth",
                body: "Use your phone's Share menu → Bluetooth and pick the paired device.",
                illo: <IlloBluetoothShare />,
              },
              {
                title: "Open the link on the other phone",
                body: "Tap 'Receive file'. The photo arrives over Wi-Fi if available, otherwise it falls back to the Bluetooth connection.",
                illo: <IlloReceive />,
              },
            ]}
          />
        </div>

        <div className="mt-16 rounded-3xl border border-border/60 bg-gradient-surface p-8 text-center shadow-soft">
          <h2 className="text-2xl font-semibold">Ready to send something?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Drop a photo in Droply and pick your favourite way to share.
          </p>
          <Link
            to="/app"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-95"
          >
            Open the web app
          </Link>
        </div>
      </div>

      {/* Consistent Footer */}
      <footer className="border-t border-border/40 py-12 bg-background/20 backdrop-blur-sm mt-16">
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
            <Link
              to="/guide"
              className="hover:text-foreground transition text-sm font-medium text-foreground font-semibold"
            >
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
    </main>
  );
}

function GuideSection({
  tag,
  color,
  icon: Icon,
  title,
  subtitle,
  steps,
}: {
  tag: string;
  color: "primary" | "success" | "muted";
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  steps: { title: string; body: string; illo: React.ReactNode }[];
}) {
  const tagBg =
    color === "primary"
      ? "bg-primary/15 text-primary"
      : color === "success"
        ? "bg-success/15 text-success"
        : "bg-muted text-muted-foreground";

  return (
    <section className="overflow-hidden rounded-3xl border border-border/60 bg-card/30 p-8 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tagBg}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${tagBg}`}
          >
            {tag}
          </span>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <ol className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {steps.map((step, i) => (
          <li
            key={i}
            className="relative flex flex-col rounded-2xl border border-border/60 bg-background/40 p-4"
          >
            <div className="relative flex h-36 items-center justify-center overflow-hidden rounded-xl bg-gradient-surface">
              {step.illo}
              <span className="absolute left-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {i + 1}
              </span>
            </div>
            <h3 className="mt-4 text-sm font-semibold">{step.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

// ---------------- Illustrations ----------------

function Phone({ children, tilt = 0 }: { children: React.ReactNode; tilt?: number }) {
  return (
    <div
      className="relative flex h-28 w-16 items-center justify-center rounded-[14px] border-2 border-border bg-background shadow-soft"
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <div className="absolute left-1/2 top-1.5 h-1 w-5 -translate-x-1/2 rounded-full bg-border" />
      <div className="flex h-full w-full flex-col items-center justify-center px-1.5 pt-3 text-primary">
        {children}
      </div>
    </div>
  );
}

function IlloDrop() {
  return (
    <div className="flex items-center gap-3">
      <Phone>
        <Upload className="h-5 w-5" />
        <div className="mt-1 h-1 w-8 rounded-full bg-primary/40" />
      </Phone>
      <div className="flex flex-col items-center gap-1">
        <Upload className="h-6 w-6 text-primary animate-pulse" />
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Drop</span>
      </div>
    </div>
  );
}

function IlloQrShow() {
  return (
    <div className="flex items-center gap-3">
      <Phone>
        <QrCode className="h-7 w-7" />
      </Phone>
      <Radio className="h-5 w-5 text-success animate-pulse" />
    </div>
  );
}

function IlloQrScan() {
  return (
    <div className="flex items-center gap-3">
      <Phone tilt={-6}>
        <QrCode className="h-6 w-6" />
      </Phone>
      <div className="flex flex-col items-center">
        <ScanLine className="h-6 w-6 text-primary" />
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Scan</span>
      </div>
      <Phone tilt={6}>
        <Camera className="h-5 w-5" />
        <div className="mt-1 h-1 w-8 rounded-full bg-primary/40" />
      </Phone>
    </div>
  );
}

function IlloReceive() {
  return (
    <div className="flex items-center gap-3">
      <Phone>
        <Download className="h-5 w-5" />
        <div className="mt-1 h-1 w-8 rounded-full bg-success" />
      </Phone>
      <div className="flex flex-col items-center gap-1">
        <Smartphone className="h-5 w-5 text-success" />
        <span className="text-[10px] uppercase tracking-wider text-success">Got it</span>
      </div>
    </div>
  );
}

function IlloWifi() {
  return (
    <div className="flex items-center gap-3">
      <Phone>
        <Wifi className="h-5 w-5" />
      </Phone>
      <div className="flex flex-col items-center">
        <Wifi className="h-7 w-7 text-primary" />
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Same Wi-Fi
        </span>
      </div>
      <Phone tilt={4}>
        <Wifi className="h-5 w-5" />
      </Phone>
    </div>
  );
}

function IlloLink() {
  return (
    <div className="flex items-center gap-3">
      <Phone>
        <Link2 className="h-5 w-5" />
      </Phone>
      <Share2 className="h-5 w-5 text-primary" />
      <Phone tilt={6}>
        <Link2 className="h-5 w-5" />
      </Phone>
    </div>
  );
}

function IlloBluetoothPair() {
  return (
    <div className="flex items-center gap-3">
      <Phone>
        <Settings className="h-5 w-5" />
        <Bluetooth className="mt-1 h-3 w-3" />
      </Phone>
      <Bluetooth className="h-6 w-6 text-primary" />
      <Phone tilt={4}>
        <Settings className="h-5 w-5" />
        <Bluetooth className="mt-1 h-3 w-3" />
      </Phone>
    </div>
  );
}

function IlloBluetoothShare() {
  return (
    <div className="flex items-center gap-3">
      <Phone>
        <Share2 className="h-5 w-5" />
      </Phone>
      <Bluetooth className="h-6 w-6 text-primary animate-pulse" />
      <Phone tilt={4}>
        <Download className="h-5 w-5" />
      </Phone>
    </div>
  );
}
