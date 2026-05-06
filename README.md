# 🎫 AI Ticket Assist

> A full-stack AI-powered customer support ticketing system built with React, Node.js, and Claude AI.

![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-v24.15.0-green)
![Claude](https://img.shields.io/badge/AI-Claude%20Opus-orange)

---

## 📋 Overview

AI Ticket Assist is a lightweight agentic customer support ticketing system that demonstrates real-world AI integration in a production-ready web application. Built as part of the **Claude Certified Architect Foundation** certification, it showcases how Claude AI can be embedded into business workflows to automate repetitive tasks and enhance productivity.

---

## ✨ Features

### Core Ticket Management
- ➕ **Create tickets** with title, description, priority (Low/Medium/High)
- 📋 **List and filter** all support tickets
- ✏️ **Update ticket status** (Open → In Progress → Closed)
- 🗑️ **Soft delete** with trash bin and restore functionality

### AI-Powered Features (via Claude Opus)
- 🤖 **AI Reply Suggestion** — Claude drafts professional support responses
- 🔍 **Ticket Insights** — Auto-generated escalation risk, summary, and next steps
- 📝 **Conversation Summary** — Condenses long threads into key takeaways
- 📚 **Knowledge Base** — AI suggests relevant articles per ticket

### UX Features
- 🌙 **Dark/Light mode** toggle
- 💬 **Conversation threading** — reply as Agent or Customer
- ⚡ **Real-time updates** via TanStack Query
- 🎨 **Clean, responsive UI** built with shadcn/ui + Tailwind CSS

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Routing | wouter |
| Data Fetching | TanStack Query v5 |
| Backend | Node.js + Express |
| AI | Anthropic Claude Opus (claude-opus-4-6) |
| Data Store | In-memory (no database required) |
| Icons | lucide-react |
| Dates | date-fns |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18 or higher
- An Anthropic API key ([get one here](https://console.anthropic.com))

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/pradeepbhatt1309/AI-enabled-Ticketing-System.git
cd AI-enabled-Ticketing-System
```

**2. Switch to the app branch**
```bash
git checkout claude/ai-ticket-assist-app-CFCz4
```

**3. Install dependencies**
```bash
npm install
cd client && npm install && cd ..
```

**4. Set up environment variables**
```bash
cp .env.example .env
```
Open `.env` and add your Anthropic API key:
```
ANTHROPIC_API_KEY=your-api-key-here
```

**5. Run the app**
```bash
npm run dev
```

**6. Open in browser**
```
http://localhost:5173
```

---

## 📁 Project Structure

```
AI-enabled-Ticketing-System/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── pages/           # Route pages
│   │   └── App.tsx          # Main app + routing
├── server/                  # Express backend
│   ├── routes.ts            # API endpoints
│   ├── storage.ts           # In-memory data store
│   └── index.ts             # Server entry point
├── .env.example             # Environment variable template
├── package.json             # Root dependencies
└── README.md
```

---

## 🔌 API Endpoints

### Tickets
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/tickets | Get all active tickets |
| POST | /api/tickets | Create new ticket |
| PATCH | /api/tickets/:id | Update ticket |
| DELETE | /api/tickets/:id | Soft delete ticket |

### AI Endpoints
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/insights | Generate AI insights for ticket |
| POST | /api/generate-reply | AI drafts a reply |
| POST | /api/summarize-conversation | Summarise thread |
| GET | /api/knowledge-suggestions | Get KB article suggestions |

### Trash
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/tickets/trash/list | Get deleted tickets |
| PATCH | /api/tickets/:id/restore | Restore ticket |
| DELETE | /api/tickets/:id/permanent | Permanently delete |

---

## 🤖 Agentic AI Architecture

This app demonstrates key agentic patterns from the Claude Certified Architect curriculum:

```
User Action (e.g. clicks "Generate Reply")
        ↓
Frontend sends ticket + conversation context
        ↓
Express backend calls Anthropic API
        ↓
Claude analyses context + generates response
        ↓
Structured JSON returned and validated
        ↓
UI renders AI-generated content
```

**Key patterns used:**
- ✅ Structured output with JSON schema validation
- ✅ Retry logic on API failures
- ✅ Graceful degradation when AI unavailable
- ✅ Context-aware prompting (ticket + conversation history)

---

## 🔒 Environment Variables

| Variable | Required | Description |
|---|---|---|
| ANTHROPIC_API_KEY | ✅ Yes | Your Anthropic API key |
| PORT | ❌ Optional | Backend port (default: 5000) |

---

## 📸 Screenshots

> App running on localhost:5173 with dark mode enabled, showing ticket list, conversation thread, and AI insights panel.

---

## 🎓 Built For

This project was built as the practical exam component of the **Anthropic Claude Certified Architect — Foundations** certification, demonstrating:
- Full-stack AI application development
- Agentic workflow design
- Structured output and prompt engineering
- Production-ready error handling

---

## 👤 Author

**Pradeep Bhatt**
Senior Project Manager | Wealth & Asset Management | AI Enthusiast
- GitHub: [@pradeepbhatt1309](https://github.com/pradeepbhatt1309)

---

## 📄 License

MIT License — feel free to use this as a reference for your own AI projects.
