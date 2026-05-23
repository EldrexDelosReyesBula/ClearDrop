import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Send,
  Wifi,
  Timer,
  Lock,
  QrCode,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  BookOpen,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { PrivacyModal, TermsModal, DonationButton } from "@/components/LegalModals";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "ClearDrop — Advanced Features for Ultra-Secure File Transfer" },
      {
        name: "description",
        content:
          "Experience the list of our security-hardened file exchange highlights. Includes automated self-destruction, password-gated handshakes, local LAN pairing, and no IP trackers.",
      },
      {
        name: "keywords",
        content:
          "secure online transfer features, self destruct link sharing, device qr connect, no tracker file sharing, private download buffer",
      },
      { property: "og:title", content: "ClearDrop — Core Security Sharing Features" },
      {
        property: "og:description",
        content:
          "All features of ClearDrop are focused purely around speed, secure storage isolation, and zero logs tracking. Read details here.",
      },
      { name: "robots", content: "index, follow" },
    ],
  }),
  component: FeaturesPage,
});

function FeaturesPage() {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const featureCards = [
    {
      icon: Wifi,
      title: "Local LAN Coordination",
      desc: "Fastest-possible local transfers. If devices share the same network (e.g. mutual Wi-Fi or mobile hotspots), streams flow internally without wasting broadband internet data.",
    },
    {
      icon: Timer,
      title: "Self-Destruct Windows",
      desc: "Retain absolute custody. Create ephemeral links set to purge instantly in 5 minutes, 30 minutes, 1 hour, or any custom duration limit you determine.",
    },
    {
      icon: Lock,
      title: "Password-Derived Gating",
      desc: "Block unauthorized peers. Our system offers unique key derivation that signs the handshake, preventing unauthorized entities from scanning active peer connections.",
    },
    {
      icon: QrCode,
      title: "QR Lens Pairing",
      desc: "Seamless cross-device links. Point your smartphone camera at a desktop QR signature to pair connection handshakes in a single motion — no text copying needed.",
    },
    {
      icon: EyeOff,
      title: "No Tracking Footprint",
      desc: "Complete privacy. ClearDrop avoids analytics trackers, system metrics collection, user account requirements, cookies, or third-party telemetries.",
    },
    {
      icon: ShieldCheck,
      title: "Secure One-Time Locks",
      desc: "Define strict download budgets. Restrict shares to complete the handshake exactly once, automatically destroying the session context once download succeeds.",
    },
  ];

  return (
    <main className="relative min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div className="bg-radial-glow pointer-events-none fixed inset-0 -z-10" />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
              <Send className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight">ClearDrop</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <Link to="/features" className="text-foreground font-semibold">
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
                  Try ClearDrop Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Container */}
      <div className="mx-auto max-w-5xl px-6 py-16 flex-1">
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Feature set</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
            Smarter transfers. Zero trace.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Explore why ClearDrop is the ultimate privacy conduit for modern browser-based
            transfers.
          </p>
        </div>

        {/* Feature Bento Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featureCards.map((f, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-surface p-6 backdrop-blur shadow-soft"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 transition group-hover:bg-primary/25">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Technical Specification Box */}
        <div className="mt-16 rounded-3xl border border-border bg-card/10 p-8 md:p-12">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl font-semibold">Decentralized Security Stack</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Built on standards chosen specifically to support user confidentiality.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 text-sm">
            <div className="rounded-2xl border border-border/30 bg-background/50 p-5">
              <span className="text-primary font-bold block mb-1">WebRTC (RFC 8831)</span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Implements standard SCTP/DTLS mechanics inside the WebRTC data engine, keeping your
                operations fully authenticated.
              </p>
            </div>
            <div className="rounded-2xl border border-border/30 bg-background/50 p-5">
              <span className="text-success font-bold block mb-1">Web Cryptography API</span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Relies entirely on client-side sandboxed cryptography modules compiled into your
                browser, guaranteeing zero third-party leakage.
              </p>
            </div>
            <div className="rounded-2xl border border-border/30 bg-background/50 p-5">
              <span className="text-amber-500 font-bold block mb-1">SHA-256 / PBKDF2</span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ensures password inputs are transformed into cryptographic materials using
                repetitive iteration layers before locking active streams.
              </p>
            </div>
            <div className="rounded-2xl border border-border/30 bg-background/50 p-5">
              <span className="text-muted-foreground font-bold block mb-1">
                Zero Database Footprint
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Temporary handshakes expire instantly without recording transfers to central tables.
                Your transfers remain personal.
              </p>
            </div>
          </div>
        </div>

        {/* Footnotes */}
        <div className="mt-16 text-center">
          <p className="text-xs text-muted-foreground">
            Looking for step-by-step illustrations? Inspect our pictorial{" "}
            <Link to="/guide" className="text-primary underline">
              Help Guide
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 bg-background/20 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 text-sm text-muted-foreground md:flex-row">
          <div className="flex flex-col gap-2 items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-primary">
                <Send className="h-3 w-3 text-primary-foreground" />
              </div>
              <span className="font-medium text-foreground">ClearDrop</span>
              <span className="text-muted-foreground">· Fast. Private. Temporary.</span>
            </div>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} ClearDrop · Part of the LanDecs ecosystem.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 justify-center">
            <Link
              to="/features"
              className="hover:text-foreground transition text-sm font-medium text-foreground font-semibold"
            >
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

      {/* Legal Modals */}
      <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </main>
  );
}
