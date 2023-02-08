import { Label } from './common-types';
import {
  contributorRequestsClarification,
  contributorRequestsExemption,
  labelAddedCliIntegTestComplete,
  labelAddedCliIntegTestNeeded,
  labelAddedExemptionDenied,
  labelAddedRequestsClarification,
  labelAddedRequestsExemption,
  prLinterRequestsCliIntegTestRun,
} from './conditions';
import { LabelUpdateCollector } from './update-collector';

/**
 * Tests comments for specific text and adds/removes labels based off whether or not the text is present.
 */
export class PullRequestCommentBasedLabelManager {
  constructor(private readonly labelUpdateCollector: LabelUpdateCollector) {}

  /**
   * Adds and removes labels based off content of comment.
   */
  public async manageLabels(): Promise<void> {
    await this.labelUpdateCollector.collectUpdate({
      getAssociatedLabel: contributorRequestsClarification,
      labelUpdateConditions: {
        created: [
          {
            test: labelAddedRequestsClarification,
            expects: false,
            outputOnFailure: 'it has already been added',
          },
        ],
        deleted: [
          {
            test: labelAddedRequestsClarification,
            expects: true,
            outputOnFailure: 'it was not present',
          },
        ],
      },
    });

    await this.labelUpdateCollector.collectUpdate({
      getAssociatedLabel: contributorRequestsExemption,
      labelUpdateConditions: {
        created: [
          {
            test: labelAddedRequestsExemption,
            expects: false,
            outputOnFailure: 'it has already been added',
          },
          {
            test: labelAddedExemptionDenied,
            expects: false,
            outputOnFailure: `label '${Label.EXEMPTION_DENIED}' is present`,
          },
        ],
        deleted: [
          {
            test: labelAddedRequestsExemption,
            expects: true,
            outputOnFailure: 'it was not present',
          },
        ],
      },
    });

    await this.labelUpdateCollector.collectUpdate({
      getAssociatedLabel: prLinterRequestsCliIntegTestRun,
      labelUpdateConditions: {
        created: [
          {
            test: labelAddedCliIntegTestNeeded,
            expects: false,
            outputOnFailure: 'it has already been added',
          },
          {
            test: labelAddedCliIntegTestComplete,
            expects: false,
            outputOnFailure: `label '${Label.CLI_INTEG_TESTED}' is present`,
          },
        ],
        deleted: [
          {
            test: labelAddedCliIntegTestNeeded,
            expects: true,
            outputOnFailure: 'already present',
          },
          {
            test: labelAddedCliIntegTestComplete,
            expects: false,
            outputOnFailure: `label '${Label.CLI_INTEG_TESTED}' is not present`,
          },
        ],
      },
    });
  }
}
