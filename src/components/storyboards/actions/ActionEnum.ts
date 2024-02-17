export enum ActionEnum {
  DOT = "DOT",
  CIRCLE = "CIRCLE",
  TEXT_BOX = "TEXT_BOX",
  CONNECTOR = "CONNECTOR",
}

export const ActionEnumZOrder: Record<ActionEnum, number> = {
  [ActionEnum.DOT]: 1,
  [ActionEnum.CIRCLE]: 2,
  [ActionEnum.TEXT_BOX]: 3,
  [ActionEnum.CONNECTOR]: 4,
};
