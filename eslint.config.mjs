import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  ...compat.extends('next/core-web-vitals'),

  // Ban direct localStorage/sessionStorage access — use safeStorage instead
  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    ignores: ['src/lib/safeStorage.js', 'src/app/layout.js'],
    rules: {
      'no-restricted-globals': [
        'warn',
        {
          name: 'localStorage',
          message: 'Use safeLocal from @/lib/safeStorage instead of direct localStorage access.',
        },
        {
          name: 'sessionStorage',
          message: 'Use safeSession from @/lib/safeStorage instead of direct sessionStorage access.',
        },
      ],
    },
  },

  // Ban direct crypto.randomUUID — use generateId from compat.js instead
  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    ignores: ['src/lib/compat.js'],
    rules: {
      'no-restricted-properties': [
        'warn',
        {
          object: 'crypto',
          property: 'randomUUID',
          message: 'Use generateId() from @/lib/compat instead — not available in Safari <15.4.',
        },
      ],
    },
  },

  // Warn on Supabase .select() without .limit() or .range() to prevent unbounded fetches
  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    ignores: ['src/app/api/**'],
    rules: {
      'no-restricted-syntax': [
        'warn',
        {
          selector: "CallExpression[callee.property.name='select'][callee.object.callee.property.name='from']",
          message: 'Supabase .from().select() should include .limit() or .range() to prevent unbounded fetches. If this is intentional (e.g. count-only with head:true), add a comment explaining why.',
        },
      ],
    },
  },
];
