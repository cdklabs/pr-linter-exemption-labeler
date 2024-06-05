import { GitHubActionTypeScriptProject, RunsUsing } from 'projen-github-action-typescript';
const project = new GitHubActionTypeScriptProject({
  defaultReleaseBranch: 'main',
  release: false,
  name: 'pr-linter-exemption-labeler',
  deps: ['@octokit/graphql', '@actions/core', '@actions/github', '@octokit/rest'],
  autoApproveUpgrades: true,
  autoApproveOptions: {
    allowedUsernames: ['cdklabs-automation'],
    secret: 'GITHUB_TOKEN',
  },
  projenrcTs: true,
  actionMetadata: {
    author: 'Kendra Neil',
    runs: {
      main: 'dist/index.js',
      using: RunsUsing.NODE_20,
    },
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
    dirs: ['src', 'test'],
  },
  jestOptions: {
    jestConfig: {
      verbose: true,
    },
  },
});

project.package.addField('prettier', {
  singleQuote: true,
  semi: true,
  trailingComma: 'es5',
  printWidth: 100,
});

project.eslint?.addRules({
  'prettier/prettier': [
    'error',
    { singleQuote: true, semi: true, trailingComma: 'es5', printWidth: 100 },
  ],
});

project.eslint?.addOverride({
  files: ['*-function.ts'],
  rules: { 'prettier/prettier': 'off' },
});

project.synth();
