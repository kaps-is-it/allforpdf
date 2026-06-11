import { EBOOK_TARGET_OPTIONS, ebookTargetHint } from '../lib/conversions';

interface EbookTargetPanelProps {
  target: string;
  onTargetChange: (target: string) => void;
}

export function EbookTargetPanel({ target, onTargetChange }: EbookTargetPanelProps) {
  return (
    <div className="target-panel">
      <label htmlFor="ebookTargetSelect">Convert eBooks to</label>
      <select id="ebookTargetSelect" value={target} onChange={(event) => onTargetChange(event.target.value)}>
        {EBOOK_TARGET_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <p>{ebookTargetHint(target)}</p>
    </div>
  );
}
