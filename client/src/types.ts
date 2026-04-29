export interface ConversationMessage {
  id: string;
  sender: "customer" | "agent";
  content: string;
  timestamp: string;
}

export interface Ticket {
  id: number;
  title: string;
  status: "Open" | "In Progress" | "Closed";
  priority: "Low" | "Medium" | "High";
  customerName: string;
  description: string;
  conversation: ConversationMessage[];
  createdAt: string;
  deletedAt: string | null;
}

export interface Insight {
  ticketId: number;
  summary: string;
  nextSteps: string[];
  knowledgeArticles: string[];
  escalationRisk: "Low" | "Medium" | "High";
}

export interface ConversationSummary {
  summary: string;
  customerIssue: string;
  currentStatus: "unresolved" | "in progress" | "resolved";
  recommendedNextStep: string;
  actionsTaken: string[];
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  summary: string;
}
