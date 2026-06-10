interface HeaderProps {
  subtitle: string;
}

export function Header({ subtitle }: HeaderProps) {
  return (
    <header>
      <div className="logo">
        <i className="bx bxs-magic-wand" />
        <h1>Converti</h1>
      </div>
      <p className="subtitle">{subtitle}</p>
    </header>
  );
}

