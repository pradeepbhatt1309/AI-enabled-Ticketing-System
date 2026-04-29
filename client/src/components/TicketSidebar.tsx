import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Trash2, Inbox } from "lucide-react";
import { getTickets } from "@/lib/api";
import { ThemeToggle } from "./ThemeToggle";
import { NewTicketDialog } from "./NewTicketDialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { statusIcon, statusBadgeClass, priorityBadgeClass } from "@/lib/ticketHelpers";
import type { Ticket } from "@/types";

interface Props {
  selectedId?: number;
}

export function TicketSidebar({ selectedId }: Props) {
  const [, navigate] = useLocation();
  const { data: tickets, isLoading } = useQuery({
    queryKey: ["tickets"],
    queryFn: getTickets,
    refetchInterval: 10000,
  });

  return (
    <aside className="w-80 flex-shrink-0 h-screen flex flex-col border-r border-border bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
              <Inbox className="h-5 w-5 text-indigo-600" />
              Inbox
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Manage support requests</p>
          </div>
          <ThemeToggle />
        </div>
        <NewTicketDialog />
      </div>

      {/* Ticket list */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-3 rounded-lg space-y-2">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))
            : tickets?.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  selected={ticket.id === selectedId}
                  onClick={() => navigate(`/ticket/${ticket.id}`)}
                />
              ))}
          {!isLoading && tickets?.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No tickets yet. Create your first one!
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <Link href="/trash">
          <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
            <Trash2 className="h-4 w-4" />
            Trash
          </button>
        </Link>
      </div>
    </aside>
  );
}

function TicketCard({ ticket, selected, onClick }: { ticket: Ticket; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-3 rounded-lg border transition-all",
        selected
          ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-950 dark:border-indigo-800"
          : "bg-background border-transparent hover:bg-muted hover:border-border"
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground font-mono">#{ticket.id}</span>
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
        </span>
      </div>
      <p className="text-sm font-medium text-foreground truncate mb-1.5">{ticket.title}</p>
      <p className="text-xs text-muted-foreground mb-2">{ticket.customerName}</p>
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium", statusBadgeClass(ticket.status))}>
          {statusIcon(ticket.status)}
          {ticket.status}
        </span>
        <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", priorityBadgeClass(ticket.priority))}>
          {ticket.priority}
        </span>
      </div>
    </button>
  );
}
