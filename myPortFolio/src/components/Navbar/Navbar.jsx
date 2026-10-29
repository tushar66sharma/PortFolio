import { useEffect, useRef, useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { DRAWING_NO, sections } from "../../site";
import { ThemeToggle } from "../ui/ThemeToggle";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("about");
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Highlight the section that crosses the middle of the screen.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActiveSection(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && setIsOpen(false);
    const onPointer = (e) => headerRef.current && !headerRef.current.contains(e.target) && setIsOpen(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [isOpen]);

  const linkClass = (id) =>
    `text-xs uppercase tracking-[0.12em] no-underline transition-colors hover:text-accent ${
      activeSection === id ? "text-accent" : ""
    }`;

  return (
    <header
      ref={headerRef}
      className={`fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)] transition-colors duration-300 ${
        isScrolled || isOpen ? "border-b border-line bg-paper/85 backdrop-blur-md" : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-[1160px] pl-[max(16px,env(safe-area-inset-left))] pr-[max(16px,env(safe-area-inset-right))]">
        <nav aria-label="Main" className="flex h-16 items-center justify-between gap-4">
          <a href="#about" className="font-display text-[22px] font-bold uppercase tracking-[0.06em] no-underline">
            {DRAWING_NO} <span aria-hidden="true" className="text-accent">⌖</span>
            <span className="ml-2 hidden font-medium text-muted sm:inline">Tushar Sharma</span>
          </a>

          <ul className="js-desktop-links hidden items-center gap-6 lg:flex">
            {sections.map(({ id, label }) => (
              <li key={id}>
                <a href={`#${id}`} className={linkClass(id)} aria-current={activeSection === id ? "true" : undefined}>
                  {label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setIsOpen((o) => !o)}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              className="js-menu grid size-10 cursor-pointer place-items-center border-[1.5px] border-line text-line lg:hidden"
            >
              {isOpen ? <FiX aria-hidden="true" className="size-5" /> : <FiMenu aria-hidden="true" className="size-5" />}
            </button>
          </div>
        </nav>
      </div>

      {isOpen && (
        <div id="mobile-menu" className="border-t border-line bg-paper lg:hidden">
          <ul className="mx-auto grid max-w-[1160px] grid-cols-2 pl-[max(16px,env(safe-area-inset-left))] pr-[max(16px,env(safe-area-inset-right))] sm:grid-cols-3">
            {sections.map(({ id, label }) => (
              <li key={id} className="border-b border-dashed border-line">
                <a href={`#${id}`} onClick={() => setIsOpen(false)} className={`flex min-h-12 items-center ${linkClass(id)}`}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
};
