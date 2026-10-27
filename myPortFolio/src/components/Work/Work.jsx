import { useEffect, useRef, useState } from "react";
import { FiX } from "react-icons/fi";
import { projects } from "../../constants";
import { detailLetter } from "../../drawing";
import { SectionHeader } from "../ui/SectionHeader";

// Drive links are demo recordings; anything else is a deployed app.
const isLive = (url) => !url.includes("drive.google.com");

// A last card that would sit alone in its row (2 columns at md, 3 at xl) spans the row instead,
// with the image beside the text.
const cardLayout = (index, total) => {
  if (index !== total - 1) return "flex flex-col";
  const aloneMd = total % 2 === 1;
  const aloneXl = total % 3 === 1;
  return [
    "flex flex-col",
    aloneMd && "md:col-span-2 md:grid md:grid-cols-2 md:items-start md:gap-x-6",
    aloneMd && !aloneXl && "xl:col-span-1 xl:flex",
    aloneXl && "xl:col-span-3 xl:grid xl:grid-cols-2 xl:items-start xl:gap-x-6",
  ]
    .filter(Boolean)
    .join(" ");
};

const stop = (e) => e.stopPropagation();

const ProjectModal = ({ project, letter, onClose }) => {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Keep Tab inside the dialog.
  const trapFocus = (e) => {
    if (e.key !== "Tab") return;
    const items = dialogRef.current.querySelectorAll("button, a[href]");
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm sm:p-6" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        onClick={stop}
        onKeyDown={trapFocus}
        className="js-project-modal flex h-full w-full flex-col bg-paper sm:h-auto sm:max-h-[90vh] sm:max-w-3xl sm:border-2 sm:border-line sm:outline sm:outline-1 sm:outline-offset-4 sm:outline-line"
      >
        <div className="flex items-center justify-between gap-3 border-b-[1.5px] border-line px-4 pb-3 pt-[max(12px,env(safe-area-inset-top))] sm:pt-3">
          <span className="bp-label flex items-center gap-2.5">
            <span className="bp-callout">{letter}</span>
            DETAIL {letter} · SCALE 2 : 1
          </span>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close project details"
            className="grid size-10 cursor-pointer place-items-center border-[1.5px] border-line text-line transition-colors hover:border-accent hover:text-accent"
          >
            <FiX aria-hidden="true" className="size-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-4 pb-[max(24px,env(safe-area-inset-bottom))] pt-4 sm:p-6">
          <img src={project.image} alt={project.title.trim()} className="max-h-[50vh] w-full border border-line bg-panel object-contain" />
          <h3 id="project-modal-title" className="mt-5 font-display text-[28px] font-bold uppercase leading-tight tracking-[0.02em] sm:text-[34px]">
            {project.title.trim()}
          </h3>
          <p className="mt-3 text-muted">{project.description}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.tags.map((tag, i) => (
              <span key={`${tag}-${i}`} className="bp-chip">
                {tag.trim()}
              </span>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <a href={project.github} target="_blank" rel="noopener noreferrer" className="bp-btn bp-btn-ghost">
              View Code
            </a>
            <a href={project.webapp} target="_blank" rel="noopener noreferrer" className="bp-btn">
              View Live
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Work = () => {
  const [selected, setSelected] = useState(null);
  const titleRefs = useRef([]);

  // Lock page scroll while the dialog is open and hand focus back to the card's title on close.
  useEffect(() => {
    if (selected === null) return;
    const opener = titleRefs.current[selected];
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
      opener?.focus();
    };
  }, [selected]);

  const close = useRef(() => setSelected(null)).current;

  return (
    <section id="work" className="border-t-2 border-line px-5 py-8 sm:px-8 sm:py-10">
      <SectionHeader
        tag="DETAIL VIEWS"
        title="Projects"
        note="scale 2 : 1"
        intro="A showcase of the projects I have worked on, highlighting my skills and experience in various technologies"
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project, i) => {
          const letter = detailLetter(i);
          const live = isLive(project.webapp);
          return (
            <article
              key={project.id}
              onClick={() => setSelected(i)}
              className={`group min-w-0 cursor-pointer gap-3 border-[1.5px] border-line bg-panel p-4 transition-colors hover:border-accent ${cardLayout(i, projects.length)}`}
            >
              <div className="flex min-w-0 flex-col gap-3">
                <div className="bp-label flex items-center gap-2.5">
                  <span className="bp-callout">{letter}</span>
                  DETAIL {letter} · {live ? "LIVE" : "DEMO"}
                </div>
                <div className="aspect-video overflow-hidden border border-line bg-paper">
                  <img
                    src={project.image}
                    alt={project.title.trim()}
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <h3>
                  <button
                    ref={(el) => (titleRefs.current[i] = el)}
                    type="button"
                    aria-haspopup="dialog"
                    onClick={(e) => {
                      stop(e);
                      setSelected(i);
                    }}
                    className="js-project-card cursor-pointer text-left font-display text-[22px] font-bold uppercase leading-tight tracking-[0.02em] transition-colors hover:text-accent"
                  >
                    {project.title.trim()}
                  </button>
                </h3>
                <p className="line-clamp-3 text-[13px] text-muted">{project.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag, j) => (
                    <span key={`${tag}-${j}`} className="bp-chip text-[11.5px]">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
                <div className="mt-auto flex gap-5 border-t border-dashed border-line pt-3 text-xs uppercase tracking-[0.1em]">
                  <a href={project.github} target="_blank" rel="noopener noreferrer" onClick={stop} className="no-underline hover:text-accent">
                    Source <span aria-hidden="true">↗</span>
                  </a>
                  <a href={project.webapp} target="_blank" rel="noopener noreferrer" onClick={stop} className="no-underline hover:text-accent">
                    {live ? "Live" : "Demo"} <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {selected !== null && <ProjectModal project={projects[selected]} letter={detailLetter(selected)} onClose={close} />}
    </section>
  );
};
