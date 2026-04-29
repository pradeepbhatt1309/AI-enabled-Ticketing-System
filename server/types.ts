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
  createdAt: Date;
  deletedAt: Date | null;
}

export interface Insight {
  ticketId: number;
  summary: string;
  nextSteps: string[];
  knowledgeArticles: string[];
  escalationRisk: "Low" | "Medium" | "High";
}
