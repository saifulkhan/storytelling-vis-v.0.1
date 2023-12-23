import { ActionType } from "./ActionType";
import { NumericalFeatureParamType } from "./NumericalFeatureParamType";
import { NumericalFeatureType } from "./NumericalFeatureType";

export type FeatureActionDataType = {
  feature: NumericalFeatureType | string;
  featureParams: Record<NumericalFeatureParamType, string | number>;
  rank: number;
  action: ActionType | string;
  actionParams: Record<string, string | number>;
  text: string;
  comment: string;
};
