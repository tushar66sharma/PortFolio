import { SkillsInfo } from "../../constants";
import { SectionHeader } from "../ui/SectionHeader";

// Desktop: ITEM | ASSEMBLY | COMPONENTS | QTY. Phones: item + assembly, then components, then qty.
const ROW = "grid grid-cols-[52px_minmax(0,1fr)] md:grid-cols-[64px_170px_minmax(0,1fr)_60px]";
const SUB_CELL = "col-span-2 border-t border-dashed border-line md:col-span-1 md:border-l md:border-t-0 md:border-solid";

export const Skills = () => (
  <section id="skills" className="border-t-2 border-line px-5 py-8 sm:px-8 sm:py-10">
    <SectionHeader
      tag="SECTION B–B"
      title="Skills"
      note="bill of materials by assembly"
      intro="A collection of my technical skills and expertise honed through various projects and experiences"
    />

    <div className="border-[1.5px] border-line">
      <div className={`${ROW} hidden bg-panel text-[10.5px] uppercase tracking-[0.14em] text-muted md:grid`}>
        <span className="px-3 py-2">ITEM</span>
        <span className="border-l border-line px-3 py-2">ASSEMBLY</span>
        <span className="border-l border-line px-3 py-2">COMPONENTS</span>
        <span className="border-l border-line px-3 py-2 text-right">QTY</span>
      </div>

      {SkillsInfo.map((category, i) => (
        <div key={category.title} className={`${ROW} border-t border-line [&:nth-child(2)]:border-t-0 md:[&:nth-child(2)]:border-t`}>
          <span className="px-3 py-2.5 tabular-nums text-muted">{String(i + 1).padStart(2, "0")}</span>
          <h3 className="border-l border-line px-3 py-2.5 text-sm font-semibold uppercase tracking-[0.06em]">{category.title}</h3>
          <ul className={`${SUB_CELL} flex flex-wrap gap-2 px-3 py-3`}>
            {category.skills.map((skill, j) => (
              <li key={`${skill.name}-${j}`} className="bp-chip bg-paper">
                <img
                  src={skill.logo}
                  alt={`${skill.name} logo`}
                  loading="lazy"
                  decoding="async"
                  className="size-5 shrink-0 rounded-sm bg-white object-contain p-0.5"
                />
                {skill.name}
              </li>
            ))}
          </ul>
          <p className={`${SUB_CELL} px-3 py-2 tabular-nums md:text-right`}>
            <span className="bp-label mr-2 md:hidden">QTY</span>
            <span data-qty={category.skills.length}>{category.skills.length}</span>
          </p>
        </div>
      ))}
    </div>
  </section>
);
