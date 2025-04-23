import { cn } from "@/lib/utils";

interface StatusCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    isPositive: boolean;
  };
  subtitle?: string;
  icon: React.ReactNode;
}

export default function StatusCard({
  title,
  value,
  change,
  subtitle,
  icon,
}: StatusCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-neutral-light text-sm font-medium">{title}</h3>
        <div className="rounded-full bg-bg-light p-1">
          {icon}
        </div>
      </div>
      <div className="mt-2">
        <span className="text-2xl font-semibold text-neutral">{value}</span>
        {change && (
          <span
            className={cn(
              "ml-2 text-sm font-medium",
              change.isPositive ? "text-accent" : "text-danger"
            )}
          >
            {change.isPositive ? "▲" : "▼"} {change.value}
          </span>
        )}
      </div>
      {subtitle && <div className="mt-1 text-xs text-neutral-light">{subtitle}</div>}
    </div>
  );
}
