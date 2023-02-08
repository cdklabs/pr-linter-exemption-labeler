/**
 * The comment triggering the GitHub Action.
 */
export interface GitHubComment {
  /**
   * The body of the comment before the comment was updated.
   * Undefined when action type is `created` or `deleted`.
   */
  readonly before?: string;

  /**
   * The body of the comment being created or deleted.
   * On `updated`, this is the updated comment body after the update.
   */
  readonly after: string;

  /**
   * The username of the author of the comment.
   */
  readonly author: string;
}

/**
 * The possible update types performed on the PR's label by this automation.
 */
export type UpdateType = 'created' | 'deleted';

/**
 * The possible action types performed on the comment under test.
 */
export type ActionType = UpdateType | 'edited';

/**
 * Indicates that no actions are being taken on the PR.
 */
export const NO_ACTIONS = 'No actions to take on this PR';

/**
 * The set of Label and CommentText enums that correspond with each other.
 */
export type LabelAssociation = {
  /**
   * The label to added to or removed from the pull request based off the comment text.
   */
  readonly label: Label;

  /**
   * The comment text to search for in the comment to determine if the label should be added or removed.
   */
  readonly commentText: CommentText;
};

/**
 * A type representing a function to get the CommentText and Label associated with the comment body
 */
export type LabelAssociationFunction = (
  author: string,
  commentBody: string
) => LabelAssociation | undefined;

/**
 * Represents a set of tests and the conditions under which label updates are made.
 */
export interface LabelUpdateConditionOptions {
  /**
   * The function to find the label associated with the comment text found in the comment body.
   * If no CommentText value is found in the comment body, returns undefined.
   */
  readonly getAssociatedLabel: LabelAssociationFunction;

  /**
   * The set of rules to test against to decide whether or not to perform the update.
   */
  readonly labelUpdateConditions: LabelUpdateConditions;
}

/**
 * Properties used for updating a label on a PR.
 */
export interface LabelUpdateProps {
  /**
   * The Label to be updated.
   */
  readonly label: Label;

  /**
   * The type of update being made on the label.
   */
  readonly updateType: UpdateType;
}

/**
 * Represents a set of conditions under which label updates are made.
 */
export interface LabelUpdateConditions {
  /**
   * The conditions to test if the action taken on the comment was `created`.
   */
  created: Condition[];

  /**
   * The conditions to test if the action taken on the comment was `deleted`.
   */
  deleted: Condition[];
}

/**
 * Represents a single rule.
 */
export interface Condition {
  test: (labels: string[]) => boolean;
  expects: boolean;
  outputOnFailure: string;
}

/**
 * Labels to be added to Pull Requests to indicate attention is needed by a core team member.
 */
export enum Label {
  /**
   * Label automatically added when contributor comment contains `clarification request`
   * This label indicates that the contributor needs input from a core team member regarding their PR.
   * This can be used when needing help on a failing build, clarification of changes requested, etc.
   */
  CLARIFICATION_REQUESTED = 'pr/reviewer-clarification-requested',

  /**
   * Label manually added to stop `pr-linter/exemption-requested` from being re-added to the PR.
   */
  EXEMPTION_DENIED = 'pr-linter/no-exemption',

  /**
   * Label automatically added when contributor comment contains `exemption request`
   * This label indicates that the contributor would like a core team member to assess whether their
   * change qualifies for an exemption to the PR Linter result.
   */
  EXEMPTION_REQUESTED = 'pr-linter/exemption-requested',

  /**
   * Label automatically added when the PR linter comments that the CLI code has changed. It is automatically removed
   * when the `pr-linter/cli-integ-tested` label is added.
   */
  CLI_INTEG_TESTS_NEEDED = 'pr/needs-cli-test-run',

  /**
   * Label manually added by maintainer when the CLI tests have been successfully run through the integ test pipeline.
   */
  CLI_INTEG_TESTED = 'pr-linter/cli-integ-tested',
}

/**
 * Text in PR comments added by contributors that indicate attention is needed by a core team member.
 *
 * The PR Linter provides instructions on adding these phrases.
 */
export enum CommentText {
  /**
   * Text added to comment that indicates that the contributor needs input from a core team member
   * regarding their PR.
   *
   * This can be used when needing help on a failing build, clarification of changes requested, etc.
   */
  CLARIFICATION_REQUESTED = 'clarification request',

  /**
   * Text added to comment that indicates that the contributor would like a core team member
   * to assess whether their change qualifies for an exemption to the PR Linter result.
   */
  EXEMPTION_REQUESTED = 'exemption request',

  /**
   * Text written by the PR linter when CLI integ tests need to be run by a maintainer.
   */
  CLI_INTEG_TESTS_NEEDED = 'CLI code has changed. A maintainer must run the code through the testing pipeline',
}
