/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        'surface-strong': 'var(--surface-strong)',
        'surface-glass': 'var(--surface-glass)',
        'surface-tint': 'var(--surface-tint)',
        'border-subtle': 'var(--border-subtle)',
        'border-strong': 'var(--border-strong)',
        'border-light': 'var(--border-light)',
        'accent-blue': 'var(--accent-blue)',
        'accent-teal': 'var(--accent-teal)',
        'accent-emerald': 'var(--accent-emerald)',
        'accent-red': 'var(--accent-red)',
        'accent-warn': 'var(--accent-warn)',
        'text-muted': 'var(--text-muted)',
        'text-subtle': 'var(--text-subtle)',
        purple: {
          DEFAULT: 'var(--purple)',
          light: 'var(--purple-light)',
          pale: 'var(--purple-pale)',
          ghost: 'var(--purple-ghost)',
          dark: 'var(--purple-dark)',
          deep: 'var(--purple-deep)',
        },
        brand: {
          bg: 'var(--background)',
          surface: 'var(--surface-strong)',
          elevated: 'var(--surface-tint)',
          border: 'var(--border-subtle)',
          muted: 'var(--text-muted)',
          teal: 'var(--accent-teal)',
          accent: 'var(--accent-blue)',
        },
      },
      borderRadius: {
        lg: 'var(--radius-lg)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        elevated: 'var(--shadow-elevated)',
        ring: 'var(--shadow-ring)',
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'DM Sans', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
