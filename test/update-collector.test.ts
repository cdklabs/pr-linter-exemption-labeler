import { GitHubClient } from '../src/github-client';
import { LabelUpdateAssessor } from '../src/update-assessor';
import { LabelUpdateCollector } from '../src/update-collector';

const log = jest.spyOn(console, 'log');

describe('Update Collector Tests', () => {
  test('collects updates correctly when updates are made', async () => {
    const assessor = configureMock(['thing-1', 'thing-2']);
    const collector = new LabelUpdateCollector(assessor, 123);
    await collector.collectUpdate({
      labelUpdateConditions,
      getAssociatedLabel: () => undefined,
    });

    collector.printUpdates();
    expect(log).toHaveBeenCalledTimes(5);
    expect(log.mock.calls.flat()).toEqual([
      '**************************************',
      'Summary of updates for PR 123: ',
      '\tthing-1',
      '\tthing-2',
      '**************************************',
    ]);
  });

  test('prints no updates made when no updates are made', async () => {
    const assessor = configureMock([]);
    const collector = new LabelUpdateCollector(assessor, 123);
    await collector.collectUpdate({
      labelUpdateConditions,
      getAssociatedLabel: () => undefined,
    });

    collector.printUpdates();
    expect(log).toHaveBeenCalledTimes(4);
    expect(log.mock.calls.flat()).toEqual([
      '**************************************',
      'Summary of updates for PR 123: ',
      '\tNo actions to take on this PR',
      '**************************************',
    ]);
  });
});

function configureMock(updates: string[]): LabelUpdateAssessor {
  const client = new GitHubClient('token', {
    owner: 'me',
    repo: 'mine',
    pr: 123,
  });

  const assessor = new LabelUpdateAssessor({
    labels: [],
    client,
    comment: {
      after: 'after',
      author: 'me',
    },
    actionType: 'created',
  });

  assessor.tryPerformUpdate = jest.fn().mockResolvedValue(updates);
  return assessor;
}

const labelUpdateConditions = {
  created: [],
  deleted: [],
};
