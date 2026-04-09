import { defineConfig } from 'eslint/config'
import { FlatCompat } from '@eslint/eslintrc'
import unusedImports from 'eslint-plugin-unused-imports'

import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

// https://nextjs.org/docs/app/api-reference/config/eslint#with-core-web-vitals
export default defineConfig([
  {
    ignores: [
      '.tmp',
      '**/.git',
      '**/.hg',
      '**/.pnp.*',
      '**/.svn',
      '**/.yarn/**',
      '**/build',
      '**/dist/**',
      '**/node_modules',
      '**/temp',
      '**/docs/**',
      'playwright.config.ts',
      'jest.config.js',
      '**/.next',
      '**/.vercel',
      'postcss.config.js',
      '**/payload-types.ts',
      'lighthouserc.cjs',
      'fix_search.js',
      '_scripts/**',
      'trigger-revalidate.ts',
      'preview-email.ts',
      'src/blocks/SearchTour/test.js',
    ],
  },
  ...compat.config({
    extends: ['next/core-web-vitals', 'next/typescript'],
  }),
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
    },

    plugins: {
      'unused-imports': unusedImports,
    },

    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      /**
       * Just ignore this rule for now during the migration of shadcnblocks
       */
      '@next/next/no-img-element': 'off',

      // this rule is currently extreamly anoying. We should try to work towards to activate it, but for now we disable it.
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',

      'unused-imports/no-unused-imports': 'warn',

      // some libs like shadcn/ui have empty interfaces, just to name them differently.
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
  {
    files: ['eslint.config.mjs'],
    languageOptions: {
      parserOptions: {
        // Disable typed linting for this config file to avoid tsconfig inclusion errors
        project: null,
      },
    },
  },
  {
    files: [
      'src/app/api/**/*.ts',
      'src/app/(frontend)/api/**/*.ts',
      'scripts/**/*.ts',
      'src/scripts/**/*.ts',
      'src/seed/**/*.ts',
      'src/components/AdminDashboard/**/*.tsx',
      'src/components/AdminDashboard/**/*.ts',
    ],
    rules: { 'no-console': 'off' },
  },
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    linterOptions: { reportUnusedDisableDirectives: false },
    rules: {
      'unused-imports/no-unused-imports': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/refs': 'off',
      '@next/next/no-html-link-for-pages': 'off',
      'prefer-const': 'off',
      'react/no-unescaped-entities': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
    },
  },
  {
    files: [
      'src/globals/Header/navbar/**/*.tsx',
      'src/blocks/GalleryAlbum/**/*.tsx',
      'src/blocks/Gallery/**/*.tsx',
    ],
    rules: {
      'react-hooks/set-state-in-effect': 'off',
    },
  },
])
