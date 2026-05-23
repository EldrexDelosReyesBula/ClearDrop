import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Send, ArrowRight, FileText, Menu, X, Gift, ExternalLink } from "lucide-react";
import { PrivacyModal, TermsModal, DonationButton } from "@/components/LegalModals";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Droply — Terms of Use" },
      {
        name: "description",
        content: "Decentralized file transport and responsibility details.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
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
            <Link to="/terms" className="text-foreground font-semibold">
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

      {/* Main Content Area */}
      <div className="mx-auto max-w-3xl px-6 py-16 flex-1 w-full">
        <div className="flex items-center gap-3 border-b border-border/40 pb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-glow">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Terms of Use</h1>
            <p className="text-sm text-muted-foreground mt-1">Effective: May 2026</p>
          </div>
        </div>

        <div className="mt-8 space-y-6 text-base text-foreground/85 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              1. Ephemeral &amp; Serverless Coordination
            </h2>
            <p>
              This website provides <strong>Droply</strong> as a free, decentralized WebRTC-powered
              file coordination service. By utilizing the service, you agree to these fundamental
              provisions.
            </p>
            <p>
              You acknowledge that files stream directly between browses. Since we do not host or
              store your content on any physical disk arrays, we are incapable of recovering,
              reviewing, or censoring transmissions. You bear exclusive responsibility for the files
              you authorize and send.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              2. Permitted Layout &amp; Purposes
            </h2>
            <p>
              You agree not to utilize high-bandwidth streams to orchestrate malicious attacks,
              distribute illegal content, or violate intellectual property rules. Droply is
              conceived as a temporary personal file backup and transfer utility.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">3. Warranty Disclaimer</h2>
            <p>
              The service is delivered "as-is" without representations of strict upstream
              availability. Ephemeral WebRTC channels rely on public STUN/TURN configurations and
              client routers. No backup systems or database recovery services are maintained. Use at
              your own risk.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-border/40 text-center">
          <Link
            to="/app"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-95"
          >
            Start Sharing
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Consistent Footer */}
      <footer className="border-t border-border/40 py-12 bg-background/20 backdrop-blur-sm">
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
            <Link to="/privacy" className="hover:text-foreground transition text-sm font-medium">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-foreground font-semibold text-sm">
              Terms of Use
            </Link>
            <DonationButton />
          </div>
        </div>
      </footer>

      <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </main>
  );
}
