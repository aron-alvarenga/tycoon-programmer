import type { ReactNode } from 'react';

interface PanelProps {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
}

export const Panel = ({ id, title, children, className }: PanelProps) => (
  <section className={className ? `panel ${className}` : 'panel'} aria-labelledby={id}>
    <header className="panel-head">
      <span className="window-dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <h2 id={id}>{title}</h2>
    </header>
    <div className="panel-body">{children}</div>
  </section>
);
