import { Octokit } from '@octokit/rest';
import { Label, LabelUpdateProps } from './common-types';

export interface GitHubClientProps {
  readonly owner: string;
  readonly repo: string;
  readonly pr: number;
}

/**
 * Represents the client used to make API calls to GitHub
 */
export class GitHubClient {
  private readonly pr: { owner: string; repo: string; issue_number: number };
  private readonly client: Octokit;

  constructor(token: string, props: GitHubClientProps) {
    this.pr = {
      owner: props.owner,
      repo: props.repo,
      issue_number: props.pr,
    };

    this.client = new Octokit({ auth: token });
  }

  public async updateLabelOnPullRequest(props: LabelUpdateProps) {
    if (props.updateType === 'created') {
      return this.addLabelToPullRequest(props.label);
    }
    return this.removeLabelFromPullRequest(props.label);
  }

  private async addLabelToPullRequest(label: Label) {
    return this.client.issues.addLabels({
      ...this.pr,
      labels: [label],
    });
  }

  private async removeLabelFromPullRequest(label: Label) {
    return this.client.issues.removeLabel({
      ...this.pr,
      name: label,
    });
  }
}
