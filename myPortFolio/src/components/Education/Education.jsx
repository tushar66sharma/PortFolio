import { education } from "../../constants";
import { SectionHeader } from "../ui/SectionHeader";

// Desktop: NO. | QUALIFICATION | PERIOD | GRADE. Phones: no. + period, qualification, then grade.
const ROW = "grid grid-cols-[52px_minmax(0,1fr)] md:grid-cols-[52px_minmax(0,1fr)_170px_100px]";
const SUB_CELL = "order-3 col-span-2 border-t border-dashed border-line md:order-none md:col-span-1 md:border-l md:border-t-0 md:border-solid";

export const Education = () => (
  <section id="education" className="border-t-2 border-line px-5 py-8 sm:px-8 sm:py-10">
    <SectionHeader
      tag="CERT. RECORD"
      title="Education"
      note="qualifications on file"
      intro="My education has been a journey of learning and development. Here are the details of my academic background"
    />

    <div className="border-[1.5px] border-line">
      <div className={`${ROW} hidden bg-panel text-[10.5px] uppercase tracking-[0.14em] text-muted md:grid`}>
        <span className="px-3 py-2">NO.</span>
        <span className="border-l border-line px-3 py-2">QUALIFICATION</span>
        <span className="border-l border-line px-3 py-2">PERIOD</span>
        <span className="border-l border-line px-3 py-2 text-right">GRADE</span>
      </div>

      {education.map((edu, i) => (
        <article key={edu.id} className={`${ROW} border-t border-line [&:nth-child(2)]:border-t-0 md:[&:nth-child(2)]:border-t`}>
          <span className="order-1 px-3 py-3 tabular-nums text-muted md:order-none">{String(i + 1).padStart(2, "0")}</span>

          <div className={`${SUB_CELL} px-3 py-4 sm:px-4`}>
            <div className="flex items-start gap-3">
              <img
                src={edu.img}
                alt={edu.school}
                loading="lazy"
                decoding="async"
                className="size-10 shrink-0 rounded-sm border border-line bg-white object-contain p-0.5"
              />
              <div className="min-w-0">
                <h3 className="text-[15px] font-semibold leading-snug">{edu.degree}</h3>
                <p className="break-words text-sm text-muted">{edu.school}</p>
              </div>
            </div>
            <p className="mt-3 max-w-[75ch] text-muted">{edu.desc}</p>
          </div>

          <span className="order-2 border-l border-line px-3 py-3 text-[13px] tabular-nums md:order-none">{edu.date}</span>

          <p className="order-4 col-span-2 border-t border-dashed border-line px-3 py-2 md:order-none md:col-span-1 md:border-l md:border-t-0 md:border-solid md:py-3 md:text-right">
            <span className="bp-label mr-2 md:hidden">GRADE</span>
            <strong data-grade={edu.grade} className="font-semibold tabular-nums">
              {edu.grade}
            </strong>
          </p>
        </article>
      ))}
    </div>
  </section>
);
