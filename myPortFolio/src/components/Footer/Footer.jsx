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

export const Footer = () => (
  <footer className="border-t-2 border-line px-4 py-6 sm:px-8">
    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="font-display text-xl font-bold uppercase tracking-[0.06em]">
          {DRAWING_NO} <span aria-hidden="true">⌖</span> Tushar Sharma
        </p>
        <p className="mt-1 text-xs text-muted">© 2026 Tushar Sharma. All rights reserved.</p>
      </div>

      <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
        {sections.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="text-xs uppercase tracking-[0.12em] no-underline hover:text-accent">
            {s.label}
          </a>
        ))}
      </nav>

      <div className="flex flex-wrap items-center gap-4">
        {[...profiles, instagram].map((link) => (
          <SocialLink key={link.platform} link={link} />
        ))}
      </div>
    </div>
    <p className="bp-label mt-5 border-t border-dashed border-line pt-3 text-center lg:text-right">DO NOT SCALE DRAWING</p>
  </footer>
);
