import PropTypes from "prop-types";

export const SectionHeader = ({ tag, title, note, intro }) => (
  <header className="mb-6 flex flex-col gap-3">
    <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-2">
      <span className="bp-tag">{tag}</span>
      <h2 className="font-display text-[28px] font-bold uppercase leading-none tracking-[0.03em] text-balance sm:text-[34px]">
        {title}
      </h2>
      {note && <span className="text-xs text-muted">{note}</span>}
    </div>
    {intro && <p className="max-w-[70ch] text-muted">{intro}</p>}
  </header>
);

SectionHeader.propTypes = {
  tag: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  note: PropTypes.string,
  intro: PropTypes.string,
};
