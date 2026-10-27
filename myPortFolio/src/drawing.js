// Drawing conventions derived from constants.js (counts, revision and detail letters).
import { SkillsInfo, experiences, projects } from "./constants";

export const getCounts = () => ({
  roles: experiences.length,
  projects: projects.length,
  skills: SkillsInfo.reduce((n, category) => n + category.skills.length, 0),
});

// Oldest entry is revision A, so the first (newest) array item gets the highest letter.
export const revLetter = (index, total) => String.fromCharCode(65 + total - 1 - index);

export const detailLetter = (index) => String.fromCharCode(65 + index);
