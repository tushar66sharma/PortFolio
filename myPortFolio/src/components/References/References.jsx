import { profiles } from "../../site";

// Profile links, laid out like the reference-documents row of a drawing.
// Phone/tablet: label on its own row, links in 2 columns (5th spans both). Desktop: one row.
const cellBorders = (i) =>
  [
    i >= 2 && "border-t lg:border-t-0",
    i % 2 === 1 && "border-l",
    i > 0 && i % 2 === 0 && "lg:border-l",
    i === profiles.length - 1 && i % 2 === 0 && "col-span-2 lg:col-span-1",
  ]
    .filter(Boolean)
    .join(" ");

const ReferenceLink = ({ profile, index }) => {
  const { code, platform, handle, url, Icon } = profile;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full min-w-0 items-center gap-3 px-3 py-2.5 no-underline transition-colors hover:bg-paper"
    >
      <Icon aria-hidden="true" className="size-4 shrink-0 text-line transition-colors group-hover:text-accent" />
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-[9.5px] uppercase tracking-[0.14em] text-muted">
          <b className="mr-1.5 border border-accent px-1 font-medium text-accent">{code}</b>
          REF-0{index + 1} · {platform}
        </span>
        <span className="truncate text-[12.5px] font-medium transition-colors group-hover:text-accent">
          {handle} <span aria-hidden="true">↗</span>
        </span>
      </span>
    </a>
  );
};

export const References = () => (
  <nav aria-label="Profiles" className="grid border-b-[1.5px] border-line bg-panel lg:grid-cols-[auto_minmax(0,1fr)]">
    <span className="bp-label flex items-center border-b border-line px-3.5 py-2 lg:border-b-0 lg:border-r-[1.5px]">
      REFERENCES
    </span>
    <ul className="grid grid-cols-2 lg:grid-cols-5">
      {profiles.map((profile, i) => (
        <li key={profile.id} className={`min-w-0 border-line ${cellBorders(i)}`}>
          <ReferenceLink profile={profile} index={i} />
        </li>
      ))}
    </ul>
  </nav>
);
