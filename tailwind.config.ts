import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"], // keep dark mode class strategy
  // In v4, content paths are auto-detected for Next.js; no need to set.
  // We also don't need plugins here since we added custom utilities in globals.css.
};

export default config;