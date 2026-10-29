import { createElement } from "react";
import { renderToString } from "react-dom/server";
import App from "../../src/App.jsx";

export { SkillsInfo, experiences, education, projects } from "../../src/constants.js";
export { getCounts, revLetter, detailLetter } from "../../src/drawing.js";

export function render() {
  return renderToString(createElement(App));
}
