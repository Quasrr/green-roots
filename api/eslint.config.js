// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    rules: {
      'semi': ['error', 'always'], // ; en fin de bloc
      'indent': ['error', 4], // Indentation de 4
    },
  },
  {
    ignores: ["dist"]
  }, 
);