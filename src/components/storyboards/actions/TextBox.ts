import * as d3 from "d3";
import { Action } from "./Action";

const RECT_PADDING = 0;

export class TextBox extends Action {
  protected rectNode: HTMLElement;
  protected titleNode: HTMLElement;
  protected messageNode: HTMLElement;
  protected textNode: HTMLElement;

  protected props;

  constructor(props: any = {}, id = "TextBox") {
    super(id);

    this.props = {
      title: props?.title || "Title ...",
      message: props?.message || "Message text goes here ...",
      background: props?.background || "#E0E0E0",
      width: props?.width || 250,
    };
  }

  protected draw() {
    this.rectNode = d3
      .create("svg")
      .append("rect")
      .attr("fill", this.props.background)
      .attr("width", this.props.width + RECT_PADDING)
      .attr("rx", 5)
      .node();
    this.node.appendChild(this.rectNode);

    this.titleNode = d3
      .create("svg")
      .append("text")
      .attr("font-size", "12px")
      .attr("fill", "black")
      .attr("font-weight", "bold")
      .node();

    this.messageNode = d3
      .create("svg")
      .append("text")
      .attr("font-size", "12px")
      .attr("fill", "black")
      .node();

    this.textNode = d3
      .create("svg")
      .append("g")
      .attr("fill", this.props.background)
      .node();

    this.textNode.append(this.titleNode);
    this.textNode.append(this.messageNode);
    this.node.appendChild(this.textNode);

    this.formatText();

    const { height } = this.textNode.getBoundingClientRect();
    this.rectNode.setAttribute("height", `${height + RECT_PADDING}px`);
  }

  private formatText() {
    const rowHeight = this.wrapText(this.titleNode, this.props.title);
    this.wrapText(this.messageNode, this.props.message);

    // Calculate spacing between title and label
    const { height: titleHeight } = this.titleNode.getBoundingClientRect();
    const titleSpacing = titleHeight + rowHeight * 0.2;

    console.log("rowHeight, titleHeight =", rowHeight, titleHeight);

    this.messageNode.setAttribute("y", titleSpacing);
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
      if (currentWidth + word.width < this.props.width) {
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
    this.x = x;
    this.y = y;

    const { width, height } = this.textNode.getBoundingClientRect();
    const rectX = this.x - (width + RECT_PADDING) / 2;
    const textX = this.x - width / 2;

    console.log(width, height, rectX);

    this.rectNode.setAttribute(
      "transform",
      `translate(${rectX},${this.y - (height + RECT_PADDING) / 2})`,
    );

    // translate x,y position to center of anno (rather than top left)
    this.textNode.setAttribute(
      "transform",
      `translate(${textX},${this.y - height / 2})`,
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
    correctTextAlignment(this.titleNode, width, "middle");
    correctTextAlignment(this.messageNode, width);
  }
}
