import { DRAWING_NO, instagram, profiles, sections } from "../../site";

const SocialLink = ({ link }) => {
  const { platform, url, Icon } = link;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={platform}
      className="grid size-10 place-items-center border border-line text-line transition-colors hover:border-accent hover:text-accent"
    >
      <Icon aria-hidden="true" className="size-4" />
    </a>
  );
};

// Two bands: brand + social icons, then section links + drawing note.
export const Footer = () => (
  <footer className="border-t-2 border-line px-4 py-6 sm:px-8">
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-display text-xl font-bold uppercase tracking-[0.06em]">
          {DRAWING_NO} <span aria-hidden="true">⌖</span> Tushar Sharma
        </p>
        <p className="mt-1 text-xs text-muted">© 2026 Tushar Sharma. All rights reserved.</p>
      </div>
      <div className="flex gap-2">
        {[...profiles, instagram].map((link) => (
          <SocialLink key={link.platform} link={link} />
        ))}
      </div>
    </div>

    <div className="mt-5 flex flex-col gap-4 border-t border-dashed border-line pt-4 lg:flex-row lg:items-center lg:justify-between">
      <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
        {sections.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="text-xs uppercase tracking-[0.12em] no-underline hover:text-accent">
            {s.label}
          </a>
        ))}
      </nav>
      <p className="bp-label">DO NOT SCALE DRAWING</p>
    </div>
  </footer>
);
