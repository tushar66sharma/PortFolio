// Site-level content that is not part of constants.js: profile links, nav sections, drawing meta.
import { FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa";
import { SiCodechef, SiCodeforces, SiLeetcode } from "react-icons/si";

export const DRAWING_NO = "TS-066";

export const RESUME_URL = "https://drive.google.com/file/d/1UCyThGN3WtYYY_5FgnzhLwHWx7Pyq8ED/view?usp=drive_link";

export const sections = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "work", label: "Projects" },
  { id: "education", label: "Education" },
  { id: "contact", label: "Contact" },
];

export const profiles = [
  { id: "github", code: "GH", platform: "GitHub", handle: "tushar66sharma", url: "https://github.com/tushar66sharma", Icon: FaGithub },
  { id: "linkedin", code: "IN", platform: "LinkedIn", handle: "tushar-sharma", url: "https://www.linkedin.com/in/tushar-sharma-599992256/", Icon: FaLinkedin },
  { id: "leetcode", code: "LC", platform: "LeetCode", handle: "DynamicCoder_66", url: "https://leetcode.com/u/DynamicCoder_66/", Icon: SiLeetcode },
  { id: "codeforces", code: "CF", platform: "Codeforces", handle: "DynamicCoder_66", url: "https://codeforces.com/profile/DynamicCoder_66", Icon: SiCodeforces },
  { id: "codechef", code: "CC", platform: "CodeChef", handle: "dynamiccoder66", url: "https://www.codechef.com/users/dynamiccoder66", Icon: SiCodechef },
];

export const instagram = {
  platform: "Instagram",
  url: "https://www.instagram.com/i_tushar_66?igsh=MXIxc3J6d3lyN3I4dA==",
  Icon: FaInstagram,
};
