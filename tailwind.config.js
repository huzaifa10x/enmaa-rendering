/** @type {import('tailwindcss').Config} */

// v3 can only apply an alpha modifier (bg-primary/80) when the colour is
// expressed as channels plus the <alpha-value> placeholder. The CSS variables
// in globals.css must therefore hold "R G B" triplets, not hex.
const alpha = (v) => `rgb(var(${v}) / <alpha-value>)`;

module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: alpha("--border"),
        input: alpha("--input"),
        ring: alpha("--ring"),
        background: alpha("--background"),
        foreground: alpha("--foreground"),
        primary: {
          DEFAULT: alpha("--primary"),
          foreground: alpha("--primary-foreground"),
        },
        secondary: {
          DEFAULT: alpha("--secondary"),
          foreground: alpha("--secondary-foreground"),
        },
        destructive: {
          DEFAULT: alpha("--destructive"),
          foreground: alpha("--destructive-foreground"),
        },
        muted: {
          DEFAULT: alpha("--muted"),
          foreground: alpha("--muted-foreground"),
        },
        accent: {
          DEFAULT: alpha("--accent"),
          foreground: alpha("--accent-foreground"),
        },
        popover: {
          DEFAULT: alpha("--popover"),
          foreground: alpha("--popover-foreground"),
        },
        card: {
          DEFAULT: alpha("--card"),
          foreground: alpha("--card-foreground"),
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      // v4 had a continuous numeric scale; v3 does not. These are the exact
      // values the markup uses that v3 would otherwise drop silently.
      spacing: {
        15: "3.75rem",
        18: "4.5rem",
        38: "9.5rem",
        50: "12.5rem",
        55: "13.75rem",
        75: "18.75rem",
        125: "31.25rem",
        150: "37.5rem",
      },
      maxWidth: {
        125: "31.25rem",
        150: "37.5rem",
      },
      minWidth: {
        55: "13.75rem",
      },
      scale: {
        30: "0.3",
        40: "0.4",
      },
      zIndex: {
        60: "60",
        70: "70",
        80: "80",
        90: "90",
        99: "99",
        100: "100",
        999: "999",
      },
    },
  },
  plugins: [],
};