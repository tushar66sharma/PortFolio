import { useEffect, useState } from "react";
import profileImage from "../../assets/profile5.png";
import { education, experiences } from "../../constants";
import { getCounts, revLetter } from "../../drawing";
import { DRAWING_NO, RESUME_URL } from "../../site";

const ROLE_WORDS = [
  "Full-Stack Developer",
  "App Developer",
  "Competitive Programmer",
  "Open-Source Contributor",
];

// Starts fully typed so the first paint (and reduced-motion visitors) see a role straight away.
const useTypewriter = (words) => {
  const [text, setText] = useState(words[0]);
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const current = words[wordIndex % words.length];
    const holding = !isDeleting && text === current;
    const timeout = setTimeout(
      () => {
        if (holding) setIsDeleting(true);
        else if (isDeleting && text === "") {
          setIsDeleting(false);
          setWordIndex((i) => i + 1);
        } else setText(current.substring(0, text.length + (isDeleting ? -1 : 1)));
      },
      holding ? 1000 : isDeleting ? 50 : 150
    );
    return () => clearTimeout(timeout);
  }, [words, text, isDeleting, wordIndex]);

  return text;
};

const TitleBlock = () => {
  const cells = [
    { label: "TITLE", value: "SOFTWARE ENGINEER", wide: true, big: true },
    { label: "CURRENT ASSIGNMENT", value: experiences[0].company, wide: true },
    { label: "DRAWN BY", value: "T. SHARMA" },
    { label: "DWG NO.", value: DRAWING_NO },
    { label: "CERT.", value: `B.Tech CSE · ${education[0].grade}` },
    { label: "SCALE", value: "1 : 1" },
    { label: "REV / SHEET", value: `${revLetter(0, experiences.length)} · 1 OF 1`, wide: true },
  ];

  return (
    <aside aria-label="Title block" className="grid grid-cols-2 border-2 border-line bg-panel">
      {cells.map(({ label, value, wide, big }) => (
        <div key={label} className={`min-w-0 border-[0.5px] border-line px-2.5 py-1.5 ${wide ? "col-span-2" : ""}`}>
          <span className="block text-[9.5px] uppercase tracking-[0.14em] text-muted">{label}</span>
          <strong
            className={`block break-words font-medium ${big ? "font-display text-[26px] font-bold leading-tight tracking-[0.04em]" : "text-[13px]"}`}
          >
            {value}
          </strong>
        </div>
      ))}
    </aside>
  );
};

// Photo framed like an elevation view: corner brackets and centre-line ticks.
const Elevation = () => (
  <figure className="mx-auto w-full max-w-[300px]">
    <div className="relative aspect-square border-[1.5px] border-line bg-panel p-2.5">
      <span aria-hidden="true" className="absolute -left-1 -top-1 size-4 border-l-2 border-t-2 border-accent" />
      <span aria-hidden="true" className="absolute -right-1 -top-1 size-4 border-r-2 border-t-2 border-accent" />
      <span aria-hidden="true" className="absolute -bottom-1 -left-1 size-4 border-b-2 border-l-2 border-accent" />
      <span aria-hidden="true" className="absolute -bottom-1 -right-1 size-4 border-b-2 border-r-2 border-accent" />
      <span aria-hidden="true" className="absolute -top-3 left-1/2 h-5 w-px bg-line" />
      <span aria-hidden="true" className="absolute -bottom-3 left-1/2 h-5 w-px bg-line" />
      <span aria-hidden="true" className="absolute -left-3 top-1/2 h-px w-5 bg-line" />
      <span aria-hidden="true" className="absolute -right-3 top-1/2 h-px w-5 bg-line" />
      <img src={profileImage} alt="Tushar Sharma" fetchPriority="high" className="size-full object-cover" />
    </div>
    <figcaption className="bp-label mt-3 flex justify-between gap-2">
      <span>FRONT ELEVATION</span>
      <span>SCALE 1:1</span>
    </figcaption>
  </figure>
);

export const About = () => {
  const role = useTypewriter(ROLE_WORDS);
  const counts = getCounts();

  return (
    <section
      id="about"
      className="grid gap-10 px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-12"
    >
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.16em] text-muted">
          GENERAL ARRANGEMENT · <span className="font-medium text-accent">{role}</span>
          <span aria-hidden="true" className="animate-pulse text-accent">
            |
          </span>
        </p>

        <div className="bp-dim mt-5 max-w-[520px]" aria-hidden="true">
          <span>◂</span>
          <i />
          <b className="min-w-0 text-center font-medium">{`${counts.roles} ROLES · ${counts.projects} PROJECTS · ${counts.skills} SKILLS`}</b>
          <i />
          <span>▸</span>
        </div>

        <h1 className="mb-6 mt-3 font-display text-[clamp(56px,10vw,124px)] font-bold uppercase leading-[0.88] tracking-[0.005em]">
          <span className="block">Tushar</span> <span className="block">Sharma</span>
        </h1>

        <p className="mb-7 max-w-[60ch] text-[15px] leading-relaxed text-muted">
          I’m Tushar Sharma, a Software Engineer with experience building production-ready backend systems, full-stack web applications, and AI-powered solutions. I specialize in Python, FastAPI, TypeScript, React, PostgreSQL, and Google Cloud, with hands-on experience in designing scalable APIs, cloud infrastructure, CI/CD pipelines, and automation workflows. I enjoy solving complex engineering problems and building reliable, high-performance software that delivers real-world impact.
        </p>

        <div className="flex flex-wrap gap-3">
          <a href={RESUME_URL} target="_blank" rel="noopener noreferrer" className="bp-btn">
            Download CV <span aria-hidden="true">↗</span>
          </a>
          <a href="#contact" className="bp-btn bp-btn-ghost">
            Contact
          </a>
        </div>
      </div>

      <div className="flex min-w-0 flex-col justify-end gap-8">
        <Elevation />
        <TitleBlock />
      </div>
    </section>
  );
};
