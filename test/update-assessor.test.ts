import { mockAddLabels } from './__mocks__/@octokit/rest';
import { CommentText, GitHubComment, Label, ActionType } from '../src/common-types';
import { GitHubClient } from '../src/github-client';
import { LabelUpdateAssessor } from '../src/update-assessor';

describe('Update Assessor Tests', () => {
  test('on comment created without relevant text, no action is taken', async () => {
    const assessor = configureMock({ actionType: 'created' });
    const updates = await assessor.tryPerformUpdate({
      getAssociatedLabel: () => undefined,
      labelUpdateConditions,
    });
    expect(updates).toEqual([]);
  });

  test('on comment deleted without relevant text, no action is taken', async () => {
    const assessor = configureMock({ actionType: 'deleted' });
    const updates = await assessor.tryPerformUpdate({
      getAssociatedLabel: () => undefined,
      labelUpdateConditions,
    });
    expect(updates).toEqual([]);
  });

  test('on comment updated without relevant text, no action is taken', async () => {
    const assessor = configureMock({ actionType: 'edited' });
    const updates = await assessor.tryPerformUpdate({
      getAssociatedLabel: () => undefined,
      labelUpdateConditions,
    });
    expect(updates).toEqual([]);
  });

  test('on comment created with relevant text, but failing conditions, log reflects this', async () => {
    const assessor = configureMock({ actionType: 'created' });
    const updates = await assessor.tryPerformUpdate({
      getAssociatedLabel,
      labelUpdateConditions: labelUpdateConditionsFailed,
    });
    expect(updates).toEqual([
      'Comment created with clarification request',
      "Label 'pr/reviewer-clarification-requested' not added because nope, failed",
    ]);
  });

  test('on comment deleted with relevant text, but failing conditions, log reflects this', async () => {
    const assessor = configureMock({ actionType: 'deleted' });
    const updates = await assessor.tryPerformUpdate({
      getAssociatedLabel,
      labelUpdateConditions: labelUpdateConditionsFailed,
    });
    expect(updates).toEqual([
      'Comment deleted with clarification request',
      "Label 'pr/reviewer-clarification-requested' not removed because nope, failed",
    ]);
  });

  test('on comment updated with relevant text in before, but failing conditions, log reflects this', async () => {
    const assessor = configureMock({
      actionType: 'edited',
      comment: {
        before: commentWithBefore.before,
        after: 'nothing needed',
        author: 'me',
      },
    });
    const updates = await assessor.tryPerformUpdate({
      getAssociatedLabel,
      labelUpdateConditions: labelUpdateConditionsFailed,
    });
    expect(updates).toEqual([
      'Comment edited with clarification request',
      "Label 'pr/reviewer-clarification-requested' not removed because nope, failed",
    ]);
  });

  test('on comment updated with relevant text in after, but failing conditions, log reflects this', async () => {
    const assessor = configureMock({
      actionType: 'edited',
      comment: {
        before: 'nothing needed',
        after: commentWithBefore.after,
        author: 'me',
      },
    });
    const updates = await assessor.tryPerformUpdate({
      getAssociatedLabel,
      labelUpdateConditions: {
        created: labelUpdateConditionsFailed.created,
        deleted: labelUpdateConditions.deleted,
      },
    });
    expect(updates).toEqual([
      'Comment edited with clarification request',
      "Label 'pr/reviewer-clarification-requested' not added because nope, failed",
    ]);
  });

  test('on comment updated with relevant text, but failing conditions, log reflects this', async () => {
    const assessor = configureMock({ actionType: 'edited' });
    const updates = await assessor.tryPerformUpdate({
      getAssociatedLabel,
      labelUpdateConditions: labelUpdateConditionsFailed,
    });
    expect(updates).toEqual([
      'Comment edited with clarification request',
      "No action taken from comment edit for label 'pr/reviewer-clarification-requested'",
    ]);
  });

  test('on comment created with relevant text and passing conditions updates are made', async () => {
    const assessor = configureMock({ actionType: 'created' });
    const updates = await assessor.tryPerformUpdate({
      getAssociatedLabel,
      labelUpdateConditions,
    });
    expect(updates).toEqual([
      'Comment created with clarification request',
      "Label 'pr/reviewer-clarification-requested' added",
    ]);
  });

  test('on comment deleted with relevant text and passing conditions updates are made', async () => {
    const assessor = configureMock({ actionType: 'deleted' });
    const updates = await assessor.tryPerformUpdate({
      getAssociatedLabel,
      labelUpdateConditions,
    });
    expect(updates).toEqual([
      'Comment deleted with clarification request',
      "Label 'pr/reviewer-clarification-requested' removed",
    ]);
  });

  test('on error from GitHub client', async () => {
    const error = new Error('something went wrong here');
    mockAddLabels.mockRejectedValue(error);
    const assessor = configureMock({ actionType: 'created' });

    await expect(async () => {
      await assessor.tryPerformUpdate({
        getAssociatedLabel,
        labelUpdateConditions,
      });
    }).rejects.toEqual(error);
  });
});

const getAssociatedLabel = (commentBody?: string) => {
  if (commentBody) {
    if (commentBody.includes('help')) {
      return {
        commentText: CommentText.CLARIFICATION_REQUESTED,
        label: Label.CLARIFICATION_REQUESTED,
      };
    } else {
      return undefined;
    }
  }

  throw new Error();
};

interface ConfigureMockProps {
  actionType: ActionType;
  labels?: string[];
  comment?: GitHubComment;
}
function configureMock(props: ConfigureMockProps): LabelUpdateAssessor {
  const client = new GitHubClient('token', {
    owner: 'me',
    repo: 'mine',
    pr: 123,
  });

  return new LabelUpdateAssessor({
    labels: props.labels ?? [],
    client,
    comment: props.comment
      ? props.comment
      : props.actionType === 'edited'
      ? commentWithBefore
      : comment,
    actionType: props.actionType,
  });
}

const comment: GitHubComment = {
  after: 'My PR is perfect and I do not need help',
  author: 'me',
};

const commentWithBefore: GitHubComment = {
  before: 'My RP is perfect and I do not need help',
  after: 'My PR is perfect and I do not need help',
  author: 'me',
};

const labelUpdateConditions = {
  created: [
    {
      test: () => true,
      expects: true,
      outputOnFailure: 'nope, failed',
    },
  ],
  deleted: [
    {
      test: () => true,
      expects: true,
      outputOnFailure: 'nope, failed',
    },
  ],
};

const labelUpdateConditionsFailed = {
  created: [
    {
      test: () => true,
      expects: false,
      outputOnFailure: 'nope, failed',
    },
  ],
  deleted: [
    {
      test: () => true,
      expects: false,
      outputOnFailure: 'nope, failed',
    },
  ],
};
