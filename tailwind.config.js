/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        neutral: "#6B7280",
      },
      animation: {
        "fade-in": "fadeIn 300ms ease-in-out",
        "slide-in": "slideIn 250ms ease-in-out",
        loading: "spin 1s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "#374151",
            a: {
              color: "#3B82F6",
              "&:hover": {
                color: "#1D4ED8",
              },
            },
            h1: {
              color: "#111827",
            },
            h2: {
              color: "#111827",
            },
            h3: {
              color: "#111827",
            },
            h4: {
              color: "#111827",
            },
            code: {
              color: "#1F2937",
              backgroundColor: "#F3F4F6",
              padding: "0.125rem 0.25rem",
              borderRadius: "0.25rem",
              fontSize: "0.875rem",
            },
            "code::before": {
              content: '""',
            },
            "code::after": {
              content: '""',
            },
            blockquote: {
              borderLeftColor: "#3B82F6",
              backgroundColor: "#EFF6FF",
              padding: "0.5rem 1rem",
              borderRadius: "0 0.5rem 0.5rem 0",
            },
          },
        },
      },
    },
  },
  plugins: [],
};
