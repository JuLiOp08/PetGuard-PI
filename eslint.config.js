import js from '@eslint/js';

export default [
  {
    ignores: ['node_modules/**', 'playwright-report/**', 'test-results/**']
  },
  js.configs.recommended,
  {
    files: ['js/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        Blob: 'readonly', CSS: 'readonly', Event: 'readonly', FileReader: 'readonly', FormData: 'readonly', HTMLButtonElement: 'readonly',
        HTMLElement: 'readonly', HTMLFormElement: 'readonly', HTMLInputElement: 'readonly', Image: 'readonly',
        URL: 'readonly', confirm: 'readonly', document: 'readonly', indexedDB: 'readonly', location: 'readonly',
        navigator: 'readonly', requestAnimationFrame: 'readonly', setTimeout: 'readonly', window: 'readonly', crypto: 'readonly'
      }
    }
  },
  {
    files: ['tests/**/*.js', 'playwright.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { Buffer: 'readonly', process: 'readonly', URL: 'readonly' }
    }
  }
];
