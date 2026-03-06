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
        // Main application colors
        "dark-header": "#2d2d2d",
        "dark-footer": "#3d3d3d",
        "dark-base": "#1a1a1a",
        dark: {
          header: "#2d2d2d",
          footer: "#3d3d3d",
          base: "#1a1a1a",
        },
        light: {
          bg: "#f5f5f5",
        },
        sidebar: {
          DEFAULT: "#8b7355",
        },
        success: {
          DEFAULT: "#22c55e",
          hover: "#16a34a",
        },
      },
    },
  },
  plugins: [],
};

export default config;
