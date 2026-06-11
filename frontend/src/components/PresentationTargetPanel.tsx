import { PRESENTATION_TARGET_OPTIONS, presentationTargetHint } from '../lib/conversions';

interface PresentationTargetPanelProps {
  target: string;
  onTargetChange: (target: string) => void;
}

export function PresentationTargetPanel({ target, onTargetChange }: PresentationTargetPanelProps) {
  return (
    <div className="target-panel">
      <label htmlFor="presentationTargetSelect">Convert presentations to</label>
      <select id="presentationTargetSelect" value={target} onChange={(event) => onTargetChange(event.target.value)}>
        {PRESENTATION_TARGET_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <p>{presentationTargetHint(target)}</p>
    </div>
  );
}
