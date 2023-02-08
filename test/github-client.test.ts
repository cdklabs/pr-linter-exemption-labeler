import { Label } from '../src/common-types';
import { GitHubClient } from '../src/github-client';

const client = new GitHubClient('token', {
  owner: 'me',
  repo: 'mine',
  pr: 123,
});

describe('GitHub Client Tests', () => {
  test('when comment is created addLabels is called by client', async () => {
    const added = await client.updateLabelOnPullRequest({
      label: Label.CLARIFICATION_REQUESTED,
      updateType: 'created',
    });
    expect(added).toEqual('Label Added');
  });

  test('when comment is deleted removeLabel is called by client', async () => {
    const added = await client.updateLabelOnPullRequest({
      label: Label.CLARIFICATION_REQUESTED,
      updateType: 'deleted',
    });
    expect(added).toEqual('Label Removed');
  });
});
