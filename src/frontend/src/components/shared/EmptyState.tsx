import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  ocid?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  ocid,
}: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
      data-ocid={ocid ?? "empty.empty_state"}
    >
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        {icon ?? <Inbox className="h-8 w-8 text-muted-foreground" />}
      </div>
      <h3 className="font-display font-semibold text-foreground text-lg mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-4">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
