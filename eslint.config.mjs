import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

export default [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: ['.next/**', 'out/**', 'node_modules/**', 'public/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@next/next/no-img-element': 'warn',
      'react/no-unescaped-entities': 'off',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];
