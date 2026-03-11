import { defineConfig } from 'wxt';
import tailwindcss from "@tailwindcss/vite";

// See https://wxt.dev/api/config.html
export default defineConfig({
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  // Relative to project root
  srcDir: "src",             // default: "."
  runner: {
    startUrls: ["https://google.com/"]
  },
  manifest: () => ({
    name: "shift-importer",
    version: "0.1.0",
    permissions: ["identity", "storage", "activeTab"],
    host_permissions: ["https://www.googleapis.com/*", "https://sheets.googleapis.com/*", "https://docs.google.com/*"],
    oauth2: {
      client_id: import.meta.env.WXT_OAUTH_CLIENT_ID,
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets.readonly",
        "https://www.googleapis.com/auth/calendar.events"
      ]
    },
    "background": {
      "service_worker": "background.ts"
    },
    key: import.meta.env.WXT_EXTENSION_PUBLIC_KEY
  })
})
