/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: NativeWind v4 requires content to be exactly as shown
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2A9D8F", // Emerald from web
          foreground: "#f8fafc",
        },
        secondary: {
          DEFAULT: "#f1f5f9",
          foreground: "#0f172a",
        },
        accent: {
          DEFAULT: "#E9C46A", // Yellow/Gold from web
          foreground: "#0f172a",
        },
        muted: {
          DEFAULT: "#f1f5f9",
          foreground: "#64748b",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#f8fafc",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#020617",
        },
        background: "#ffffff",
        foreground: "#020617",
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3rem',
      },
      fontFamily: {
        'black-italic': ['Inter-BlackItalic', 'sans-serif'], // We might need to load these fonts
      }
    },
  },
  plugins: [],
}

