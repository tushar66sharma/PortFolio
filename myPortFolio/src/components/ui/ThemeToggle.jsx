import { FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "../../hooks/useTheme";

export const ThemeToggle = () => {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light theme" : "Dark theme"}
      className="js-theme-toggle grid size-10 shrink-0 cursor-pointer place-items-center rounded-full border-[1.5px] border-line text-line transition-colors hover:border-accent hover:text-accent"
    >
      {isDark ? <FiSun aria-hidden="true" className="size-[18px]" /> : <FiMoon aria-hidden="true" className="size-[18px]" />}
    </button>
  );
};
