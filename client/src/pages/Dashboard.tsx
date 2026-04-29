import { Inbox } from "lucide-react";

export function Dashboard() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center">
            <Inbox className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
        <h2 className="font-heading text-xl font-semibold text-foreground">Select a ticket</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          Choose a ticket from the sidebar to view its details, conversation thread, and AI-powered insights.
        </p>
      </div>
    </div>
  );
}
