import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig(({ mode }) => {
  // Load environment variables from files and OS level env (e.g. on Vercel)
  const env = loadEnv(mode, process.cwd(), "");

  // Look for any standard naming combinations of Supabase URL and Key
  const SUPABASE_URL = env.VITE_SUPABASE_URL || env.SUPABASE_URL || "";
  const SUPABASE_PUBLISHABLE_KEY =
    env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    env.VITE_SUPABASE_ANON_KEY ||
    env.SUPABASE_ANON_KEY ||
    env.SUPABASE_PUBLISHABLE_KEY ||
    "";

  return {
    plugins: [react(), tailwindcss(), tsconfigPaths()],
    define: {
      // Expose these variables safely in the browser build bundle
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(SUPABASE_URL),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(SUPABASE_PUBLISHABLE_KEY),
      "process.env.VITE_SUPABASE_URL": JSON.stringify(SUPABASE_URL),
      "process.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(SUPABASE_PUBLISHABLE_KEY),
      "process.env.SUPABASE_URL": JSON.stringify(SUPABASE_URL),
      "process.env.SUPABASE_PUBLISHABLE_KEY": JSON.stringify(SUPABASE_PUBLISHABLE_KEY),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 3000,
      host: "0.0.0.0",
      strictPort: true,
    },
  };
});
