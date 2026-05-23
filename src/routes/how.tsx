import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Send,
  Upload,
  Share2,
  Trash2,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Lock,
  Cpu,
  Zap,
  Globe,
  Radio,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { PrivacyModal, TermsModal, DonationButton } from "@/components/LegalModals";

export const Route = createFileRoute("/how")({
  head: () => ({
    meta: [
      { title: "ClearDrop — How Direct Peer-to-Peer Encrypted Transfer Works" },
      {
        name: "description",
        content:
          "Explore the engineering behind our decentralized file transfer engine. Learn how WebRTC data channels, ECDH handshakes, and AES-GCM 256 encryption keep your files completely private.",
      },
      {
        name: "keywords",
        content:
          "how webRTC works, peer-to-peer transfer tech, ECDH key agreement, AES-GCM 256 file sharing, secure communications sandbox, private browser stream",
      },
      { property: "og:title", content: "ClearDrop — How Direct Peer Sharing Works" },
      {
        property: "og:description",
        content:
          "Symmetrically encrypted direct routing transfers that bypass intermediate servers entirely. Purely browser-based and secure.",
      },
      { name: "robots", content: "index, follow" },
    ],
  }),
  component: HowPage,
});

function HowPage() {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <Link to="/features" className="transition hover:text-foreground">
              Features
            </Link>
            <Link to="/how" className="text-foreground font-semibold">
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

      {/* Hero Section */}
      <div className="mx-auto max-w-5xl px-6 py-16 flex-1">
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
            Under the hood
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
            Decentralized. Secure. Direct.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            ClearDrop isn't a cloud storage cabinet. It's a real-time routing conduit. Below is
            exactly how your file is protected, bundled, and delivered natively in your browser.
          </p>
        </div>

        {/* Visual Pipeline Block */}
        <div className="mt-16 rounded-3xl border border-border/50 bg-gradient-surface p-8 md:p-12 shadow-soft">
          <h2 className="text-xl font-semibold md:text-2xl text-center">
            The P2P Connection Pipeline
          </h2>
          <p className="mt-2 text-sm text-muted-foreground text-center max-w-xl mx-auto">
            From dropping the file to downloading the final verified chunk, discover the steps
            executing in your local browser sandbox memory.
          </p>

          <div className="mt-12 grid gap-8 md:grid-cols-3 relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border/40 -translate-y-1/2 hidden md:block -z-10" />

            {/* Step 1 */}
            <div className="flex flex-col items-center text-center bg-background/50 border border-border/30 rounded-2xl p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                <Upload className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-mono text-primary uppercase font-bold tracking-wider">
                Step 1: Local Buffer
              </span>
              <h3 className="mt-2 text-base font-semibold">Local Memory Lock</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Your file is loaded securely in your browser's private sandbox memory as a blob. No
                data is shared with the signaling server.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center bg-background/50 border border-border/30 rounded-2xl p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success mb-4">
                <Cpu className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-mono text-success uppercase font-bold tracking-wider">
                Step 2: ECDH Agreement
              </span>
              <h3 className="mt-2 text-base font-semibold">End-to-End Handshake</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Connecting devices exchange public signaling keys over WebRTC. Peer identity is
                securely proved using military-grade key agreement.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center bg-background/50 border border-border/30 rounded-2xl p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 mb-4">
                <Lock className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-mono text-amber-500 uppercase font-bold tracking-wider">
                Step 3: AES-GCM 256
              </span>
              <h3 className="mt-2 text-base font-semibold">Encrypted Stream</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                As the receiver requests chunks, data is encrypted symmetrically on-the-fly and
                stream-delivered with zero server interception.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed technical breakdown */}
        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl border border-border/40 p-6 bg-card/10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Globe className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">WebRTC Data Channels</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              We leverage browser-native WebRTC (Web Real-Time Communication) to establish a direct,
              fully sandboxed data path between the two clients. If devices are on the same local
              network, files stream at maximum LAN speeds, completely bypassing the internet itself.
            </p>
          </div>

          <div className="rounded-2xl border border-border/40 p-6 bg-card/10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/15 text-success">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Symmetric Cryptosystems</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Every connection is negotiated under dedicated session keys. Optional passwords derive
              cryptograhic material locally in-browser using PBKDF2 (SHA-256 derivation). The data
              stream is signed with an authenticating tag to ensure no tamper, spoofing, or stream
              interruption is possible.
            </p>
          </div>

          <div className="rounded-2xl border border-border/40 p-6 bg-card/10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Zero-Knowledge Architecture</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              ClearDrop holds a zero-knowledge posture. Our server coordinates connection handshakes
              (`offers` and `answers`), signaling, and presence states. It never sees, logs, or
              coordinates any single byte of the files themselves. Your content remains yours.
            </p>
          </div>

          <div className="rounded-2xl border border-border/40 p-6 bg-card/10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Radio className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Cross-Network Stability</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              When standard P2P direct paths are blocked by symmetric NAT fires or restrictive
              carrier setups, the system safely coordinates secure TURN channels, ensuring your
              transfer completes without breaking file stream limits.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-3xl border border-border bg-gradient-surface p-8 text-center">
          <h2 className="text-2xl font-semibold">Experience truly private transfer today</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Fast, secure browser streaming is just a click away. Make your first share now.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/app"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-95"
            >
              Start Sharing
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-6 py-3 text-sm font-medium text-foreground backdrop-blur transition hover:bg-card"
            >
              Back Home
            </Link>
          </div>
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
            <Link to="/features" className="hover:text-foreground transition text-sm font-medium">
              Features
            </Link>
            <Link
              to="/how"
              className="hover:text-foreground transition text-sm font-medium text-foreground font-semibold"
            >
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
