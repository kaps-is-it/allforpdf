import { NOTEBOOK_TARGET_OPTIONS, notebookTargetHint } from '../lib/conversions';

interface NotebookTargetPanelProps {
  target: string;
  onTargetChange: (target: string) => void;
}

export function NotebookTargetPanel({ target, onTargetChange }: NotebookTargetPanelProps) {
  return (
    <div className="target-panel">
      <label htmlFor="notebookTargetSelect">Convert notebooks to</label>
      <select id="notebookTargetSelect" value={target} onChange={(event) => onTargetChange(event.target.value)}>
        {NOTEBOOK_TARGET_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <p>{notebookTargetHint(target)}</p>
    </div>
  );
}
