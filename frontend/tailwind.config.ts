import type { Config } from 'tailwindcss';

// Tokens literais de governance/guidelines/frontend/_shared/design-tokens.json — nenhum valor
// aproximado. darkMode via classe .dark (mesma estratégia da coleção frontend/nextjs).
const config: Config = {
  darkMode: ['selector'],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          active: 'var(--primary-active)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          hover: 'var(--secondary-hover)',
          active: 'var(--secondary-active)',
          foreground: 'var(--secondary-foreground)',
          border: 'var(--secondary-border)',
        },
        ghost: {
          foreground: 'var(--ghost-foreground)',
          hover: 'var(--ghost-hover)',
          active: 'var(--ghost-active)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          hover: 'var(--destructive-hover)',
          active: 'var(--destructive-active)',
          foreground: 'var(--destructive-foreground)',
          border: 'var(--destructive-border)',
        },
        ring: {
          DEFAULT: 'var(--ring)',
          destructive: 'var(--ring-destructive)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
      },
      spacing: {
        base: 'var(--space-base)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
