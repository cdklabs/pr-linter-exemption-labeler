Apply exemption labels on PRs so that reviewers can more easily see pull requests that need attention even if they do not have a passing build or are not passing the PR Linter validation

## Usage

Configure to run on comments on open PRs that are not authored by aws-cdk-automation:

```yaml
name: pr-linter-exemption-labeler
on:
  issue_comment:
    types:
      - created
      - edited
      - deleted

jobs:
  pr_commented:
    name: PR Comment
    if: ${{ (github.event.issue.pull_request) && (github.event.issue.state == 'open') }}
    runs-on: ubuntu-latest
    steps:
      - uses: TheRealAmazonKendra/pr-linter-exemption-labeler@main
        with:
          github-token: ${{ secrets.PROJEN.GITHUB_TOKEN }}