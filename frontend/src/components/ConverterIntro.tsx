interface ConverterIntroProps {
  title: string;
  description: string;
  modeLabel: string;
  routeLabel?: string;
  outputLabel: string;
  acceptedLabel: string;
}

export function ConverterIntro({ title, description, modeLabel, routeLabel, outputLabel, acceptedLabel }: ConverterIntroProps) {
  return (
    <section className="converter-intro" aria-labelledby="converter-title">
      <div>
        <span className="eyebrow">{modeLabel}</span>
        <h2 id="converter-title">{title}</h2>
        <p>{description}</p>
      </div>
      <div className="conversion-summary" aria-label="Current conversion setup">
        {routeLabel ? <strong>{routeLabel}</strong> : <strong>{outputLabel}</strong>}
        <span>{acceptedLabel}</span>
      </div>
    </section>
  );
}
