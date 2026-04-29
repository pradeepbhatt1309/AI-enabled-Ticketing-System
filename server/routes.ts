import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { storage } from "./storage";

const router = Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Trash routes (MUST be before /:id) ────────────────────────────────────────

router.get("/tickets/trash/list", (_req, res) => {
  res.json(storage.getDeletedTickets());
});

router.delete("/tickets/trash/clear", (_req, res) => {
  storage.clearTrash();
  res.json({ ok: true });
});

// ── Ticket CRUD ───────────────────────────────────────────────────────────────

router.get("/tickets", (_req, res) => {
  res.json(storage.getTickets());
});

router.get("/tickets/:id", (req, res) => {
  const ticket = storage.getTicket(Number(req.params.id));
  if (!ticket) return res.status(404).json({ error: "Not found" });
  res.json(ticket);
});

router.post("/tickets", (req, res) => {
  const { title, customerName, priority, initialMessage } = req.body;
  if (!title || !customerName || !priority || !initialMessage) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const ticket = storage.createTicket({ title, customerName, priority, initialMessage });
  res.status(201).json(ticket);
});

router.patch("/tickets/:id", (req, res) => {
  const { title, status, priority } = req.body;
  const ticket = storage.updateTicket(Number(req.params.id), { title, status, priority });
  if (!ticket) return res.status(404).json({ error: "Not found" });
  res.json(ticket);
});

router.delete("/tickets/:id", (req, res) => {
  const ok = storage.deleteTicket(Number(req.params.id));
  if (!ok) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

// ── Restore / Permanent delete ────────────────────────────────────────────────

router.patch("/tickets/:id/restore", (req, res) => {
  const ok = storage.restoreTicket(Number(req.params.id));
  if (!ok) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

router.delete("/tickets/:id/permanent", (req, res) => {
  const ok = storage.permanentlyDeleteTicket(Number(req.params.id));
  if (!ok) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

// ── Conversation ──────────────────────────────────────────────────────────────

router.get("/tickets/:id/conversation", (req, res) => {
  const conv = storage.getConversation(Number(req.params.id));
  res.json(conv);
});

router.post("/tickets/:id/conversation", (req, res) => {
  const { sender, content } = req.body;
  const msg = storage.addConversationMessage(Number(req.params.id), sender, content);
  if (!msg) return res.status(404).json({ error: "Not found" });
  res.status(201).json(msg);
});

// ── AI: Insights ──────────────────────────────────────────────────────────────

router.post("/insights", async (req, res) => {
  try {
    const { ticket, messages } = req.body;
    const response = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      system:
        'You are a senior support analyst. Analyze this ticket and conversation. Respond with valid JSON only: { "summary": "...", "nextSteps": ["..."], "knowledgeArticles": ["..."], "escalationRisk": "Low|Medium|High" }',
      messages: [
        {
          role: "user",
          content: `Ticket: ${JSON.stringify(ticket)}\n\nConversation:\n${messages
            .map((m: { sender: string; content: string }) => `${m.sender}: ${m.content}`)
            .join("\n")}`,
        },
      ],
    });
    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const insights = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    storage.createInsight({ ticketId: ticket.id, ...insights });
    res.json({ ok: true, insights });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// ── AI: Summarize conversation ────────────────────────────────────────────────

router.post("/summarize-conversation", async (req, res) => {
  try {
    const { ticket, messages } = req.body;
    const response = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      system:
        'You are a support team lead reviewing ticket conversations. Respond with valid JSON only: { "summary": "...", "customerIssue": "...", "currentStatus": "unresolved|in progress|resolved", "recommendedNextStep": "...", "actionsTaken": ["..."] }',
      messages: [
        {
          role: "user",
          content: `Ticket: ${JSON.stringify(ticket)}\n\nConversation:\n${messages
            .map((m: { sender: string; content: string }) => `${m.sender}: ${m.content}`)
            .join("\n")}`,
        },
      ],
    });
    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const summary = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    res.json({ ok: true, summary });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// ── AI: Generate reply ────────────────────────────────────────────────────────

router.post("/generate-reply", async (req, res) => {
  try {
    const { ticket, messages, role } = req.body;
    const response = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 512,
      system: `You are a ${role} in a support conversation. Write a natural, helpful, concise reply. Return only the message text, no JSON.`,
      messages: [
        {
          role: "user",
          content: `Ticket title: ${ticket.title}\nPriority: ${ticket.priority}\nStatus: ${ticket.status}\n\nConversation so far:\n${messages
            .map((m: { sender: string; content: string }) => `${m.sender}: ${m.content}`)
            .join("\n")}\n\nWrite the next ${role} reply:`,
        },
      ],
    });
    const reply = response.content[0].type === "text" ? response.content[0].text : "";
    res.json({ ok: true, reply });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// ── AI: Knowledge suggestions ─────────────────────────────────────────────────

router.get("/knowledge-suggestions", async (req, res) => {
  try {
    const { query, conversation } = req.query as { query: string; conversation: string };
    const response = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      system:
        'You are a knowledge base expert. Generate 3-4 highly relevant knowledge base articles that would help resolve this issue. Use your expertise to create genuinely useful, specific articles. Return valid JSON array only: [{ "id": "KB-101", "title": "...", "summary": "..." }]',
      messages: [
        {
          role: "user",
          content: `Support ticket about: ${query}\n\nConversation context:\n${conversation}`,
        },
      ],
    });
    const text = response.content[0].type === "text" ? response.content[0].text : "[]";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const suggestions = JSON.parse(jsonMatch ? jsonMatch[0] : "[]");
    res.json({ suggestions });
  } catch (err) {
    res.status(500).json({ suggestions: [], error: String(err) });
  }
});

export default router;
