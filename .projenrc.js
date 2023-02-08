const { GitHubActionTypeScriptProject } = require('projen-github-action-typescript');
const project = new GitHubActionTypeScriptProject({
  defaultReleaseBranch: 'main',
  name: 'pr-linter-exemption-labeler',
  deps: ['@octokit/graphql', '@actions/core', '@actions/github', '@octokit/rest'],
  metadata: {
    author: 'Kendra Neil',
    inputs: {
      'github-token': {
        description: 'GitHub token',
        required: true,
      },
    },
  },
  devDeps: ['projen-github-action-typescript'],
  eslintOptions: {
    prettier: true,
  },
  jestOptions: {
    verbose: true,
    silent: true,
  },
});

project.package.addField('prettier', {
  singleQuote: true,
  semi: true,
  trailingComma: 'es5',
  printWidth: 100,
});

project.eslint.addRules({
  'prettier/prettier': [
    'error',
    { singleQuote: true, semi: true, trailingComma: 'es5', printWidth: 100 },
  ],
});

project.eslint.addOverride({
  files: ['*-function.ts'],
  rules: { 'prettier/prettier': 'off' },
});

project.synth();
