import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        rb: {
          teal: "hsl(var(--rb-teal))",
          "teal-strong": "hsl(var(--rb-teal-strong))",
          "teal-on-dark": "hsl(var(--rb-teal-on-dark))",
          "ink-900": "hsl(var(--rb-ink-900))",
          "ink-800": "hsl(var(--rb-ink-800))",
          canvas: "hsl(var(--rb-canvas))",
          "canvas-alt": "hsl(var(--rb-canvas-alt))",
          graphite: "hsl(var(--rb-graphite))",
          stone: "hsl(var(--rb-stone))",
          "stone-line": "hsl(var(--rb-stone-line))",
          cream: "hsl(var(--rb-cream))",
          "cream-muted": "hsl(var(--rb-cream-muted))",
          "line-dark": "hsl(var(--rb-line-dark))",
        },
      },
      fontFamily: {
        "rb-serif": ['"Source Serif 4 Variable"', "ui-serif", "Georgia", "serif"],
        "rb-sans": ['"Inter Variable"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
