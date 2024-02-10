import * as d3 from "d3";
import { AbstractAction } from "./AbstractAction";
import { ActionEnum } from "./ActionEnum";

export type TextBoxProperties = {
  id?: string;
  title?: string;
  message?: string;
  backgroundColor?: string;
  width?: number;
};

const RECT_PADDING = 0;

export class TextBox extends AbstractAction {
  protected _properties: TextBoxProperties;
  protected _rectNode: HTMLElement;
  protected _titleNode: HTMLElement;
  protected _messageNode: HTMLElement;
  protected _textNode: HTMLElement;

  constructor() {
    super();
    this._type = ActionEnum.TEXT_BOX;
  }

  public properties(properties: TextBoxProperties = {}) {
    this._properties = {
      id: properties?.id || "TextBox",
      title: properties?.title || "Title ...",
      message: properties?.message || "Message text goes here ...",
      backgroundColor: properties?.backgroundColor || "#E0E0E0",
      width: properties?.width || 250,
    };

    return this;
  }

  protected _draw() {
    this._rectNode = d3
      .create("svg")
      .append("rect")
      .attr("fill", this._properties.backgroundColor)
      .attr("width", this._properties.width + RECT_PADDING)
      .attr("rx", 5)
      .node();
    this._node.appendChild(this._rectNode);

    this._titleNode = d3
      .create("svg")
      .append("text")
      .attr("font-size", "12px")
      .attr("fill", "black")
      .attr("font-weight", "bold")
      .node();

    this._messageNode = d3
      .create("svg")
      .append("text")
      .attr("font-size", "12px")
      .attr("fill", "black")
      .node();

    this._textNode = d3
      .create("svg")
      .append("g")
      .attr("fill", this._properties.background)
      .node();

    this._textNode.append(this._titleNode);
    this._textNode.append(this._messageNode);
    this._node.appendChild(this._textNode);

    this.formatText();

    const { height } = this._textNode.getBoundingClientRect();
    this._rectNode.setAttribute("height", `${height + RECT_PADDING}px`);
  }

  private formatText() {
    const rowHeight = this.wrapText(this._titleNode, this._properties.title);
    this.wrapText(this._messageNode, this._properties.message);

    // Calculate spacing between title and label
    const { height: titleHeight } = this._titleNode.getBoundingClientRect();
    const titleSpacing = titleHeight + rowHeight * 0.2;

    console.log("rowHeight, titleHeight =", rowHeight, titleHeight);

    this._messageNode.setAttribute("y", titleSpacing);
  }

  /*
   * In SVG, text is rendered in a single line. To wrap text, we use individual
   * <tspan> elements for each row.
   */
  private wrapText(element, text: string) {
    const words: string[] = text.split(" ");
    console.log("words =", words);
    // element.innerHTML = "";

    // Draw each word onto svg and save its width before removing
    const wordsWidth: { word: string; width: number }[] = words.map((word) => {
      const wordElem = element.appendChild(
        d3.create("svg").append("tspan").text(word).node(),
      );

      console.log("wordElem =", wordElem);

      const { width: wordWidth } = wordElem.getBoundingClientRect();
      element.removeChild(wordElem);
      return { word: word, width: wordWidth };
    });
    console.log("wordsWidth =", wordsWidth);

    // element.textContent = "";

    // Keep adding words to row until width exceeds span then create new row
    let currentWidth = 0;
    let rowString = [];
    let isLastWord;
    let rowNumber = 0;

    wordsWidth.forEach((word, i) => {
      // Don't factor in the width taken up by spaces atm
      if (currentWidth + word.width < this._properties.width) {
        currentWidth += word.width;
        rowString.push(word.word);
      } else {
        element.appendChild(
          d3
            .create("svg")
            .append("tspan")
            .attr("x", 0)
            .attr("dy", "1.1em")
            .text(rowString.join(" ") + " ")
            .node(),
        );
        currentWidth = word.width;
        rowString = [word.word];
        rowNumber++;
      }

      isLastWord = i == words.length - 1;
      if (isLastWord) {
        element.appendChild(
          d3
            .create("svg")
            .append("tspan")
            .attr("x", 0)
            .attr("dy", "1.1em")
            .text(rowString.join(" ") + " ")
            .node(),
        );
        rowNumber++;
      }
    });

    const rowHeight = element.getBoundingClientRect().height / rowNumber;
    return rowHeight;
  }

  public coordinate(x: number, y: number) {
    this._x = x;
    this._y = y;

    const { width, height } = this._textNode.getBoundingClientRect();
    const rectX = this._x - (width + RECT_PADDING) / 2;
    const textX = this._x - width / 2;

    console.log(width, height, rectX);

    this._rectNode.setAttribute(
      "transform",
      `translate(${rectX},${this._y - (height + RECT_PADDING) / 2})`,
    );

    // translate x,y position to center of anno (rather than top left)
    this._textNode.setAttribute(
      "transform",
      `translate(${textX},${this._y - height / 2})`,
    );

    const correctTextAlignment = (textElem, width, align = undefined) => {
      const alignToX = () => {
        // uses the width and alignment of text to calculate correct x values of
        // tspan elements
        return (width / 2) * (align == "middle" ? 1 : align == "end" ? 2 : 0);
      };

      // aligns tspan elements based on chosen alignment
      Array.from(textElem.children).forEach((tspan: any) =>
        tspan.setAttribute("x", alignToX()),
      );
    };

    // align text correctly
    correctTextAlignment(this._titleNode, width, "middle");
    correctTextAlignment(this._messageNode, width);

    return this;
  }
}
