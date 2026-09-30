import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // The app loads data in effects and resets state when a request starts or a
      // route parameter changes. That is intentional here: there is no query
      // cache library, so every page owns its request lifecycle.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    // One icon module that exports the whole icon set.
    files: ['src/components/Icons.jsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
