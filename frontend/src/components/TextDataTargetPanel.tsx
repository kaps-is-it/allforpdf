import { TEXT_DATA_TARGET_OPTIONS, textDataTargetHint } from '../lib/conversions';

interface TextDataTargetPanelProps {
  target: string;
  onTargetChange: (target: string) => void;
}

export function TextDataTargetPanel({ target, onTargetChange }: TextDataTargetPanelProps) {
  return (
    <div className="target-panel">
      <label htmlFor="textDataTargetSelect">Convert text, code, or data to</label>
      <select id="textDataTargetSelect" value={target} onChange={(event) => onTargetChange(event.target.value)}>
        {TEXT_DATA_TARGET_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <p>{textDataTargetHint(target)}</p>
    </div>
  );
}
