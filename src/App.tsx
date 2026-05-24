import React from "react";
import { RouterProvider, usePath } from "@/lib/router";
import IndexPage from "./routes/index";
import AppPage from "./routes/app";
import FeaturesPage from "./routes/features";
import HowPage from "./routes/how";
import GuidePage from "./routes/guide";
import PrivacyPage from "./routes/privacy";
import TermsPage from "./routes/terms";
import ReceivePage from "./routes/receive";

function AppContent() {
  const path = usePath();

  if (path === "/" || path === "") {
    return <IndexPage />;
  }
  if (path === "/features") {
    return <FeaturesPage />;
  }
  if (path === "/how") {
    return <HowPage />;
  }
  if (path === "/guide") {
    return <GuidePage />;
  }
  if (path === "/app") {
    return <AppPage />;
  }
  if (path === "/privacy") {
    return <PrivacyPage />;
  }
  if (path === "/terms") {
    return <TermsPage />;
  }
  if (path.startsWith("/receive/")) {
    return <ReceivePage />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
      <div className="max-w-md">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState({}, "", "/");
              window.dispatchEvent(new Event("popstate"));
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/95"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <AppContent />
    </RouterProvider>
  );
}
