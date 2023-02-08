import { CommentText, Label } from '../src/common-types';
import {
  contributorRequestsClarification,
  contributorRequestsExemption,
  labelAddedCliIntegTestComplete,
  labelAddedCliIntegTestNeeded,
  labelAddedExemptionDenied,
  labelAddedRequestsClarification,
  labelAddedRequestsExemption,
  prLinterRequestsCliIntegTestRun,
} from '../src/conditions';

describe('Conditions Functions Tests', () => {
  describe('contributorRequestsClarification tests', () => {
    test('returns true when comment contains expected text in various forms and author is contributor', async () => {
      clarificationRequestValidText.forEach((str) => {
        expect(contributorRequestsClarification(str, authorIsContributor)).toEqual({
          label: Label.CLARIFICATION_REQUESTED,
          commentText: CommentText.CLARIFICATION_REQUESTED,
        });
      });
    });

    test('returns undefined when comment contains expected text and author is automation', async () => {
      clarificationRequestValidText.forEach((str) => {
        expect(contributorRequestsClarification(str, authorIsAutomation)).toEqual(undefined);
      });
    });

    test('returns undefined when comment contains unexpected text and author is contributor', async () => {
      [...invalidRequestText, ...exemptionRequestValidText, ...cliIntegTestRunValidText].forEach(
        (str) => {
          expect(contributorRequestsClarification(str, authorIsContributor)).toEqual(undefined);
        }
      );
    });

    test('returns undefined when comment contains unexpected text and author is automation', async () => {
      [...invalidRequestText, ...exemptionRequestValidText, ...cliIntegTestRunValidText].forEach(
        (str) => {
          expect(contributorRequestsClarification(str, authorIsAutomation)).toEqual(undefined);
        }
      );
    });
  });

  describe('contributorRequestsExemption tests', () => {
    test('returns true when comment contains expected text in various forms and author is contributor', async () => {
      exemptionRequestValidText.forEach((str) => {
        expect(contributorRequestsExemption(str, authorIsContributor)).toEqual({
          label: Label.EXEMPTION_REQUESTED,
          commentText: CommentText.EXEMPTION_REQUESTED,
        });
      });
    });

    test('returns undefined when comment contains expected text and author is automation', async () => {
      exemptionRequestValidText.forEach((str) => {
        expect(contributorRequestsExemption(str, authorIsAutomation)).toEqual(undefined);
      });
    });

    test('returns undefined when comment contains unexpected text and author is contributor', async () => {
      [
        ...invalidRequestText,
        ...clarificationRequestValidText,
        ...cliIntegTestRunValidText,
      ].forEach((str) => {
        expect(contributorRequestsExemption(str, authorIsContributor)).toEqual(undefined);
      });
    });

    test('returns false when comment contains unexpected text and author is automation', async () => {
      [
        ...invalidRequestText,
        ...clarificationRequestValidText,
        ...cliIntegTestRunValidText,
      ].forEach((str) => {
        expect(contributorRequestsClarification(str, authorIsAutomation)).toEqual(undefined);
      });
    });
  });

  describe('prLinterRequestsCliIntegTestRun tests', () => {
    test('returns true when comment contains expected text in various forms and author is automation', async () => {
      cliIntegTestRunValidText.forEach((str) => {
        expect(prLinterRequestsCliIntegTestRun(str, authorIsAutomation)).toEqual({
          label: Label.CLI_INTEG_TESTS_NEEDED,
          commentText: CommentText.CLI_INTEG_TESTS_NEEDED,
        });
      });
    });

    test('returns undefined when comment contains expected text and author is contributor', async () => {
      cliIntegTestRunValidText.forEach((str) => {
        expect(prLinterRequestsCliIntegTestRun(str, authorIsContributor)).toEqual(undefined);
      });
    });

    test('returns undefined when comment contains unexpected text and author is automation', async () => {
      [
        ...invalidRequestText,
        ...exemptionRequestValidText,
        ...clarificationRequestValidText,
      ].forEach((str) => {
        expect(prLinterRequestsCliIntegTestRun(str, authorIsAutomation)).toEqual(undefined);
      });
    });

    test('returns undefined when comment contains unexpected text and author is contributor', async () => {
      [
        ...invalidRequestText,
        ...exemptionRequestValidText,
        ...clarificationRequestValidText,
      ].forEach((str) => {
        expect(prLinterRequestsCliIntegTestRun(str, authorIsContributor)).toEqual(undefined);
      });
    });
  });

  describe('labelAddedRequestsClarification tests', () => {
    test('returns true when label is found', async () => {
      expect(labelAddedRequestsClarification([Label.CLARIFICATION_REQUESTED])).toEqual(true);
    });

    test('returns true when label is found among other labels', async () => {
      expect(labelAddedRequestsClarification(relevantLabels)).toEqual(true);
    });

    test('returns true when label is found and irrelevant labels are present', async () => {
      expect(labelAddedRequestsClarification([...relevantLabels, ...irrelevantLabels])).toEqual(
        true
      );
    });

    test('returns false when label is not found', async () => {
      expect(labelAddedRequestsClarification(irrelevantLabels)).toEqual(false);
    });

    test('returns false when no labels are present', async () => {
      expect(labelAddedRequestsClarification([])).toEqual(false);
    });
  });

  describe('labelAddedRequestsExemption tests', () => {
    test('returns true when label is found', async () => {
      expect(labelAddedRequestsExemption([Label.EXEMPTION_REQUESTED])).toEqual(true);
    });

    test('returns true when label is found among other labels', async () => {
      expect(labelAddedRequestsExemption(relevantLabels)).toEqual(true);
    });

    test('returns true when label is found and irrelevant labels are present', async () => {
      expect(labelAddedRequestsExemption([...relevantLabels, ...irrelevantLabels])).toEqual(true);
    });

    test('returns false when label is not found', async () => {
      expect(labelAddedRequestsExemption(irrelevantLabels)).toEqual(false);
    });

    test('returns false when no labels are present', async () => {
      expect(labelAddedRequestsExemption([])).toEqual(false);
    });
  });

  describe('labelAddedExemptionDenied tests', () => {
    test('returns true when label is found', async () => {
      expect(labelAddedExemptionDenied([Label.EXEMPTION_DENIED])).toEqual(true);
    });

    test('returns true when label is found among other labels', async () => {
      expect(labelAddedExemptionDenied(relevantLabels)).toEqual(true);
    });

    test('returns true when label is found and irrelevant labels are present', async () => {
      expect(labelAddedExemptionDenied([...relevantLabels, ...irrelevantLabels])).toEqual(true);
    });

    test('returns false when label is not found', async () => {
      expect(labelAddedExemptionDenied(irrelevantLabels)).toEqual(false);
    });

    test('returns false when no labels are present', async () => {
      expect(labelAddedExemptionDenied([])).toEqual(false);
    });
  });

  describe('labelAddedCliIntegTestNeeded tests', () => {
    test('returns true when label is found', async () => {
      expect(labelAddedCliIntegTestNeeded([Label.CLI_INTEG_TESTS_NEEDED])).toEqual(true);
    });

    test('returns true when label is found among other labels', async () => {
      expect(labelAddedCliIntegTestNeeded(relevantLabels)).toEqual(true);
    });

    test('returns true when label is found and irrelevant labels are present', async () => {
      expect(labelAddedCliIntegTestNeeded([...relevantLabels, ...irrelevantLabels])).toEqual(true);
    });

    test('returns false when label is not found', async () => {
      expect(labelAddedCliIntegTestNeeded(irrelevantLabels)).toEqual(false);
    });

    test('returns false when no labels are present', async () => {
      expect(labelAddedCliIntegTestNeeded([])).toEqual(false);
    });
  });

  describe('labelAddedCliIntegTestComplete tests', () => {
    test('returns true when label is found', async () => {
      expect(labelAddedCliIntegTestComplete([Label.CLI_INTEG_TESTED])).toEqual(true);
    });

    test('returns true when label is found among other labels', async () => {
      expect(labelAddedCliIntegTestComplete(relevantLabels)).toEqual(true);
    });

    test('returns true when label is found and irrelevant labels are present', async () => {
      expect(labelAddedCliIntegTestComplete([...relevantLabels, ...irrelevantLabels])).toEqual(
        true
      );
    });

    test('returns false when label is not found', async () => {
      expect(labelAddedCliIntegTestComplete(irrelevantLabels)).toEqual(false);
    });

    test('returns false when no labels are present', async () => {
      expect(labelAddedCliIntegTestComplete([])).toEqual(false);
    });
  });
});

