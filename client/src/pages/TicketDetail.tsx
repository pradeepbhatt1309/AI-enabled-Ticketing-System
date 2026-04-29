import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  Sparkles, Edit2, Trash2, Send, Wand2, User, Bot, RotateCcw, X, Check,
} from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { InsightsSheet } from "@/components/InsightsSheet";
import { KnowledgeBase } from "@/components/KnowledgeBase";
import {
  getTicket, getConversation, addMessage, deleteTicket, updateTicket, generateReply,
} from "@/lib/api";
import { statusBadgeClass, statusIcon, priorityBadgeClass } from "@/lib/ticketHelpers";
import { cn } from "@/lib/utils";
import type { ConversationMessage, Ticket } from "@/types";

interface Props {
  id: number;
}

export function TicketDetail({ id }: Props) {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editStatus, setEditStatus] = useState<Ticket["status"]>("Open");
  const [editPriority, setEditPriority] = useState<Ticket["priority"]>("Medium");
  const [replyText, setReplyText] = useState("");
  const [sender, setSender] = useState<"agent" | "customer">("agent");
  const [aiGenerated, setAiGenerated] = useState(false);

  const { data: ticket, isLoading } = useQuery({
    queryKey: ["ticket", id],
    queryFn: () => getTicket(id),
  });

  const { data: messages } = useQuery({
    queryKey: ["conversation", id],
    queryFn: () => getConversation(id),
    enabled: !!ticket,
  });

  const sendMutation = useMutation({
    mutationFn: () => addMessage(id, sender, replyText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversation", id] });
      queryClient.invalidateQueries({ queryKey: ["ticket", id] });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      setReplyText("");
      setAiGenerated(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTicket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      navigate("/");
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => updateTicket(id, { title: editTitle, status: editStatus, priority: editPriority }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket", id] });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      setEditing(false);
    },
  });

  const [aiReplyLoading, setAiReplyLoading] = useState(false);
  const handleGenerateReply = async () => {
    if (!ticket || !messages) return;
    setAiReplyLoading(true);
    try {
      const result = await generateReply(ticket, messages, sender);
      setReplyText(result.reply);
      setAiGenerated(true);
    } catch (e) {
      console.error(e);
    } finally {
      setAiReplyLoading(false);
    }
  };

  const startEdit = () => {
    if (!ticket) return;
    setEditTitle(ticket.title);
    setEditStatus(ticket.status);
    setEditPriority(ticket.priority);
    setEditing(true);
  };

  if (isLoading) return <TicketDetailSkeleton />;
  if (!ticket) return (
    <div className="flex-1 flex items-center justify-center text-muted-foreground">
      Ticket not found.
    </div>
  );

  return (
    <>
      <div className="flex-1 flex gap-0 h-screen overflow-hidden">
        {/* Center column */}
        <div className="flex-1 flex flex-col overflow-y-auto p-6 space-y-4">
          {/* Header card */}
          <div className="rounded-lg border bg-card p-4 border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="font-mono text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5">#{ticket.id}</span>
              <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold", statusBadgeClass(ticket.status))}>
                {statusIcon(ticket.status)}
                {ticket.status}
              </span>
              <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", priorityBadgeClass(ticket.priority))}>
                {ticket.priority}
              </span>
            </div>

            {editing ? (
              <div className="space-y-3">
                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="text-lg font-semibold" />
                <div className="flex gap-2">
                  <Select value={editStatus} onValueChange={(v) => setEditStatus(v as Ticket["status"])}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={editPriority} onValueChange={(v) => setEditPriority(v as Ticket["priority"])}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
                    <Check className="h-3.5 w-3.5" /> Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                    <X className="h-3.5 w-3.5" /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="font-heading text-xl font-bold text-foreground mb-1">{ticket.title}</h2>
                <p className="text-sm text-muted-foreground mb-4">{ticket.customerName}</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => setSheetOpen(true)}
                    className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white border-0"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    AI Tools
                  </Button>
                  <Button size="sm" variant="outline" onClick={startEdit}>
                    <Edit2 className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950"
                    onClick={() => deleteMutation.mutate()}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Description card */}
          {ticket.description && (
            <div className="rounded-lg border bg-card p-4 border-slate-200 dark:border-slate-800">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Description</p>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
            </div>
          )}

          {/* Reply card */}
          <div className="rounded-lg border bg-card p-4 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading text-sm font-semibold text-foreground">Reply</h3>
              <span className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
                sender === "agent"
                  ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
                  : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              )}>
                {sender === "agent" ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}
                As {sender === "agent" ? "Agent" : "Customer"}
              </span>
            </div>
            <div className="relative">
              <Textarea
                value={replyText}
                onChange={(e) => { setReplyText(e.target.value); setAiGenerated(false); }}
                placeholder="Type your reply..."
                className="min-h-[120px] pr-16"
              />
              {aiGenerated && (
                <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 text-xs text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                  <Sparkles className="h-2.5 w-2.5" />
                  AI
                </span>
              )}
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGenerateReply}
                  disabled={aiReplyLoading}
                  className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:border-indigo-800 dark:hover:bg-indigo-950"
                >
                  <Wand2 className="h-3.5 w-3.5" />
                  {aiReplyLoading ? "Generating..." : "Generate with AI"}
                </Button>
                <div className="flex rounded-md border border-border overflow-hidden text-xs">
                  <button
                    onClick={() => setSender("agent")}
                    className={cn("px-2.5 py-1.5 transition-colors", sender === "agent" ? "bg-blue-600 text-white" : "hover:bg-muted text-muted-foreground")}
                  >
                    Agent
                  </button>
                  <button
                    onClick={() => setSender("customer")}
                    className={cn("px-2.5 py-1.5 transition-colors", sender === "customer" ? "bg-slate-600 text-white" : "hover:bg-muted text-muted-foreground")}
                  >
                    Customer
                  </button>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => sendMutation.mutate()}
                disabled={!replyText.trim() || sendMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Send className="h-3.5 w-3.5" />
                {sendMutation.isPending ? "Sending..." : "Send"}
              </Button>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-80 flex-shrink-0 h-screen border-l border-border flex flex-col">
          {/* Thread (75%) */}
          <div className="flex-[3] overflow-hidden flex flex-col border-b border-border">
            <div className="p-3 border-b border-border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Thread</p>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-4">
                {messages?.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
                {!messages?.length && (
                  <p className="text-xs text-muted-foreground py-2 text-center">No messages yet.</p>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Knowledge Base (25%) */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-[200px]">
            <KnowledgeBase ticket={ticket} />
          </div>
        </div>
      </div>

      <InsightsSheet ticket={ticket} open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}

function MessageBubble({ message }: { message: ConversationMessage }) {
  const isAgent = message.sender === "agent";
  const initials = isAgent ? "AG" : message.sender.slice(0, 2).toUpperCase();

  return (
    <div className="flex gap-2.5">
      <Avatar className={cn("h-7 w-7 flex-shrink-0 text-xs", isAgent ? "bg-blue-100 dark:bg-blue-900" : "bg-slate-100 dark:bg-slate-800")}>
        <AvatarFallback className={cn("text-xs", isAgent ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300")}>
          {isAgent ? <Bot className="h-3.5 w-3.5" /> : initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="text-xs font-medium text-foreground capitalize">{message.sender}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
          </span>
        </div>
        <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
      </div>
    </div>
  );
}

function TicketDetailSkeleton() {
  return (
    <div className="flex-1 p-6 space-y-4">
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
      <div className="rounded-lg border bg-card p-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}
