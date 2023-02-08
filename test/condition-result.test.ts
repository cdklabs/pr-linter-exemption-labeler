import { Condition } from '../src/common-types';
import { ConditionsResult } from '../src/condition-result';

describe('Condition Result tests', () => {
  test('All conditions are met when all conditions are met', async () => {
    const labels = ['label', 'another one'];
    const conditions: Condition[] = [
      {
        test: ([]) => true,
        expects: true,
        outputOnFailure: 'this failed',
      },
      {
        test: ([]) => false,
        expects: false,
        outputOnFailure: 'this also failed',
      },
    ];

    const result = new ConditionsResult(conditions, labels);
    expect(result.allConditionsMet).toEqual(true);
    expect(result.conditionsNotMet).toEqual([]);
  });

  test('All conditions are not met when no set of conditions are met', async () => {
    const labels = ['label', 'another one'];
    const conditions: Condition[] = [
      {
        test: ([]) => true,
        expects: false,
        outputOnFailure: 'this failed',
      },
      {
        test: ([]) => false,
        expects: true,
        outputOnFailure: 'this also failed',
      },
    ];

    const result = new ConditionsResult(conditions, labels);
    expect(result.allConditionsMet).toEqual(false);
    expect(result.conditionsNotMet).toEqual(['this failed', 'this also failed']);
  });

  test('All conditions are not met when one set of conditions are not met', async () => {
    const labels = ['label', 'another one'];
    const conditions: Condition[] = [
      {
        test: ([]) => true,
        expects: false,
        outputOnFailure: 'this failed',
      },
      {
        test: ([]) => false,
        expects: false,
        outputOnFailure: 'this also failed',
      },
    ];

    const result = new ConditionsResult(conditions, labels);
    expect(result.allConditionsMet).toEqual(false);
    expect(result.conditionsNotMet).toEqual(['this failed']);
  });
});
