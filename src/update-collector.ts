import { LabelUpdateConditionOptions, NO_ACTIONS } from './common-types';
import { LabelUpdateAssessor } from './update-assessor';

/**
 * Represents all of the updates being made to the labels for this PR.
 */
export class LabelUpdateCollector {
  private readonly labelUpdateMessages: string[] = [];

  constructor(
    private readonly labelUpdateAssessor: LabelUpdateAssessor,
    private readonly pr: number
  ) {}

  /**
   * Collects the label updates.
   * @param labelUpdateOptions A set of options for making a label update on the PR.
   */
  public async collectUpdate(labelUpdateOptions: LabelUpdateConditionOptions): Promise<void> {
    const update = await this.labelUpdateAssessor.tryPerformUpdate(labelUpdateOptions);
    this.labelUpdateMessages.push(...update);
  }

  /**
   * Prints a user friendly summary of label updates that were made.
   */
  public printUpdates() {
    if (this.labelUpdateMessages.length === 0) {
      this.labelUpdateMessages.push(NO_ACTIONS);
    }

    console.log('**************************************');
    console.log(`Summary of updates for PR ${this.pr}: `);
    this.labelUpdateMessages.forEach((x) => console.log(`\t${x}`));
    console.log('**************************************');
  }
}
