import { AbstractAction } from "src/components/storyboards/actions/AbstractAction";
import { AbstractFeature } from "src/utils/storyboards/feature/AbstractFeature";

export type DateFeatureMap = Map<Date, AbstractFeature[]>;
export type FeatureActionMap = Map<AbstractFeature, AbstractAction[]>;
