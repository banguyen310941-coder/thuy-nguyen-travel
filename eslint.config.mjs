import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });
const dynamicInternalImageSurfaces = [
  'components/AdminContentEditor.tsx',
  'components/AdminMediaLibrary.tsx',
  'components/AdminPartnerManager.tsx',
  'components/AdminProductEditor.tsx',
  'components/AdminProductManager.tsx',
  'components/AdminProductManagerV4.tsx',
  'components/AdminTourEditorSimple.tsx',
  'components/AdminTourEditorV2.tsx',
  'components/AffiliateDashboard.tsx',
  'components/PartnerProductEditor.tsx',
  'components/PartnerProductionPortal.tsx',
  'components/UnifiedProductUnitsEditor.tsx',
];

const config = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: ['.next/**', 'out/**', 'node_modules/**', 'public/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      // Public rendering must use the shared SafeImage boundary or next/image.
      '@next/next/no-img-element': 'error',
      'react/no-unescaped-entities': 'off',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    // Authenticated editors/previews accept arbitrary CMS/partner media hosts at runtime.
    // Keep this exception explicit and narrow instead of weakening the rule globally.
    files: dynamicInternalImageSurfaces,
    rules: {
      '@next/next/no-img-element': 'off',
    },
  },
];

export default config;
