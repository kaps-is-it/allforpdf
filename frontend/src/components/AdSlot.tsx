interface AdSlotProps {
  label?: string;
  variant?: 'banner' | 'rail' | 'inline' | 'compact';
}

export function AdSlot({ label = 'Advertisement', variant = 'inline' }: AdSlotProps) {
  return (
    <div className={`ad-slot ad-slot-${variant}`} aria-label={`${label} space`}>
      <span>{label}</span>
    </div>
  );
}
