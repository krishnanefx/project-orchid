import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/(marketing)/**/*.{ts,tsx}",
    "./components/marketing/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        "tertiary": "#765800",
        "surface-container-highest": "#eadfec",
        "on-primary-container": "#fffdff",
        "surface-dim": "#e1d7e3",
        "surface-container": "#f5eaf7",
        "secondary-fixed": "#b1f0ce",
        "outline-variant": "#d0c2d5",
        "on-secondary": "#ffffff",
        "primary-fixed-dim": "#e0b6ff",
        "on-tertiary-fixed": "#251a00",
        "surface-container-high": "#f0e5f1",
        "surface": "#fff7fd",
        "on-primary-fixed": "#2e004e",
        "primary-fixed": "#f2daff",
        "inverse-on-surface": "#f8edfa",
        "on-tertiary-fixed-variant": "#5a4300",
        "on-error-container": "#93000a",
        "outline": "#7e7384",
        "error": "#ba1a1a",
        "on-background": "#1f1a22",
        "surface-variant": "#eadfec",
        "inverse-primary": "#e0b6ff",
        "surface-tint": "#8433c4",
        "surface-container-low": "#fbf0fd",
        "inverse-surface": "#342e38",
        "surface-container-lowest": "#ffffff",
        "secondary-container": "#aeeecb",
        "secondary": "#2c694e",
        "on-secondary-container": "#316e52",
        "primary": "#8231c2",
        "on-tertiary": "#ffffff",
        "on-primary-fixed-variant": "#6a0baa",
        "tertiary-fixed-dim": "#edc156",
        "on-surface": "#1f1a22",
        "tertiary-fixed": "#ffdf9a",
        "surface-bright": "#fff7fd",
        "on-surface-variant": "#4d4353",
        "on-primary": "#ffffff",
        "on-error": "#ffffff",
        "on-secondary-fixed": "#002114",
        "on-tertiary-container": "#fffdff",
        "tertiary-container": "#947000",
        "on-secondary-fixed-variant": "#0e5138",
        "primary-container": "#9d4edd",
        "error-container": "#ffdad6",
        "secondary-fixed-dim": "#95d4b3",
        "background": "#fff7fd"
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem"
      },
      spacing: {
        "sidebar-width": "260px",
        "margin-mobile": "16px",
        "base": "8px",
        "gutter": "24px"
      },
      maxWidth: {
        "container-max": "1280px"
      },
      fontFamily: {
        display: ["var(--font-plus-jakarta-sans)", "sans-serif"],
        label: ["var(--font-inter)", "sans-serif"],
        "body-sm": ["var(--font-inter)", "sans-serif"],
        "body-md": ["var(--font-inter)", "sans-serif"],
        "body-lg": ["var(--font-inter)", "sans-serif"],
        "h1": ["var(--font-plus-jakarta-sans)", "sans-serif"],
        "h2": ["var(--font-plus-jakarta-sans)", "sans-serif"],
        "h3": ["var(--font-plus-jakarta-sans)", "sans-serif"]
      },
      fontSize: {
        display: ["48px", { lineHeight: "1.2", fontWeight: "700" }],
        label: ["12px", { lineHeight: "1", letterSpacing: "0.02em", fontWeight: "600" }],
        h1: ["32px", { lineHeight: "1.3", fontWeight: "700" }],
        "body-sm": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        h3: ["20px", { lineHeight: "1.4", fontWeight: "600" }],
        h2: ["24px", { lineHeight: "1.3", fontWeight: "600" }],
        "body-md": ["16px", { lineHeight: "1.6", fontWeight: "400" }]
      }
    }
  },
  plugins: []
};

export default config;
