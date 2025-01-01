import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  plugins: [],
  theme: {
    extend: {
      gridTemplateColumns: {
        "58": "repeat(58, minmax(0, 1fr))",
      },
      gridTemplateRows: {
        "25": "repeat(25, minmax(0, 1fr))",
      },
    },
  },
} satisfies Config;
