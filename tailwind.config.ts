import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-app)",
        foreground: "var(--text-main)",
        surface: {
          DEFAULT: "var(--bg-surface)",
          hover: "var(--bg-surface-hover)",
        },
        header: "var(--bg-header)",
        border: {
          main: "var(--border-main)",
          subtle: "var(--border-subtle)",
        },
        text: {
          main: "var(--text-main)",
          muted: "var(--text-muted)",
          dim: "var(--text-dim)",
        },
        brand: {
          primary: "var(--primary)",
          hover: "var(--primary-hover)",
          foreground: "var(--primary-foreground)",
          light: "var(--primary-light)",
        },
        accent: {
          gold: "var(--accent-gold)",
          teal: "var(--accent-teal)",
        },
        status: {
          success: "var(--status-success)",
          warning: "var(--status-warning)",
          danger: "var(--status-danger)",
        },
        tooltip: {
          bg: "var(--tooltip-bg)",
          text: "var(--tooltip-text)",
          border: "var(--tooltip-border)",
        },
        sidebar: {
          bg: "var(--bg-sidebar)",
          hover: "var(--bg-sidebar-hover)",
          active: "var(--bg-sidebar-active)",
          text: "var(--bg-sidebar-text)",
          border: "var(--border-main)",
        },
        textil: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
          950: "#082f49",
        },
        navy: {
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
      },
    },
  },
  plugins: [],
};
export default config;

