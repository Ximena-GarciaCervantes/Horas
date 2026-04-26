import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'rk-green': '#10b981',
        'rk-red': '#ef4444',
        'rk-gray': '#6b7280',
        'rk-dark': '#1f2937',
        'rk-light': '#f3f4f6',
      },
    },
  },
  plugins: [],
};
export default config;
