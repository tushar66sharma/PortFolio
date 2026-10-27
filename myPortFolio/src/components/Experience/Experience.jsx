import { experiences } from "../../constants";
import { revLetter } from "../../drawing";
import { SectionHeader } from "../ui/SectionHeader";

// Desktop: REV | DATE | DESCRIPTION. Phones: rev + date share a row, description below.
const ROW = "grid grid-cols-[52px_minmax(0,1fr)] md:grid-cols-[64px_170px_minmax(0,1fr)]";

export const Experience = () => (
  <section id="experience" className="border-t-2 border-line px-5 py-8 sm:px-8 sm:py-10">
    <SectionHeader
      tag="REV. HISTORY"
      title="Experience"
      note="latest revision first"
      intro="A collection of my work experience and the roles I have taken in various organizations"
    />

    <div className="border-[1.5px] border-line">
      <div className={`${ROW} hidden bg-panel text-[10.5px] uppercase tracking-[0.14em] text-muted md:grid`}>
        <span className="px-3 py-2">REV</span>
        <span className="border-l border-line px-3 py-2">DATE</span>
        <span className="border-l border-line px-3 py-2">DESCRIPTION</span>
      </div>

      {experiences.map((exp, i) => {
        const rev = revLetter(i, experiences.length);
        return (
          <article key={exp.id} className={`${ROW} border-t border-line [&:nth-child(2)]:border-t-0 md:[&:nth-child(2)]:border-t`}>
            <span className="px-3 py-3">
              <span className="bp-tri" data-rev={rev}>
                {rev}
              </span>
            </span>
            <span className="border-l border-line px-3 py-3 text-[13px] tabular-nums">{exp.date}</span>

            <div className="col-span-2 border-t border-dashed border-line px-3 py-4 sm:px-4 md:col-span-1 md:border-l md:border-t-0 md:border-solid">
              <div className="flex items-start gap-3">
                <img
                  src={exp.img}
                  alt={exp.company}
                  loading="lazy"
                  decoding="async"
                  className="size-10 shrink-0 rounded-sm border border-line bg-white object-contain p-0.5"
                />
                <div className="min-w-0">
                  <h3 className="text-[15px] font-semibold leading-snug">{exp.role}</h3>
                  <p className="break-words text-sm text-muted">{exp.company}</p>
                </div>
              </div>
              <p className="mt-3 max-w-[75ch] text-muted">{exp.desc}</p>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="bp-label mr-1">SPEC:</span>
                {exp.skills.map((skill, j) => (
                  <span key={`${skill}-${j}`} data-spec className="bp-chip">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  </section>
);