const authorIsContributor = 'contributor';
const authorIsAutomation = 'aws-cdk-automation';

const clarificationRequestValidText = [
  'clarification request',
  'clarification requested',
  'CLARIFICATION REQUEST',
  'I have a clarification request:',
  'cLaRiFiCaTiOn ReQuEsTeD',
  'aclarification requests',
  CommentText.CLARIFICATION_REQUESTED,
];

const exemptionRequestValidText = [
  'exemption request',
  'exemption requested',
  'EXEMPTION REQUEST',
  'I have an exemption request:',
  'eXeMpTiOn ReQuEsTeD',
  'anexemption requests',
  CommentText.EXEMPTION_REQUESTED,
];

const cliIntegTestRunValidText = [CommentText.CLI_INTEG_TESTS_NEEDED];

const invalidRequestText = [
  'I need help',
  'emxemption requested',
  'carification requested',
  'CLI WHAT?',
];

const relevantLabels = [
  Label.CLARIFICATION_REQUESTED,
  Label.CLI_INTEG_TESTED,
  Label.CLI_INTEG_TESTS_NEEDED,
  Label.EXEMPTION_DENIED,
  Label.EXEMPTION_REQUESTED,
];

const irrelevantLabels = ['p2', 'pr/do-not-merge', 'idk-whatever', ...invalidRequestText];
