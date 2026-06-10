import { PDF_TARGET_OPTIONS, pdfTargetHint } from '../lib/conversions';

interface PdfTargetPanelProps {
  target: string;
  onTargetChange: (target: string) => void;
}

export function PdfTargetPanel({ target, onTargetChange }: PdfTargetPanelProps) {
  return (
    <div className="target-panel">
      <label htmlFor="pdfTargetSelect">PDF action</label>
      <select id="pdfTargetSelect" value={target} onChange={(event) => onTargetChange(event.target.value)}>
        {PDF_TARGET_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <p>{pdfTargetHint(target)}</p>
    </div>
  );
}
