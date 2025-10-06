import { type LucideIcon } from 'lucide-react';

interface EntityStatItemProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  showProgressBar?: boolean;
  progressValue?: number;
  valueClassName?: string;
}

export function EntityStatItem({
  icon: Icon,
  label,
  value,
  showProgressBar = false,
  progressValue,
  valueClassName = 'text-primary',
}: EntityStatItemProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3 w-3" />
        <span>{label}</span>
      </div>
      {showProgressBar && progressValue !== undefined ? (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand rounded-full transition-all"
              style={{ width: `${progressValue}%` }}
            />
          </div>
          <span className={`text-xs font-semibold ${valueClassName}`}>{value}</span>
        </div>
      ) : (
        <div className={`text-sm font-semibold ${valueClassName}`}>{value}</div>
      )}
    </div>
  );
}
