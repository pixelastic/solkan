import config from 'aberlaas/configs/eslint';

export default [
  ...config,
  {
    files: ['**/*.{js,jsx,ts,tsx,vue}'],
    rules: {
      'import/no-unresolved': [
        'error',
        {
          ignore: [
            'changelogen',
            'lint-staged',
            'stylelint',
            '@octokit/rest',
            '@tailwindcss/vite',
            '@vitejs/plugin-vue',
            'unbash',
          ],
        },
      ],
    },
  },
];
