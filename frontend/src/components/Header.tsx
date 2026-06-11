interface HeaderProps {
  title: string;
  subtitle: string;
  eyebrow?: string;
}

export function Header({ title, subtitle, eyebrow = 'Free online converters' }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="topbar">
        <a className="brand" href="/" aria-label="AllForPDF home">
          <span className="brand-mark">
            <i className="bx bxs-file-pdf" />
          </span>
          <span>AllForPDF</span>
        </a>
        <div className="header-actions" aria-label="Site highlights">
          <span>No signup</span>
          <span>Batch ready</span>
          <span>Free tools</span>
        </div>
      </div>
      <div className="hero-copy">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p className="subtitle">{subtitle}</p>
      </div>
    </header>
  );
}
