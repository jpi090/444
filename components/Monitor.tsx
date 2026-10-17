import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** On-screen display text in the top corner, e.g. a channel number */
  osd?: string;
  live?: boolean;
  /** Extra overlay inside the glass, such as a lower-third graphic */
  overlay?: ReactNode;
  className?: string;
};

/** A small tube monitor: plastic bezel, curved glass, scanlines. */
export function Monitor({ children, osd, live, overlay, className = "" }: Props) {
  return (
    <div className={`monitor ${className}`}>
      <div className="screen">
        {children}
        {overlay}
        {osd && <span className="screen-osd">{osd}</span>}
        {live && (
          <span className="screen-live">
            <i aria-hidden="true" /> Live
          </span>
        )}
      </div>
      <div className="monitor-chin" aria-hidden="true">
        <span className="monitor-led" />
      </div>
    </div>
  );
}
