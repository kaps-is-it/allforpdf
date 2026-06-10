interface ProgressBarProps {
  completed: number;
  total: number;
  actionWord: string;
}

export function ProgressBar({ completed, total, actionWord }: ProgressBarProps) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div id="batchProgressContainer">
      <div className="progress-details">
        <span>
          {actionWord} {completed} of {total} files...
        </span>
        <span>{percent}%</span>
      </div>
      <div className="progress-bar-bg">
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

