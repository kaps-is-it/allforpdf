interface HeaderProps {
  title: string;
  subtitle: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header>
      <div className="logo">
        <i className="bx bxs-magic-wand" />
        <span>AllForPDF</span>
      </div>
      <h1>{title}</h1>
      <p className="subtitle">{subtitle}</p>
    </header>
  );
}
