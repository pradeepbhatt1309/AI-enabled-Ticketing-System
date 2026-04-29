import { randomUUID } from "crypto";
import type { Ticket, Insight, ConversationMessage } from "./types";

class Storage {
  private tickets: Ticket[] = [];
  private insights: Insight[] = [];
  private nextId: number = 1;

  getTickets(): Ticket[] {
    return this.tickets.filter((t) => t.deletedAt === null);
  }

  getDeletedTickets(): Ticket[] {
    return this.tickets.filter((t) => t.deletedAt !== null);
  }

  getTicket(id: number): Ticket | undefined {
    return this.tickets.find((t) => t.id === id);
  }

  getConversation(ticketId: number): ConversationMessage[] {
    const ticket = this.getTicket(ticketId);
    return ticket ? ticket.conversation : [];
  }

  addConversationMessage(
    ticketId: number,
    sender: "customer" | "agent",
    content: string
  ): ConversationMessage | null {
    const ticket = this.getTicket(ticketId);
    if (!ticket) return null;
    const message: ConversationMessage = {
      id: randomUUID(),
      sender,
      content,
      timestamp: new Date().toISOString(),
    };
    ticket.conversation.push(message);
    return message;
  }

  getInsight(ticketId: number): Insight | undefined {
    return this.insights.find((i) => i.ticketId === ticketId);
  }

