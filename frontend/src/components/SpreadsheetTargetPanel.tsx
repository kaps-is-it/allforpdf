import { SPREADSHEET_TARGET_OPTIONS, spreadsheetTargetHint } from '../lib/conversions';

interface SpreadsheetTargetPanelProps {
  target: string;
  onTargetChange: (target: string) => void;
}

export function SpreadsheetTargetPanel({ target, onTargetChange }: SpreadsheetTargetPanelProps) {
  return (
    <div className="target-panel">
      <label htmlFor="spreadsheetTargetSelect">Convert spreadsheets to</label>
      <select id="spreadsheetTargetSelect" value={target} onChange={(event) => onTargetChange(event.target.value)}>
        {SPREADSHEET_TARGET_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <p>{spreadsheetTargetHint(target)}</p>
    </div>
  );
}
