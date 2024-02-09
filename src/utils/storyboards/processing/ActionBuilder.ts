import { FeatureActionDataType } from "src/types/FeatureActionType";
import { ActionType } from "src/types/ActionType";
import { AbstractAction } from "src/components/storyboards/actions/Action";
import { Circle } from "src/components/storyboards/actions/Circle";
import { Dot } from "src/components/storyboards/actions/Dot";
import { TextBox } from "src/components/storyboards/actions/TextBox";

export class ActionBuilder {
  static table: FeatureActionDataType[];

  constructor(table: FeatureActionDataType[]) {
    ActionBuilder.table = table;
  }

  public build(): AbstractAction[] {
    const actions: AbstractAction[] = [];
    ActionBuilder.table.forEach((d: FeatureActionDataType, _) => {
      const action = ActionBuilder.createAction(d.action as ActionType);
      console.log("FeatureSearch:execute: action = ", d.action);
      console.log("FeatureSearch:execute: actionParams = ", d.actionParams);
      // prettier-ignore
      console.log("FeatureSearch:execute: feature = ", action);
      actions.push(action);
    });

    return actions;
  }

  private static createAction(key: ActionType) {
    switch (key) {
      case ActionType.DOT:
        return new Dot();
      case ActionType.TEXT_BOX:
        return new TextBox();
      case ActionType.CIRCLE:
        return new Circle();
    }
  }
}
