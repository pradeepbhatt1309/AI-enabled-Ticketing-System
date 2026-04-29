import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { RotateCcw, Trash2, ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { getTrash, restoreTicket, permanentlyDeleteTicket, clearTrash } from "@/lib/api";
import { statusBadgeClass, statusIcon } from "@/lib/ticketHelpers";
import { cn } from "@/lib/utils";
import type { Ticket } from "@/types";

export function TrashPage() {
  const queryClient = useQueryClient();
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: trashedTickets, isLoading } = useQuery({
    queryKey: ["trash"],
    queryFn: getTrash,
  });

  const restoreMutation = useMutation({
    mutationFn: (id: number) => restoreTicket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trash"] });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => permanentlyDeleteTicket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trash"] });
      setDeleteId(null);
    },
  });

  const clearMutation = useMutation({
    mutationFn: clearTrash,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trash"] });
      setClearDialogOpen(false);
    },
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/">
              <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to inbox
              </button>
            </Link>
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
            <Trash2 className="h-6 w-6" />
            Trash
            {trashedTickets && trashedTickets.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({trashedTickets.length} item{trashedTickets.length !== 1 ? "s" : ""})
              </span>
            )}
          </h1>
        </div>
        {trashedTickets && trashedTickets.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setClearDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Clear Trash
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg border bg-card animate-pulse" />
          ))}
        </div>
      ) : trashedTickets?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
            <Trash2 className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground">Trash is empty</p>
          <p className="text-sm text-muted-foreground mt-1">Deleted tickets will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {trashedTickets?.map((ticket) => (
            <TrashItem
              key={ticket.id}
              ticket={ticket}
              onRestore={() => restoreMutation.mutate(ticket.id)}
              onDelete={() => setDeleteId(ticket.id)}
              restoring={restoreMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Clear trash confirm */}
      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Clear Trash
            </DialogTitle>
            <DialogDescription>
              This will permanently delete all {trashedTickets?.length} trashed ticket(s). This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearDialogOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => clearMutation.mutate()}
              disabled={clearMutation.isPending}
            >
              {clearMutation.isPending ? "Clearing..." : "Delete All"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Per-ticket delete confirm */}
      <Dialog open={deleteId !== null} onOpenChange={(v) => !v && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Permanently
            </DialogTitle>
            <DialogDescription>
              This ticket will be permanently deleted and cannot be recovered.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteId !== null && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TrashItem({ ticket, onRestore, onDelete, restoring }: {
  ticket: Ticket;
  onRestore: () => void;
  onDelete: () => void;
  restoring: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-lg border bg-card border-slate-200 dark:border-slate-800">
      <span className="font-mono text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5 flex-shrink-0">
        #{ticket.id}
      </span>
      <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium flex-shrink-0", statusBadgeClass(ticket.status))}>
        {statusIcon(ticket.status)}
        {ticket.status}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{ticket.title}</p>
        <p className="text-xs text-muted-foreground">{ticket.customerName}</p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <Button size="sm" variant="outline" onClick={onRestore} disabled={restoring} title="Restore">
          <RotateCcw className="h-3.5 w-3.5" />
          Restore
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950"
          onClick={onDelete}
          title="Delete permanently"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
