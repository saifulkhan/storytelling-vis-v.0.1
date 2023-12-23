import { FeatureActionDataType } from "src/types/FeatureActionType";

export const featureActionTable1: FeatureActionDataType[] = [
  {
    feature: "PEAK",
    featureParams: {},
    rank: 5,
    action: "CIRCLE",
    actionParams: { SIZE: 10, STROKE_WIDTH: 3, OPACITY: 0.6 },
    text: "",
    comment: "",
  },
  {
    feature: "PEAK",
    featureParams: {},
    rank: 5,
    action: "TEXT_BOX",
    actionParams: { CONNECTOR: "true" },
    text: "On {DATE}, number of cases peaked at {VALUE}",
    comment: "",
  },
  {
    feature: "PEAK",
    featureParams: {},
    rank: 5,
    action: "DOT",
    actionParams: { CONNECTOR: "true" },
    text: "",
    comment: "",
  },
  {
    feature: "SLOPE",
    featureParams: { GT: 100 },
    rank: 7,
    action: "TEXT_BOX",
    actionParams: { CONNECTOR: "true" },
    text: "By {DATE}, the number of cases continued to climb higher in {REGION}.",
    comment: "",
  },
  {
    feature: "SLOPE",
    featureParams: { GT: -1, LT: 1, NE: 0 },
    rank: 7,
    action: "TEXT_BOX",
    actionParams: { CONNECTOR: "true" },
    text: "By {DATE}, the number of cases remained low. We should continue to be vigilant",
    comment: "",
  },
];
