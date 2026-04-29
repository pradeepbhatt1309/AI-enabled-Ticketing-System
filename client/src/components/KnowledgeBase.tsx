import { useQuery } from "@tanstack/react-query";
import { BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getKnowledgeSuggestions } from "@/lib/api";
import type { Ticket } from "@/types";

interface Props {
  ticket: Ticket;
}

export function KnowledgeBase({ ticket }: Props) {
  const conversationText = ticket.conversation
    .map((m) => `${m.sender}: ${m.content}`)
    .join("\n");

  const { data, isLoading } = useQuery({
    queryKey: ["knowledge", ticket.id],
    queryFn: () => getKnowledgeSuggestions(ticket.title, conversationText),
    staleTime: 300000,
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-3 border-b border-border">
        <BookOpen className="h-4 w-4 text-indigo-600" />
        <span className="text-sm font-medium text-foreground">Knowledge Base</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3.5 w-5/6" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))
          : data?.suggestions.map((article) => (
              <div
                key={article.id}
                className="p-2.5 rounded-md border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-xs font-medium text-foreground leading-snug">{article.title}</p>
                  <span className="flex-shrink-0 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-xs text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    AI
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{article.summary}</p>
              </div>
            ))}
        {!isLoading && !data?.suggestions.length && (
          <p className="text-xs text-muted-foreground py-2">No suggestions available.</p>
        )}
      </div>
    </div>
  );
}
