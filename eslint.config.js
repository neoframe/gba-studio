import { defineConfig } from 'eslint/config';
import pooolint from '@poool/eslint-config';

export default defineConfig(
  {
    ignores: [
      'node_modules', 'dist', '.yarn', '.dev', 'build', '.vite',
    ],
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  pooolint.configs.recommended,
);
