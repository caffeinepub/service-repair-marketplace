import { Card, CardContent } from "@/components/ui/card";
import { Clock, DollarSign, MessageSquare, User } from "lucide-react";
import type { BidInfo } from "../../backend";
import {
  formatCurrency,
  formatDate,
  shortenPrincipal,
} from "../../lib/constants";
import StatusBadge from "./StatusBadge";

interface BidCardProps {
  bid: BidInfo;
  actions?: React.ReactNode;
  index?: number;
}

export default function BidCard({ bid, actions, index = 1 }: BidCardProps) {
  return (
    <Card
      className="border border-border rounded-xl"
      data-ocid={`bids.item.${index}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {shortenPrincipal(bid.userId.toString())}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(bid.createdAt)}
              </p>
            </div>
          </div>
          <StatusBadge status={bid.status} type="bid" />
        </div>

        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1 text-sm">
            <DollarSign className="h-4 w-4 text-accent-orange" />
            <span className="font-semibold text-foreground">
              {formatCurrency(bid.bidAmount)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {formatDateTime(bid.createdAt)}
          </div>
        </div>

        {bid.message && (
          <div className="flex gap-2 bg-muted/50 rounded-lg p-3 mb-3">
            <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground/80">{bid.message}</p>
          </div>
        )}

        {actions && <div className="flex gap-2 justify-end">{actions}</div>}
      </CardContent>
    </Card>
  );
}

function formatDateTime(timestamp: bigint): string {
  return new Date(Number(timestamp)).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
