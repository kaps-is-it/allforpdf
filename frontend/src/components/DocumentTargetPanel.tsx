import { DOCUMENT_TARGET_OPTIONS, documentTargetHint } from '../lib/conversions';

interface DocumentTargetPanelProps {
  target: string;
  onTargetChange: (target: string) => void;
}

export function DocumentTargetPanel({ target, onTargetChange }: DocumentTargetPanelProps) {
  return (
    <div className="target-panel">
      <label htmlFor="documentTargetSelect">Convert documents to</label>
      <select id="documentTargetSelect" value={target} onChange={(event) => onTargetChange(event.target.value)}>
        {DOCUMENT_TARGET_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <p>{documentTargetHint(target)}</p>
    </div>
  );
}
