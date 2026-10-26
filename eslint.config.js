import js from '@eslint/js'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'

export default [
  { ignores: ['dist/**', 'node_modules/**', 'playwright-report/**', 'test-results/**'] },
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, __APP_VERSION__: 'readonly' },
    },
    settings: { react: { version: '18.3' } },
    plugins: { react, 'react-hooks': reactHooks },
    rules: {
      // JSX usage counts as use (core no-unused-vars can't see it).
      'react/jsx-uses-vars': 'error',
      'react/jsx-key': 'error',
      'react/no-unknown-property': ['error', { ignore: ['inert'] }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
    },
  },
  {
    files: ['src/__tests__/**', 'e2e/**', '*.config.js', 'scripts/**', 'public/sw.js'],
    languageOptions: { globals: { ...globals.node, ...globals.browser, ...globals.serviceworker } },
  },
]
