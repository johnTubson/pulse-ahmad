const expoConfig = require('eslint-config-expo/flat');
const eslintConfigPrettier = require('eslint-config-prettier');
const reactYouMightNotNeedAnEffect = require('eslint-plugin-react-you-might-not-need-an-effect');
const { defineConfig } = require('eslint/config');

module.exports = defineConfig([
  {
    ignores: ['node_modules/', '.expo/', 'dist/', 'web-build/', 'coverage/'],
  },
  ...expoConfig,
  reactYouMightNotNeedAnEffect.configs.recommended,
  {
    files: [
      'app/**/*.{ts,tsx}',
      'src/features/**/*.{ts,tsx}',
      'src/hooks/**/*.{ts,tsx}',
      'src/components/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react',
              importNames: ['useEffect', 'useLayoutEffect'],
              message:
                'Avoid useEffect/useLayoutEffect in UI. Prefer Zustand subscriptions (src/bootstrap), declarative Redirect, derived render state, or event handlers.',
            },
          ],
        },
      ],
    },
  },
  eslintConfigPrettier,
]);