  createTicket(data: {
    title: string;
    customerName: string;
    priority: "Low" | "Medium" | "High";
    initialMessage: string;
  }): Ticket {
    const ticket: Ticket = {
      id: this.nextId++,
      title: data.title,
      status: "Open",
      priority: data.priority,
      customerName: data.customerName,
      description: data.initialMessage,
      conversation: [
        {
          id: randomUUID(),
          sender: "customer",
          content: data.initialMessage,
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date(),
      deletedAt: null,
    };
    this.tickets.push(ticket);
    return ticket;
  }

  createInsight(data: Insight): Insight {
    const existing = this.insights.findIndex(
      (i) => i.ticketId === data.ticketId
    );
    if (existing >= 0) {
      this.insights[existing] = data;
      return data;
    }
    this.insights.push(data);
    return data;
  }

  updateTicket(
    id: number,
    updates: Partial<Pick<Ticket, "title" | "status" | "priority">>
  ): Ticket | null {
    const ticket = this.getTicket(id);
    if (!ticket) return null;
    Object.assign(ticket, updates);
    return ticket;
  }

  deleteTicket(id: number): boolean {
    const ticket = this.getTicket(id);
    if (!ticket) return false;
    ticket.deletedAt = new Date();
    return true;
  }

  restoreTicket(id: number): boolean {
    const ticket = this.tickets.find((t) => t.id === id);
    if (!ticket) return false;
    ticket.deletedAt = null;
    return true;
  }

  permanentlyDeleteTicket(id: number): boolean {
    const idx = this.tickets.findIndex((t) => t.id === id);
    if (idx < 0) return false;
    this.tickets.splice(idx, 1);
    return true;
  }

  clearTrash(): void {
    this.tickets = this.tickets.filter((t) => t.deletedAt === null);
  }

  seed(): void {
    if (this.tickets.length > 0) return;

    const now = new Date();
    const hourAgo = new Date(now.getTime() - 3600000);
    const dayAgo = new Date(now.getTime() - 86400000);
    const twoDaysAgo = new Date(now.getTime() - 172800000);

    const t1: Ticket = {
      id: this.nextId++,
      title: "Unable to process billing payment",
      status: "Open",
      priority: "High",
      customerName: "Sarah Johnson",
      description:
        "I'm getting an error every time I try to update my payment method. The page just shows a spinner and never loads.",
      conversation: [
        {
          id: randomUUID(),
          sender: "customer",
          content:
            "I'm getting an error every time I try to update my payment method. The page just shows a spinner and never loads.",
          timestamp: twoDaysAgo.toISOString(),
        },
        {
          id: randomUUID(),
          sender: "agent",
          content:
            "Hi Sarah, sorry to hear that. Could you tell me which browser you're using and whether you see any error message in the console?",
          timestamp: new Date(twoDaysAgo.getTime() + 900000).toISOString(),
        },
        {
          id: randomUUID(),
          sender: "customer",
          content:
            "I'm using Chrome. I don't know how to check the console but the spinner just goes on forever. This is really urgent — my subscription is about to expire.",
          timestamp: new Date(twoDaysAgo.getTime() + 1800000).toISOString(),
        },
        {
          id: randomUUID(),
          sender: "agent",
          content:
            "Understood. I've escalated this to our billing team. In the meantime, could you try clearing your cache and using an incognito window?",
          timestamp: new Date(twoDaysAgo.getTime() + 2700000).toISOString(),
        },
      ],
      createdAt: twoDaysAgo,
      deletedAt: null,
    };

    const t2: Ticket = {
      id: this.nextId++,
      title: "Team invite emails not being received",
      status: "In Progress",
      priority: "Medium",
      customerName: "Marcus Lee",
      description:
        "We tried to invite 5 new team members but none of them received the invitation emails. We've checked spam folders.",
      conversation: [
        {
          id: randomUUID(),
          sender: "customer",
          content:
            "We tried to invite 5 new team members but none of them received the invitation emails. We've checked spam folders.",
          timestamp: dayAgo.toISOString(),
        },
        {
          id: randomUUID(),
          sender: "agent",
          content:
            "Thanks for reaching out, Marcus. Can you confirm which email domains the invitees are on? We've had some reports of delays with certain corporate email providers.",
          timestamp: new Date(dayAgo.getTime() + 600000).toISOString(),
        },
        {
          id: randomUUID(),
          sender: "customer",
          content:
            "They are all @acmecorp.com addresses. We desperately need them onboarded by end of week.",
          timestamp: new Date(dayAgo.getTime() + 1200000).toISOString(),
        },
        {
          id: randomUUID(),
          sender: "agent",
          content:
            "I'm looking into this now. It appears acmecorp.com has strict email filtering. I'll send you direct invite links as a workaround while we resolve the email delivery issue.",
          timestamp: new Date(dayAgo.getTime() + 2400000).toISOString(),
        },
        {
          id: randomUUID(),
          sender: "customer",
          content:
            "The direct links worked for 3 of them but 2 still can't get in. Getting a 'invalid token' error.",
          timestamp: new Date(dayAgo.getTime() + 7200000).toISOString(),
        },
      ],
      createdAt: dayAgo,
      deletedAt: null,
    };

    const t3: Ticket = {
      id: this.nextId++,
      title: "API rate limit exceeded unexpectedly",
      status: "Closed",
      priority: "Low",
      customerName: "Priya Patel",
      description:
        "Our integration keeps hitting rate limits even though we are well within the documented limits per our plan.",
      conversation: [
        {
          id: randomUUID(),
          sender: "customer",
          content:
            "Our integration keeps hitting rate limits even though we are well within the documented limits per our plan.",
          timestamp: hourAgo.toISOString(),
        },
        {
          id: randomUUID(),
          sender: "agent",
          content:
            "Hi Priya, can you share your API key (first 8 characters only) and the endpoint you're calling? I'll check the usage logs.",
          timestamp: new Date(hourAgo.getTime() + 300000).toISOString(),
        },
        {
          id: randomUUID(),
          sender: "customer",
          content:
            "The key starts with sk_live_ab12 and we're hitting /api/v2/data/export. We call it about 80 times per hour.",
          timestamp: new Date(hourAgo.getTime() + 600000).toISOString(),
        },
        {
          id: randomUUID(),
          sender: "agent",
          content:
            "Found the issue — the /data/export endpoint has a separate lower rate limit of 60 req/hour not mentioned in the main docs. That's a documentation bug on our end. I've upgraded your account temporarily and will flag this to our docs team.",
          timestamp: new Date(hourAgo.getTime() + 1200000).toISOString(),
        },
        {
          id: randomUUID(),
          sender: "customer",
          content:
            "Perfect, thanks for the quick fix! Looking forward to seeing the docs updated.",
          timestamp: new Date(hourAgo.getTime() + 1800000).toISOString(),
        },
      ],
      createdAt: hourAgo,
      deletedAt: null,
    };

    this.tickets.push(t1, t2, t3);
  }
}

export const storage = new Storage();
storage.seed();
