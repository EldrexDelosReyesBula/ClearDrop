import { X, ShieldCheck, FileText, Gift, ExternalLink } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyModal({ isOpen, onClose }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl border border-border/80 bg-gradient-surface p-6 md:p-8 shadow-glowScale"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-border/40 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Privacy Policy</h2>
            <p className="text-xs text-muted-foreground">Last updated: May 2026</p>
          </div>
        </div>

        <div className="mt-6 space-y-4 text-sm text-foreground/80 leading-relaxed">
          <p>
            Welcome to <strong>ClearDrop</strong>. We take privacy extremely seriously. We are
            designed from the ground up to minimize data collection and maintain complete
            confidentiality.
          </p>

          <h3 className="font-semibold text-foreground mt-4 text-base">
            We Do Not Keep Your Files
          </h3>
          <p>
            When you drop a file on ClearDrop, the transmission is peer-to-peer using WebRTC
            technology. The file data remains stored safe in your browser's local sandbox memory
            (using Blob buffers) and is streamed directly to the receiver.{" "}
            <strong>Your files never touch our servers.</strong>
          </p>

          <h3 className="font-semibold text-foreground mt-4 text-base">End-to-End Encryption</h3>
          <p>
            All connection handshakes negotiate keys under highly secure ECDH cryptosystems. File
            streams are symmetrically encrypted directly on your machine with military-grade
            <strong> AES-GCM 256-bit encryption</strong> before leaving your browser. Even if
            signaling channels were monitored, your payload cannot be decrypted without the
            handshake-negotiated keys and passwords.
          </p>

          <h3 className="font-semibold text-foreground mt-4 text-base">Metadata & Cookies</h3>
          <p>
            We enforce complete compliance with international criteria. We do not use tracking
            cookies. Temporary transfer session coordination is executed entirely in memory and is
            automatically purged upon expiry, manual revocation, or browser window closure.
          </p>

          <h3 className="font-semibold text-foreground mt-4 text-base">Feedback and Questions</h3>
          <p>
            Our project is open, transparent, and built to support the development of a safer, freer
            web.
          </p>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition shadow-glow"
          >
            I understand
          </button>
        </div>
      </div>
    </div>
  );
}

export function TermsModal({ isOpen, onClose }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl border border-border/80 bg-gradient-surface p-6 md:p-8 shadow-glowScale"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-border/40 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Terms of Use</h2>
            <p className="text-xs text-muted-foreground">Effective: May 2026</p>
          </div>
        </div>

        <div className="mt-6 space-y-4 text-sm text-foreground/80 leading-relaxed">
          <p>
            This website provides <strong>ClearDrop</strong> as a free, decentralized WebRTC-powered
            file coordination service. By utilizing the service, you agree to these fundamental
            provisions.
          </p>

          <h3 className="font-semibold text-foreground mt-4 text-base">
            Decentralized Direct Routing
          </h3>
          <p>
            You acknowledge that files stream directly between browsers. Since we do not host or
            store your content on any physical disk arrays, we are incapable of recovering,
            reviewing, or censoring transmissions. You bear exclusive responsibility for the files
            you authorize and send.
          </p>

          <h3 className="font-semibold text-foreground mt-4 text-base">Permitted Purposes</h3>
          <p>
            You agree not to utilize high-bandwidth streams to orchestrate malicious attacks,
            distribute illegal content, or violate intellectual property rules. ClearDrop is
            optimized as an ephemeral backup tool.
          </p>

          <h3 className="font-semibold text-foreground mt-4 text-base">Disclaimer of Warranty</h3>
          <p>
            The service is delivered "as-is" without representations of strict upstream
            availability. Ephemeral WebRTC channels rely on public STUN/TURN configurations and
            client routers. No backup systems or database recovery services are maintained. Use at
            your own risk.
          </p>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition shadow-glow"
          >
            I agree
          </button>
        </div>
      </div>
    </div>
  );
}

export function DonationButton({ className = "" }: { className?: string }) {
  return (
    <a
      href="https://www.paypal.com/ncp/payment/ZB6RDYS5SBVHW"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 hover:bg-amber-500/20 px-4 py-2 text-xs font-semibold transition shadow-sm select-none ${className}`}
    >
      <Gift className="h-4 w-4 shrink-0 text-amber-500" />
      <span>Support development</span>
      <ExternalLink className="h-3 w-3 shrink-0 opacity-80" />
    </a>
  );
}
