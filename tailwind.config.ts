import type { Config } from "tailwindcss";
import lineClamp from "@tailwindcss/line-clamp";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#08101f",
        card: "#0f1e36",
        border: "rgba(30,77,140,0.35)",
        gold: "#c8a84b",
        blue: "#2563b0",
        text: "#dce4f0",
        muted: "#7a8da8"
      },
      boxShadow: {
        card: "0 8px 24px rgba(0,0,0,0.25)",
        glow: "0 0 0 1px rgba(200,168,75,0.25), 0 10px 30px rgba(0,0,0,0.35)"
      }
    }
  },
  plugins: [lineClamp]
};

export default config;
