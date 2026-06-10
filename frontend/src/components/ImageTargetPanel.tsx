import { IMAGE_TARGET_OPTIONS, imageTargetHint } from '../lib/conversions';

interface ImageTargetPanelProps {
  target: string;
  onTargetChange: (target: string) => void;
}

export function ImageTargetPanel({ target, onTargetChange }: ImageTargetPanelProps) {
  return (
    <div className="target-panel">
      <label htmlFor="imageTargetSelect">Convert images to</label>
      <select id="imageTargetSelect" value={target} onChange={(event) => onTargetChange(event.target.value)}>
        {IMAGE_TARGET_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <p>{imageTargetHint(target)}</p>
    </div>
  );
}

