import { CircleProperties } from "src/components/storyboards/actions/Circle";
import { ConnectorProperties } from "src/components/storyboards/actions/Connector";
import { DotProperties } from "src/components/storyboards/actions/Dot";
import { TextBox } from "src/components/storyboards/actions/TextBox";
import { PeakProperties } from "src/utils/storyboards/features/Peak";
import { RaiseProperties } from "src/utils/storyboards/features/Raise";
import { SlopeProperties } from "src/utils/storyboards/features/Slope";
import { FallProperties } from "src/utils/storyboards/features/Fall";
import { ActionEnum } from "src/components/storyboards/actions/ActionEnum";
import { NumericalFeatureEnum } from "src/utils/storyboards/features/NumericalFeatureEnum";

export type ActionTableRowType = {
  action: ActionEnum;
  properties: CircleProperties | ConnectorProperties | DotProperties | TextBox;
};

export type FeatureActionTableRowType = {
  feature: NumericalFeatureEnum;
  properties:
    | PeakProperties
    | RaiseProperties
    | SlopeProperties
    | FallProperties;
  rank: number;
  actions: ActionTableRowType[];
  comment?: string;
};
