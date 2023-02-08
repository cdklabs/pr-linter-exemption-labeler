import { Condition } from './common-types';

/**
 * Represents the result of testing against a set of conditions for adding or removing a label.
 */
export class ConditionsResult {
  /**
   * A list of conditions that were not met in the tests.
   */
  public conditionsNotMet: string[] = [];

  /**
   * Whether or not all conditions are met.
   */
  public allConditionsMet: boolean;

  constructor(private readonly conditions: Condition[], private readonly labels: string[]) {
    this.allConditionsMet = this.conditions
      .map((condition: Condition) => {
        const result = condition.test(this.labels) === condition.expects;
        result ? {} : this.conditionsNotMet.push(condition.outputOnFailure!);
        return result;
      })
      .every(Boolean);
  }
}
