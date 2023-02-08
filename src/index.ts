import * as core from '@actions/core';
import * as github from '@actions/github';
import { ActionType } from './common-types';
import { GitHubClient } from './github-client';
import { PullRequestCommentBasedLabelManager } from './label-manager';
import { LabelUpdateAssessor } from './update-assessor';
import { LabelUpdateCollector } from './update-collector';

async function run() {
  const token: string = core.getInput('github-token', { required: true });

  const pr = github.context.payload.issue!.number;
  const actionType: ActionType = github.context.payload.action! as ActionType;

  const gitHubClient = new GitHubClient(token, {
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pr,
  });

  const assessor = new LabelUpdateAssessor({
    labels: github.context.payload.issue!.labels.map((label: { name: any }) => label.name),
    client: gitHubClient,
    comment: {
      before: github.context.payload.changes?.body?.from,
      after: github.context.payload.comment!.body,
      author: github.context.payload.comment!.user.login,
    },
    actionType,
  });

  const collector = new LabelUpdateCollector(assessor, pr);
  const labelManager = new PullRequestCommentBasedLabelManager(collector);

  await labelManager.manageLabels();
  collector.printUpdates();
}

run().catch((error) => {
  core.setFailed(error.message);
});
