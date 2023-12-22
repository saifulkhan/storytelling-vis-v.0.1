import { NumericalFeatureType } from "./NumericalFeatureType";
import { searchPeaks, searchSlopes } from "./feature-search";

const featureMap: {
  [key in NumericalFeatureType]: Function;
} = {
  [NumericalFeatureType.SLOPE]: searchSlopes,
  [NumericalFeatureType.PEAK]: searchPeaks,
  [NumericalFeatureType.MAX]: undefined,
  [NumericalFeatureType.DEFAULT]: undefined,
  [NumericalFeatureType.CURRENT]: undefined,
  [NumericalFeatureType.LAST]: undefined,
  [NumericalFeatureType.MIN]: undefined,
  [NumericalFeatureType.VALLEY]: undefined,
  [NumericalFeatureType.FALL]: undefined,
  [NumericalFeatureType.RAISE]: undefined,
};

// translate expression function
function featureParams(expression: string): string {
  const [operator, operand] = expression.split(":").map((part) => part.trim());

  switch (operator) {
    case "LE":
      return `<= ${operand}`;
    case "GE":
      return `>= ${operand}`;
    case "LT":
      return `< ${operand}`;
    case "GT":
      return `> ${operand}`;
    default:
      return expression;
  }
}

//
//
//

// Define functions similar to Python counterparts
function functionOne(kwargs: Record<string, any>): void {
  console.log("Function One called with arguments:");
  for (const [key, value] of Object.entries(kwargs)) {
    console.log(`${key}: ${value}`);
  }
}

const feature = "SLOPE";
const inputArguments: Record<string, string> = {
  arg1: "LE:50",
  arg2: "GT:30",
};

const args: Record<string, string> = {};
for (const [key, value] of Object.entries(inputArguments)) {
  args[key] = featureParams(value);
}

if (feature in featureMap) {
  const action = featureMap[feature];
  action(args);
} else {
  console.warn(`${feature} not found in FeatureActionMap.`);
}
