import { renderToString } from "react-dom/server";
import App from "../../src/App.jsx";

export { SkillsInfo, experiences, education, projects } from "../../src/constants.js";

export function render() {
  return renderToString(<App />);
}
