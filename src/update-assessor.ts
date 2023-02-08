import {
  Label,
  ActionType,
  UpdateType,
  GitHubComment,
  LabelAssociationFunction,
  NO_ACTIONS,
  LabelAssociation,
  LabelUpdateConditionOptions,
  LabelUpdateConditions,
  LabelUpdateProps,
} from './common-types';
import { ConditionsResult } from './condition-result';
import { GitHubClient } from './github-client';

/**
 * Represents the messages associated with a single label update on the PR.
 */
class LabelUpdate {
  /**
   * The list of messages
   */
  public static readonly messages: string[] = [];

  /**
   * Empties the list of messages for the single label update.
   */
  public static empty() {
    this.messages.length = 0;
  }
}

/**
 * Represents a set of props for assessing label updates on the PR.
 */
interface LabelUpdateAssessorProps {
  /**
   * The labels already present on the PR.
   */
  readonly labels: string[];

  /**
   * The client used for calling the label update APIs.
   */
  readonly client: GitHubClient;

  /**
   * The comment under test for making label updates.
   */
  readonly comment: GitHubComment;

  /**
   * The type of action performed on the comment under test.
   */
  readonly actionType: ActionType;
}

/**
 * Assesses whether or not to make a single label update based off the content of a comment on a PR.
 */
export class LabelUpdateAssessor {
  constructor(private readonly props: LabelUpdateAssessorProps) {}

  /**
   * Tries to perform a label update based off the content of a comment on a PR.
   * @param options The options for determining if a label update should be made.
   */
  public async tryPerformUpdate(options: LabelUpdateConditionOptions): Promise<string[]> {
    LabelUpdate.empty();
    try {
      const updateOptions = this.getLabelUpdateProps(options.getAssociatedLabel);
      const meetsAllConditions = this.assessLabelUpdateConditions(
        updateOptions.label,
        options.labelUpdateConditions,
        updateOptions.updateType
      );
      if (meetsAllConditions) {
        await this.doPerformUpdate(updateOptions);
      }
      return LabelUpdate.messages;
    } catch (error) {
      if ((error as Error).message !== NO_ACTIONS) {
        throw error;
      }
    }
    return LabelUpdate.messages;
  }

  /**
   * Performs the label update.
   * @param props The properties for making the label update.
   */
  private async doPerformUpdate(props: LabelUpdateProps) {
    console.log(await this.props.client.updateLabelOnPullRequest(props));
    LabelUpdate.messages.push(
      `Label '${props.label}' ${this.translateUpdateType(props.updateType)}`
    );
  }

  /**
   * Gets the props for an update to a label.
   * @param getAssociatedLabel The function for getting the label associated with the comment text.
   * @returns The props needed for making an update to a label. Throws error is no update is to be made.
   */
  private getLabelUpdateProps(getAssociatedLabel: LabelAssociationFunction): LabelUpdateProps {
    const potentialUpdateProps: LabelUpdateProps[] = [];
    const updateType: UpdateType =
      this.props.actionType === 'edited' ? 'created' : this.props.actionType;

    this.pushPotentialUpdateProps(
      'deleted',
      potentialUpdateProps,
      getAssociatedLabel,
      this.props.comment.before
    );
    this.pushPotentialUpdateProps(
      updateType,
      potentialUpdateProps,
      getAssociatedLabel,
      this.props.comment.after
    );

    if (potentialUpdateProps.length === 1) {
      return potentialUpdateProps[0];
    } else if (potentialUpdateProps.length > 1) {
      LabelUpdate.messages.pop();
      LabelUpdate.messages.push(
        `No action taken from comment edit for label '${potentialUpdateProps[0].label}'`
      );
    }

    throw Error(NO_ACTIONS);
  }

  /**
   * Pushes potential label update props to a list.
   * @param updateType The type of update to be made to the label.
   * @param potentialUpdateProps The list of potential update props.
   * @param getAssociatedLabel The label to be potentially updated.
   * @param commentBody The body of the comment triggering the potential update to the label.
   */
  private pushPotentialUpdateProps(
    updateType: UpdateType,
    potentialUpdateProps: LabelUpdateProps[],
    getAssociatedLabel: LabelAssociationFunction,
    commentBody?: string
  ): void {
    try {
      const updateSet = this.getLabelUpdateTypeAndCommentText(getAssociatedLabel, commentBody);
      potentialUpdateProps.push({ updateType, label: updateSet.label });
    } catch (error) {
      // Do Nothing.
    }
  }

  /**
   * Gets the pair of `Label` and `CommentText` associated with the comment content.
   * @param getAssociatedLabel The function that tests if there `Label` and `CommentText` associated with the comment content.
   * @param commentBody The body of the comment that triggered this action.
   * @returns a LabelAssociation object. Throws error if one is not found.
   */
  private getLabelUpdateTypeAndCommentText(
    getAssociatedLabel: LabelAssociationFunction,
    commentBody?: string
  ): LabelAssociation {
    const updateSet = getAssociatedLabel(commentBody!, this.props.comment.author);
    if (updateSet) {
      LabelUpdate.messages.push(`Comment ${this.props.actionType} with ${updateSet.commentText}`);
      return updateSet;
    }
    throw new Error(NO_ACTIONS);
  }

  /**
   * Assesses whether the comment matches the conditions for which the label should be updated.
   * @param label The label to potentially be updated.
   * @param conditions The set of conditions under which the label should be updated.
   * @param updateType The type of update to be made to the label.
   * @returns boolean
   */
  private assessLabelUpdateConditions(
    label: Label,
    conditions: LabelUpdateConditions,
    updateType: UpdateType
  ): boolean {
    const result = new ConditionsResult(conditions[updateType], this.props.labels);
    if (result.allConditionsMet) {
      return true;
    }

    LabelUpdate.messages.push(
      `Label '${label}' not ${this.translateUpdateType(
        updateType
      )} because ${result.conditionsNotMet.join(', ')}`
    );

    return false;
  }

  /**
   * Translates the UpdateType into the update type subString used in the response message.
   * @param updateType The type of update being acted on.
   * @returns A subString to use in the response message.
   */
  private translateUpdateType(updateType: UpdateType) {
    return updateType === 'created' ? 'added' : 'removed';
  }
}
