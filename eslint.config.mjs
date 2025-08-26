// eslint.config.js
import { defineConfig } from 'eslint/config';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default defineConfig([
  // Base ESLint recommended rules
  {
    extends: ['eslint:recommended'],
  },
  // TypeScript specific configuration
  {
    files: ['**/*.ts', '**/*.tsx'], // Apply only to TypeScript files
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json', // Or your tsconfig path
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    extends: [
      'plugin:@typescript-eslint/recommended', // Recommended TypeScript rules
      'plugin:@typescript-eslint/recommended-requiring-type-checking', // Rules that require type information
    ],
    rules: {
      // Add or override specific TypeScript rules here
      // e.g., "@typescript-eslint/no-unused-vars": "off",
    },
  },
  // Prettier integration (must be last to override formatting rules)
  eslintPluginPrettierRecommended,
]);
