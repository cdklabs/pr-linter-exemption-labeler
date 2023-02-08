import { CommentText, Label, LabelAssociation } from './common-types';

/**
 * Tests if the contributor comment contains a request for clarification.
 * @param comment The comment under test
 * @param author The username of the author of the comment under test
 * @returns The associated label and comment text or undefined
 */
export function contributorRequestsClarification(
  commentBody: string,
  author: string
): LabelAssociation | undefined {
  return commentHasText(CommentText.CLARIFICATION_REQUESTED, commentBody) &&
    !commentAuthorIsAutomation(author)
    ? {
        label: Label.CLARIFICATION_REQUESTED,
        commentText: CommentText.CLARIFICATION_REQUESTED,
      }
    : undefined;
}

/**
 * Tests if contributor comment contains a request for exemption from PR linter.
 * @param comment The comment under test
 * @param author The username of the author of the comment under test
 * @returns The associated label and comment text or undefined
 */
export function contributorRequestsExemption(
  commentBody: string,
  author: string
): LabelAssociation | undefined {
  return commentHasText(CommentText.EXEMPTION_REQUESTED, commentBody) &&
    !commentAuthorIsAutomation(author)
    ? {
        label: Label.EXEMPTION_REQUESTED,
        commentText: CommentText.EXEMPTION_REQUESTED,
      }
    : undefined;
}

/**
 * Tests if the PR Linter bot comment contains a request for a CLI integ test run.
 * @param comment The comment under test
 * @param author The username of the author of the comment under test
 * @returns The associated label and comment text or undefined
 */
export function prLinterRequestsCliIntegTestRun(
  commentBody: string,
  author: string
): LabelAssociation | undefined {
  return commentHasText(CommentText.CLI_INTEG_TESTS_NEEDED, commentBody) &&
    commentAuthorIsAutomation(author)
    ? {
        label: Label.CLI_INTEG_TESTS_NEEDED,
        commentText: CommentText.CLI_INTEG_TESTS_NEEDED,
      }
    : undefined;
}

/**
 * Tests if the PR already has a label with a request for clarification.
 * @param labels The labels already present on the PR
 * @returns boolean
 */
export function labelAddedRequestsClarification(labels: string[]): boolean {
  return pullRequestHasLabel(labels, Label.CLARIFICATION_REQUESTED);
}

/**
 * Tests if the PR already has a label with a request for exemption from the PR linter.
 * @param labels The labels already present on the PR
 * @returns boolean
 */
export function labelAddedRequestsExemption(labels: string[]): boolean {
  return pullRequestHasLabel(labels, Label.EXEMPTION_REQUESTED);
}

/**
 * Tests if the PR has a label denying the requested exception.
 * @param labels The labels already present on the PR
 * @returns boolean
 */
export function labelAddedExemptionDenied(labels: string[]): boolean {
  return pullRequestHasLabel(labels, Label.EXEMPTION_DENIED);
}

/**
 * Tests if the PR already has a label with a request for a CLI integ test run.
 * @param labels The labels already present on the PR
 * @returns boolean
 */
export function labelAddedCliIntegTestNeeded(labels: string[]): boolean {
  return pullRequestHasLabel(labels, Label.CLI_INTEG_TESTS_NEEDED);
}

/**
 * Tests if PR has a label indicating that the CLI integ test has been run.
 * @param labels The labels already present on the PR
 * @returns boolean
 */
export function labelAddedCliIntegTestComplete(labels: string[]): boolean {
  return pullRequestHasLabel(labels, Label.CLI_INTEG_TESTED);
}

/**
 * Tests a comment for a text string.
 * @param text The text being searched for
 * @param comment The comment being searched
 * @returns boolean
 */
function commentHasText(text: CommentText, comment: string): boolean {
  return comment.toLowerCase().includes(text.toLowerCase());
}

/**
 * Tests the labels on a pull request
 * @param labels The list of labels already present on the PR
 * @param label The label under test
 * @returns boolean
 */
function pullRequestHasLabel(labels: string[], label: Label): boolean {
  return labels.includes(label);
}

/**
 * Tests whether the comment's author is automation
 * @param author The username of the author of the comment
 * @returns boolean
 */
function commentAuthorIsAutomation(author: string) {
  return author === 'aws-cdk-automation';
}
