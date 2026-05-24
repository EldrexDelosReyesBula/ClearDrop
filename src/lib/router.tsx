import React, { createContext, useContext, useState, useEffect } from "react";

interface RouterContextType {
  path: string;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextType | null>(null);

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [path, setPath] = useState(() => {
    if (typeof window !== "undefined") {
      return window.location.pathname;
    }
    return "/";
  });

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (to: string) => {
    if (to.startsWith("http://") || to.startsWith("https://")) {
      window.location.href = to;
      return;
    }
    window.history.pushState({}, "", to);
    setPath(to);
  };

  return <RouterContext.Provider value={{ path, navigate }}>{children}</RouterContext.Provider>;
}

export function useNavigate() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useNavigate must be used within RouterProvider");
  return ctx.navigate;
}

export function usePath() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("usePath must be used within RouterProvider");
  return ctx.path;
}

export function useParams() {
  const path = usePath();
  const match = path.match(/^\/receive\/([^/]+)/);
  return { id: match ? match[1] : "" };
}

export function Link({
  to,
  children,
  className,
  onClick,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: string;
}) {
  const navigate = useNavigate();
  return (
    <a
      href={to}
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey) return;
        e.preventDefault();
        navigate(to);
        if (onClick) onClick(e);
      }}
      {...props}
    >
      {children}
    </a>
  );
}
