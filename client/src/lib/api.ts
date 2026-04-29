import type { Ticket, ConversationMessage, KnowledgeArticle, Insight, ConversationSummary } from "@/types";

const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? res.statusText);
  }
  return res.json();
}

// Tickets
export const getTickets = () => request<Ticket[]>("/tickets");
export const getTicket = (id: number) => request<Ticket>(`/tickets/${id}`);
export const createTicket = (data: {
  title: string;
  customerName: string;
  priority: string;
  initialMessage: string;
}) => request<Ticket>("/tickets", { method: "POST", body: JSON.stringify(data) });
export const updateTicket = (id: number, data: Partial<Pick<Ticket, "title" | "status" | "priority">>) =>
  request<Ticket>(`/tickets/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteTicket = (id: number) =>
  request<{ ok: boolean }>(`/tickets/${id}`, { method: "DELETE" });

// Trash
export const getTrash = () => request<Ticket[]>("/tickets/trash/list");
export const restoreTicket = (id: number) =>
  request<{ ok: boolean }>(`/tickets/${id}/restore`, { method: "PATCH" });
export const permanentlyDeleteTicket = (id: number) =>
  request<{ ok: boolean }>(`/tickets/${id}/permanent`, { method: "DELETE" });
export const clearTrash = () =>
  request<{ ok: boolean }>("/tickets/trash/clear", { method: "DELETE" });

// Conversation
export const getConversation = (ticketId: number) =>
  request<ConversationMessage[]>(`/tickets/${ticketId}/conversation`);
export const addMessage = (ticketId: number, sender: string, content: string) =>
  request<ConversationMessage>(`/tickets/${ticketId}/conversation`, {
    method: "POST",
    body: JSON.stringify({ sender, content }),
  });

// AI
export const getInsights = (ticket: Ticket, messages: ConversationMessage[]) =>
  request<{ ok: boolean; insights: Insight }>("/insights", {
    method: "POST",
    body: JSON.stringify({ ticket, messages }),
  });

export const summarizeConversation = (ticket: Ticket, messages: ConversationMessage[]) =>
  request<{ ok: boolean; summary: ConversationSummary }>("/summarize-conversation", {
    method: "POST",
    body: JSON.stringify({ ticket, messages }),
  });

export const generateReply = (ticket: Ticket, messages: ConversationMessage[], role: string) =>
  request<{ ok: boolean; reply: string }>("/generate-reply", {
    method: "POST",
    body: JSON.stringify({ ticket, messages, role }),
  });

export const getKnowledgeSuggestions = (query: string, conversation: string) =>
  request<{ suggestions: KnowledgeArticle[] }>(
    `/knowledge-suggestions?query=${encodeURIComponent(query)}&conversation=${encodeURIComponent(conversation)}`
  );
