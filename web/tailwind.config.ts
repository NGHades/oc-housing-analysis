import formsPlugin from "@tailwindcss/forms"
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "selector",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neutral ink/paper scale: 50 = paper, 200 = hairline, 900 = ink
        gray: {
          50: "#f8f9fb",
          100: "#f4f6f8",
          200: "#e7e7e7",
          300: "#d5d9de",
          400: "#98a1aa",
          500: "#6b6b6b",
          600: "#555555",
          700: "#333333",
          800: "#1f1f1f",
          900: "#111111",
          950: "#0a0a0a",
        },
        // Soft-blue accent built around #88abda
        blue: {
          50: "#f5f8fc",
          100: "#eef4fb",
          200: "#d5e2ef",
          300: "#a9c8eb",
          400: "#98b8e0",
          500: "#88abda",
          600: "#5b78a0",
          700: "#55799f",
          800: "#3f5a7b",
          900: "#2f4561",
          950: "#1f2f43",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Arial", "sans-serif"],
        display: ['"Helvetica Neue"', "Helvetica", "Arial", "sans-serif"],
        mono: ['"SFMono-Regular"', "Consolas", '"Liberation Mono"', "monospace"],
      },
      keyframes: {
        hide: {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        slideDownAndFade: {
          from: { opacity: "0", transform: "translateY(-6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideLeftAndFade: {
          from: { opacity: "0", transform: "translateX(6px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        slideUpAndFade: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideRightAndFade: {
          from: { opacity: "0", transform: "translateX(-6px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        accordionOpen: {
          from: { height: "0px" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        accordionClose: {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: { height: "0px" },
        },
        dialogOverlayShow: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        dialogContentShow: {
          from: {
            opacity: "0",
            transform: "translate(-50%, -45%) scale(0.95)",
          },
          to: { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
        },
        dialogContentFullShow: {
          from: {
            opacity: "0",
            transform: "scale(0.95)",
          },
          to: { opacity: "1", transform: "scale(1)" },
        },
        drawerSlideLeftAndFade: {
          from: { opacity: "0", transform: "translateX(100%)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        drawerSlideRightAndFade: {
          from: { opacity: "1", transform: "translateX(0)" },
          to: { opacity: "0", transform: "translateX(100%)" },
        },
      },
    },
    animation: {
      hide: "hide 150ms cubic-bezier(0.16, 1, 0.3, 1)",
      slideDownAndFade: "slideDownAndFade 150ms cubic-bezier(0.16, 1, 0.3, 1)",
      slideLeftAndFade: "slideLeftAndFade 150ms cubic-bezier(0.16, 1, 0.3, 1)",
      slideUpAndFade: "slideUpAndFade 150ms cubic-bezier(0.16, 1, 0.3, 1)",
      slideRightAndFade:
        "slideRightAndFade 150ms cubic-bezier(0.16, 1, 0.3, 1)",
      // Accordion
      accordionOpen: "accordionOpen 150ms cubic-bezier(0.87, 0, 0.13, 1)",
      accordionClose: "accordionClose 150ms cubic-bezier(0.87, 0, 0.13, 1)",
      // Dialog
      dialogOverlayShow:
        "dialogOverlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)",
      dialogContentShow:
        "dialogContentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)",
      dialogContentFullShow:
        "dialogContentFullShow 150ms cubic-bezier(0.16, 1, 0.3, 1)",
      // Drawer
      drawerSlideLeftAndFade:
        "drawerSlideLeftAndFade 150ms cubic-bezier(0.16, 1, 0.3, 1)",
      drawerSlideRightAndFade: "drawerSlideRightAndFade 150ms ease-in",
    },
  },
  plugins: [formsPlugin],
}
export default config
