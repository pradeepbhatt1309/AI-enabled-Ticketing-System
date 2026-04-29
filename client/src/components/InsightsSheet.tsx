import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { Sparkles, AlertTriangle } from "lucide-react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getInsights, summarizeConversation, getConversation } from "@/lib/api";
import { escalationRiskClass } from "@/lib/ticketHelpers";
import type { Ticket, Insight, ConversationSummary } from "@/types";

interface Props {
  ticket: Ticket;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function InsightsSheet({ ticket, open, onOpenChange }: Props) {
  const [summaryData, setSummaryData] = useState<ConversationSummary | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [generatedAt] = useState(new Date());

  const {
    data: insightsData,
    isLoading: insightsLoading,
    error: insightsError,
  } = useQuery({
    queryKey: ["insights", ticket.id],
    queryFn: async () => {
      const conv = await getConversation(ticket.id);
      const result = await getInsights(ticket, conv);
      return result.insights;
    },
    enabled: open,
    staleTime: 300000,
  });

  const handleGenerateSummary = async () => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const conv = await getConversation(ticket.id);
      const result = await summarizeConversation(ticket, conv);
      setSummaryData(result.summary);
    } catch (e) {
      setSummaryError(String(e));
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            AI Tools
          </SheetTitle>
        </SheetHeader>
        <Tabs defaultValue="insights" className="flex-1 flex flex-col overflow-hidden px-6 pb-6 pt-4">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="insights" className="flex-1">Insights</TabsTrigger>
            <TabsTrigger value="summary" className="flex-1">Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <InsightsTab
                data={insightsData ?? null}
                loading={insightsLoading}
                error={insightsError ? String(insightsError) : null}
                generatedAt={generatedAt}
              />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="summary" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <SummaryTab
                data={summaryData}
                loading={summaryLoading}
                error={summaryError}
                onGenerate={handleGenerateSummary}
              />
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function InsightsTab({ data, loading, error, generatedAt }: {
  data: Insight | null;
  loading: boolean;
  error: string | null;
  generatedAt: Date;
}) {
  if (loading) return <InsightsSkeleton />;
  if (error) return (
    <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
      Failed to generate insights. {error}
    </div>
  );
  if (!data) return null;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Escalation Risk</span>
        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${escalationRiskClass(data.escalationRisk)}`}>
          {data.escalationRisk === "High" && <AlertTriangle className="h-3 w-3" />}
          {data.escalationRisk}
        </span>
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Executive Summary</p>
        <p className="text-sm text-foreground leading-relaxed">{data.summary}</p>
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Suggested Next Steps</p>
        <ol className="space-y-2">
          {data.nextSteps.map((step, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="flex-shrink-0 h-5 w-5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 flex items-center justify-center text-xs font-medium">
                {i + 1}
              </span>
              <span className="text-foreground leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Knowledge Articles</p>
        <ul className="space-y-1">
          {data.knowledgeArticles.map((article, i) => (
            <li key={i} className="text-sm text-indigo-600 dark:text-indigo-400 flex items-start gap-1.5">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
              {article}
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-2 border-t border-border">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3" />
          AI Generated · {format(generatedAt, "MMM d, h:mm a")}
        </span>
      </div>
    </div>
  );
}

function SummaryTab({ data, loading, error, onGenerate }: {
  data: ConversationSummary | null;
  loading: boolean;
  error: string | null;
  onGenerate: () => void;
}) {
  if (!data && !loading) return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <p className="text-sm text-muted-foreground">Generate an AI-powered summary of this conversation.</p>
      <Button onClick={onGenerate} className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-0">
        <Sparkles className="h-4 w-4" />
        Generate Summary
      </Button>
    </div>
  );
  if (loading) return <InsightsSkeleton />;
  if (error) return (
    <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
      {error}
    </div>
  );
  if (!data) return null;

  const statusColors: Record<string, string> = {
    unresolved: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300",
    "in progress": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300",
    resolved: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300",
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="border-l-4 border-blue-400 pl-3 py-1">
        <p className="text-sm italic text-foreground leading-relaxed">{data.summary}</p>
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Customer Issue</p>
        <p className="text-sm text-foreground">{data.customerIssue}</p>
      </div>

      <div className="flex items-center gap-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</p>
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColors[data.currentStatus] ?? ""}`}>
          {data.currentStatus}
        </span>
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Recommended Next Step</p>
        <p className="text-sm text-foreground">{data.recommendedNextStep}</p>
      </div>

      {data.actionsTaken.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Actions Taken</p>
          <ul className="space-y-1">
            {data.actionsTaken.map((action, i) => (
              <li key={i} className="flex items-start gap-1.5 text-sm text-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                {action}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button variant="outline" size="sm" onClick={onGenerate} className="w-full">
        Regenerate
      </Button>
    </div>
  );
}

function InsightsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}
