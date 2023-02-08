import { CommentText, Label, GitHubComment, ActionType } from '../src/common-types';
import { GitHubClient } from '../src/github-client';
import { PullRequestCommentBasedLabelManager } from '../src/label-manager';
import { LabelUpdateAssessor } from '../src/update-assessor';
import { LabelUpdateCollector } from '../src/update-collector';

const log = jest.spyOn(console, 'log');

describe('Label Manager Tests', () => {
  // Create
  describe('add labels on comment created', () => {
    test('add label for clarification needed when requested in comment', async () => {
      await manageLabels('created', { author: 'me', after: 'I have a clarification request.' }, []);

      expect(log.mock.calls.flat()).toEqual([
        'Label Added',
        '**************************************',
        'Summary of updates for PR 123: ',
        '\tComment created with clarification request',
        "\tLabel 'pr/reviewer-clarification-requested' added",
        '**************************************',
      ]);
    });

    test('add label for clarification needed when requested in comment regardless of casing and extra letters', async () => {
      await manageLabels('created', { author: 'me', after: 'cLaRiFiCaTiOn ReQuEsTed' }, []);
      expect(log.mock.calls.flat()).toEqual([
        'Label Added',
        '**************************************',
        'Summary of updates for PR 123: ',
        '\tComment created with clarification request',
        "\tLabel 'pr/reviewer-clarification-requested' added",
        '**************************************',
      ]);
    });

    test('add label for exemption needed when requested in comment', async () => {
      await manageLabels('created', { author: 'me', after: 'exemption request please' }, []);
      expect(log.mock.calls.flat()).toEqual([
        'Label Added',
        '**************************************',
        'Summary of updates for PR 123: ',
        '\tComment created with exemption request',
        "\tLabel 'pr-linter/exemption-requested' added",
        '**************************************',
      ]);
    });

    test('add label for exemption needed when requested in comment regardless of casing', async () => {
      await manageLabels('created', { author: 'me', after: 'eXeMpTiOn ReQuEsTeD' }, []);
      expect(log.mock.calls.flat()).toEqual([
        'Label Added',
        '**************************************',
        'Summary of updates for PR 123: ',
        '\tComment created with exemption request',
        "\tLabel 'pr-linter/exemption-requested' added",
        '**************************************',
      ]);
    });

    test('do not add label for exemption requested when exemption denied label is present', async () => {
      await manageLabels('created', { author: 'me', after: CommentText.EXEMPTION_REQUESTED }, [
        Label.EXEMPTION_DENIED,
      ]);
      expect(log.mock.calls.flat()).toEqual([
        '**************************************',
        'Summary of updates for PR 123: ',
        '\tComment created with exemption request',
        "\tLabel 'pr-linter/exemption-requested' not added because label 'pr-linter/no-exemption' is present",
        '**************************************',
      ]);
    });

    test('add label for clarification requested even when exemption denied label is present', async () => {
      await manageLabels('created', { author: 'me', after: CommentText.CLARIFICATION_REQUESTED }, [
        Label.EXEMPTION_DENIED,
      ]);
      expect(log.mock.calls.flat()).toEqual([
        'Label Added',
        '**************************************',
        'Summary of updates for PR 123: ',
        '\tComment created with clarification request',
        "\tLabel 'pr/reviewer-clarification-requested' added",
        '**************************************',
      ]);
    });

    test('add label for both when both are requested and no denial has been given', async () => {
      await manageLabels(
        'created',
        {
          author: 'me',
          after: 'clarification requested and exemption requested',
        },
        []
      );
      expect(log.mock.calls.flat()).toEqual([
        'Label Added',
        'Label Added',
        '**************************************',
        'Summary of updates for PR 123: ',
        '\tComment created with clarification request',
        "\tLabel 'pr/reviewer-clarification-requested' added",
        '\tComment created with exemption request',
        "\tLabel 'pr-linter/exemption-requested' added",
        '**************************************',
      ]);
    });

    test('add label for just clarification when both are requested and a exemption has been denied', async () => {
      await manageLabels(
        'created',
        {
          author: 'me',
          after: 'Clarification requested and Exemption requested',
        },
        [Label.EXEMPTION_DENIED]
      );
      expect(log.mock.calls.flat()).toEqual([
        'Label Added',
        '**************************************',
        'Summary of updates for PR 123: ',
        '\tComment created with clarification request',
        "\tLabel 'pr/reviewer-clarification-requested' added",
        '\tComment created with exemption request',
        "\tLabel 'pr-linter/exemption-requested' not added because label 'pr-linter/no-exemption' is present",
        '**************************************',
      ]);
    });

    test('add label for neither when neither are requested', async () => {
      await manageLabels(
        'created',
        {
          author: 'me',
          after: 'All good here. This comment is for something else',
        },
        []
      );
      expect(log.mock.calls.flat()).toEqual([
        '**************************************',
        'Summary of updates for PR 123: ',
        '\tNo actions to take on this PR',
        '**************************************',
      ]);
    });

    test('add no label when clarification is requested but label is already present', async () => {
      await manageLabels('created', { author: 'me', after: CommentText.CLARIFICATION_REQUESTED }, [
        Label.CLARIFICATION_REQUESTED,
      ]);
      expect(log.mock.calls.flat()).toEqual([
        '**************************************',
        'Summary of updates for PR 123: ',
        '\tComment created with clarification request',
        "\tLabel 'pr/reviewer-clarification-requested' not added because it has already been added",
        '**************************************',
      ]);
    });

    test('add no label when exemption is requested but label is already present', async () => {
      await manageLabels('created', { author: 'me', after: CommentText.EXEMPTION_REQUESTED }, [
        Label.EXEMPTION_REQUESTED,
      ]);
      expect(log.mock.calls.flat()).toEqual([
        '**************************************',
        'Summary of updates for PR 123: ',
        '\tComment created with exemption request',
        "\tLabel 'pr-linter/exemption-requested' not added because it has already been added",
        '**************************************',
      ]);
    });

    test('add label for clarification when exemption label is already present', async () => {
      await manageLabels('created', { author: 'me', after: CommentText.CLARIFICATION_REQUESTED }, [
        Label.EXEMPTION_REQUESTED,
      ]);
      expect(log.mock.calls.flat()).toEqual([
        'Label Added',
        '**************************************',
        'Summary of updates for PR 123: ',
        '\tComment created with clarification request',
        "\tLabel 'pr/reviewer-clarification-requested' added",
        '**************************************',
      ]);
    });

    test('add label for exemption when clarification label is already present', async () => {
      await manageLabels('created', { author: 'me', after: CommentText.EXEMPTION_REQUESTED }, [
        Label.CLARIFICATION_REQUESTED,
      ]);
      expect(log.mock.calls.flat()).toEqual([
        'Label Added',
        '**************************************',
        'Summary of updates for PR 123: ',
        '\tComment created with exemption request',
        "\tLabel 'pr-linter/exemption-requested' added",
        '**************************************',
      ]);
    });

    test('add label for clarification but not exception when both are requested but exemption label is already present', async () => {
      await manageLabels(
        'created',
        {
          author: 'me',
          after: 'Clarification requested and Exemption requested',
        },
        [Label.EXEMPTION_REQUESTED]
      );
      expect(log.mock.calls.flat()).toEqual([
        'Label Added',
        '**************************************',
        'Summary of updates for PR 123: ',
        '\tComment created with clarification request',
        "\tLabel 'pr/reviewer-clarification-requested' added",
        '\tComment created with exemption request',
        "\tLabel 'pr-linter/exemption-requested' not added because it has already been added",
        '**************************************',
      ]);
    });

    test('add label for exemption but not clarification when both are requested and clarification label is already present', async () => {
      await manageLabels(
        'created',
        {
          author: 'me',
          after: 'Clarification requested and Exemption requested',
        },
        [Label.CLARIFICATION_REQUESTED]
      );
      expect(log.mock.calls.flat()).toEqual([
        'Label Added',
        '**************************************',
        'Summary of updates for PR 123: ',
        '\tComment created with clarification request',
        "\tLabel 'pr/reviewer-clarification-requested' not added because it has already been added",
        '\tComment created with exemption request',
        "\tLabel 'pr-linter/exemption-requested' added",
        '**************************************',
      ]);
    });

    test('add label for clarification but not exemption when both are requested but exemption has been denied', async () => {
      await manageLabels(
        'created',
        {
          author: 'me',
          after: 'Clarification requested and Exemption requested',
        },
        [Label.EXEMPTION_DENIED]
      );
      expect(log.mock.calls.flat()).toEqual([
        'Label Added',
        '**************************************',
        'Summary of updates for PR 123: ',
        '\tComment created with clarification request',
        "\tLabel 'pr/reviewer-clarification-requested' added",
        '\tComment created with exemption request',
        "\tLabel 'pr-linter/exemption-requested' not added because label 'pr-linter/no-exemption' is present",
        '**************************************',
      ]);
    });
  });

  // Delete
  describe('remove labels on comment deletion', () => {
    test('clarification requested and label is present on PR', async () => {
      await manageLabels('deleted', { author: 'me', after: CommentText.CLARIFICATION_REQUESTED }, [
        Label.CLARIFICATION_REQUESTED,
      ]);
      expect(log.mock.calls.flat()).toEqual([
        'Label Removed',
        '**************************************',
        'Summary of updates for PR 123: ',
        '\tComment deleted with clarification request',
        "\tLabel 'pr/reviewer-clarification-requested' removed",
        '**************************************',
      ]);
    });

    test('clarification requested but label is not present on PR', async () => {
      await manageLabels(
        'deleted',
        { author: 'me', after: CommentText.CLARIFICATION_REQUESTED },
        []
      );
      expect(log.mock.calls.flat()).toEqual([
        '**************************************',
        'Summary of updates for PR 123: ',
        '\tComment deleted with clarification request',
        "\tLabel 'pr/reviewer-clarification-requested' not removed because it was not present",
        '**************************************',
      ]);
    });

    test('exemption requested and label is present on PR', async () => {
      await manageLabels('deleted', { author: 'me', after: CommentText.EXEMPTION_REQUESTED }, [
        Label.EXEMPTION_REQUESTED,
      ]);
      expect(log.mock.calls.flat()).toEqual([
        'Label Removed',
        '**************************************',
        'Summary of updates for PR 123: ',
        '\tComment deleted with exemption request',
        "\tLabel 'pr-linter/exemption-requested' removed",
        '**************************************',
      ]);
    });

    test('exemption requested but label is not present on PR', async () => {
      await manageLabels('deleted', { author: 'me', after: CommentText.EXEMPTION_REQUESTED }, []);
      expect(log.mock.calls.flat()).toEqual([
        '**************************************',
        'Summary of updates for PR 123: ',
        '\tComment deleted with exemption request',
        "\tLabel 'pr-linter/exemption-requested' not removed because it was not present",
        '**************************************',
      ]);
    });

    test('both requested and labels are present on PR', async () => {
      await manageLabels(
        'deleted',
        {
          author: 'me',
          after: 'exemption requested and clarification requested',
        },
        [Label.CLARIFICATION_REQUESTED, Label.EXEMPTION_REQUESTED]
      );
      expect(log.mock.calls.flat()).toEqual([
        'Label Removed',
        'Label Removed',
        '**************************************',
        'Summary of updates for PR 123: ',
        '\tComment deleted with clarification request',
        "\tLabel 'pr/reviewer-clarification-requested' removed",
        '\tComment deleted with exemption request',
        "\tLabel 'pr-linter/exemption-requested' removed",
        '**************************************',
      ]);
    });

    test('both requested but neither are present on PR', async () => {
      await manageLabels(
        'deleted',
        {
          author: 'me',
          after: 'exemption requested and clarification requested',
        },
        []
      );
      expect(log.mock.calls.flat()).toEqual([
        '**************************************',
        'Summary of updates for PR 123: ',
        '\tComment deleted with clarification request',
        "\tLabel 'pr/reviewer-clarification-requested' not removed because it was not present",
        '\tComment deleted with exemption request',
        "\tLabel 'pr-linter/exemption-requested' not removed because it was not present",
        '**************************************',
      ]);
    });

    test('clarification requested but exemption request label is on PR', async () => {
      await manageLabels('deleted', { author: 'me', after: CommentText.CLARIFICATION_REQUESTED }, [
        Label.EXEMPTION_REQUESTED,
      ]);
      expect(log.mock.calls.flat()).toEqual([
        '**************************************',
        'Summary of updates for PR 123: ',
        '\tComment deleted with clarification request',
        "\tLabel 'pr/reviewer-clarification-requested' not removed because it was not present",
        '**************************************',
      ]);
    });

    test('exemption requested but clarification request is on PR', async () => {
      await manageLabels('deleted', { author: 'me', after: CommentText.EXEMPTION_REQUESTED }, [
        Label.CLARIFICATION_REQUESTED,
      ]);
      expect(log.mock.calls.flat()).toEqual([
        '**************************************',
        'Summary of updates for PR 123: ',
        '\tComment deleted with exemption request',
        "\tLabel 'pr-linter/exemption-requested' not removed because it was not present",
        '**************************************',
      ]);
    });

    test('neither requested but both labels are present on PR', async () => {
      await manageLabels('deleted', { author: 'me', after: 'nothing needed here' }, [
        Label.CLARIFICATION_REQUESTED,
        Label.EXEMPTION_REQUESTED,
      ]);
      expect(log.mock.calls.flat()).toEqual([
        '**************************************',
        'Summary of updates for PR 123: ',
        '\tNo actions to take on this PR',
        '**************************************',
      ]);
    });

    test('neither requested and neither labels are present on PR', async () => {
      await manageLabels('deleted', { author: 'me', after: 'still need nothing' }, []);
      expect(log.mock.calls.flat()).toEqual([
        '**************************************',
        'Summary of updates for PR 123: ',
        '\tNo actions to take on this PR',
        '**************************************',
      ]);
    });

    describe('update labels on comment updated', () => {
      test('no changes are made when no requests and no labels are present in either before or after', async () => {
        await manageLabels(
          'edited',
          { author: 'me', before: 'needs nothing', after: 'still need nothing' },
          []
        );
        expect(log.mock.calls.flat()).toEqual([
          '**************************************',
          'Summary of updates for PR 123: ',
          '\tNo actions to take on this PR',
          '**************************************',
        ]);
      });

      test('no changes are made when clarification requested in before and after and no labels are present', async () => {
        await manageLabels(
          'edited',
          {
            author: 'me',
            before: CommentText.CLARIFICATION_REQUESTED,
            after: CommentText.CLARIFICATION_REQUESTED,
          },
          []
        );
        expect(log.mock.calls.flat()).toEqual([
          '**************************************',
          'Summary of updates for PR 123: ',
          '\tComment edited with clarification request',
          "\tNo action taken from comment edit for label 'pr/reviewer-clarification-requested'",
          '**************************************',
        ]);
      });

      test('no changes are made when exemption requested in before and after and no labels are present', async () => {
        await manageLabels(
          'edited',
          {
            author: 'me',
            before: CommentText.EXEMPTION_REQUESTED,
            after: CommentText.EXEMPTION_REQUESTED,
          },
          []
        );
        expect(log.mock.calls.flat()).toEqual([
          '**************************************',
          'Summary of updates for PR 123: ',
          '\tComment edited with exemption request',
          "\tNo action taken from comment edit for label 'pr-linter/exemption-requested'",
          '**************************************',
        ]);
      });

      test('no changes are made when cli tests requested by contributor in before and after and no labels are present', async () => {
        await manageLabels(
          'edited',
          {
            author: 'me',
            before: CommentText.CLI_INTEG_TESTS_NEEDED,
            after: CommentText.CLI_INTEG_TESTS_NEEDED,
          },
          []
        );
        expect(log.mock.calls.flat()).toEqual([
          '**************************************',
          'Summary of updates for PR 123: ',
          '\tNo actions to take on this PR',
          '**************************************',
        ]);
      });

      test('some labels are added when author is contributor and all requests are made in after', async () => {
        await manageLabels(
          'edited',
          {
            author: 'me',
            after: `${CommentText.CLARIFICATION_REQUESTED} ${CommentText.EXEMPTION_REQUESTED} ${CommentText.CLI_INTEG_TESTS_NEEDED}`,
          },
          []
        );
        expect(log.mock.calls.flat()).toEqual([
          'Label Added',
          'Label Added',
          '**************************************',
          'Summary of updates for PR 123: ',
          '\tComment edited with clarification request',
          "\tLabel 'pr/reviewer-clarification-requested' added",
          '\tComment edited with exemption request',
          "\tLabel 'pr-linter/exemption-requested' added",
          '**************************************',
        ]);
      });

      test('some labels are removed when author is contributor and all requests are made in before', async () => {
        await manageLabels(
          'edited',
          {
            author: 'me',
            before: `${CommentText.CLARIFICATION_REQUESTED} ${CommentText.EXEMPTION_REQUESTED} ${CommentText.CLI_INTEG_TESTS_NEEDED}`,
            after: 'never mind, all good',
          },
          [Label.CLARIFICATION_REQUESTED, Label.EXEMPTION_REQUESTED]
        );
        expect(log.mock.calls.flat()).toEqual([
          'Label Removed',
          'Label Removed',
          '**************************************',
          'Summary of updates for PR 123: ',
          '\tComment edited with clarification request',
          "\tLabel 'pr/reviewer-clarification-requested' removed",
          '\tComment edited with exemption request',
          "\tLabel 'pr-linter/exemption-requested' removed",
          '**************************************',
        ]);
      });

      test('some labels are swapped when author is contributor and requests are changed in before and after', async () => {
        await manageLabels(
          'edited',
          {
            author: 'me',
            before: ` ${CommentText.CLI_INTEG_TESTS_NEEDED} ${CommentText.EXEMPTION_REQUESTED}`,
            after: `${CommentText.CLARIFICATION_REQUESTED} `,
          },
          [Label.EXEMPTION_REQUESTED]
        );
        expect(log.mock.calls.flat()).toEqual([
          'Label Added',
          'Label Removed',
          '**************************************',
          'Summary of updates for PR 123: ',
          '\tComment edited with clarification request',
          "\tLabel 'pr/reviewer-clarification-requested' added",
          '\tComment edited with exemption request',
          "\tLabel 'pr-linter/exemption-requested' removed",
          '**************************************',
        ]);
      });

      test('no labels are changed when author is contributor, exemption and cli tests are requested in after, and exemption is denied', async () => {
        await manageLabels(
          'edited',
          {
            author: 'me',
            before: 'YOLO',
            after: ` ${CommentText.CLI_INTEG_TESTS_NEEDED} ${CommentText.EXEMPTION_REQUESTED}`,
          },
          [Label.EXEMPTION_DENIED]
        );
        expect(log.mock.calls.flat()).toEqual([
          '**************************************',
          'Summary of updates for PR 123: ',
          '\tComment edited with exemption request',
          "\tLabel 'pr-linter/exemption-requested' not added because label 'pr-linter/no-exemption' is present",
          '**************************************',
        ]);
      });
    });
  });
});

async function manageLabels(updateType: ActionType, comment: GitHubComment, labels: string[]) {
  const client = new GitHubClient('token', {
    owner: 'me',
    repo: 'mine',
    pr: 123,
  });

  const assessor = new LabelUpdateAssessor({
    labels,
    client,
    comment,
    actionType: updateType,
  });

  const collector = new LabelUpdateCollector(assessor, 123);
  const manager = new PullRequestCommentBasedLabelManager(collector);
  await manager.manageLabels();
  collector.printUpdates();
}
