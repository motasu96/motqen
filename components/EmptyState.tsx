import { ComponentType, ReactNode } from "react";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card-lg border border-dashed border-line bg-card/60 px-6 py-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-light">
        <Icon className="h-7 w-7 text-gold-dark" />
      </span>
      <h3 className="text-base font-extrabold text-ink">{title}</h3>
      {description && <p className="max-w-sm text-sm text-ink-soft">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
