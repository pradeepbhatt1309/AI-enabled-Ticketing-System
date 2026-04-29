import { CircleDashed, Clock, CheckCircle2 } from "lucide-react";
import type { Ticket } from "@/types";

export function statusIcon(status: Ticket["status"]) {
  switch (status) {
    case "Open":
      return <CircleDashed className="h-3.5 w-3.5 text-blue-500" />;
    case "In Progress":
      return <Clock className="h-3.5 w-3.5 text-amber-500" />;
    case "Closed":
      return <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />;
  }
}

export function statusBadgeClass(status: Ticket["status"]) {
  switch (status) {
    case "Open":
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800";
    case "In Progress":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800";
    case "Closed":
      return "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
  }
}

export function priorityBadgeClass(priority: Ticket["priority"]) {
  switch (priority) {
    case "Low":
      return "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
    case "Medium":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800";
    case "High":
      return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800";
  }
}

export function escalationRiskClass(risk: "Low" | "Medium" | "High") {
  switch (risk) {
    case "Low":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300";
    case "Medium":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300";
    case "High":
      return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300";
  }
}
