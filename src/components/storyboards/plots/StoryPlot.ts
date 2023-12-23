export abstract class StoryPlot {
  constructor() {}
  public abstract coordinates(date: Date): [number, number, number, number];
}
