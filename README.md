# Prompt Factory

A focused prompt engineering workbench for crafting, refining, and managing LLM prompt templates. Built as a portfolio project to explore agentic UX patterns and AI-assisted tooling.

## Features

- **AI-Guided Generation** — Describe your use case in plain language; Gemini drafts a structured template instantly
- **Prompt Editor** — Markdown-aware editor with word/character/token metrics
- **Enhance Suite** — Proofread, shorten, or optimize any prompt via Gemini with inline diff view
- **History & Favorites** — Persistent prompt library with markdown preview cards
- **5 Frontier Models** — Target prompts to Claude Fable 5, Claude Opus 4.8, Gemini 3.1 Pro, Gemini 3.5 Flash, or GPT-5.5
- **Dark / Light mode** — System-aware theme toggle

## Tech Stack

- **React 18** + **TypeScript** — Component architecture with strict typing
- **Vite** — Fast dev server and build tooling
- **Tailwind CSS v4** — Utility-first styling with custom design tokens
- **Google GenAI SDK** — Gemini API integration for generation and enhancement
- **react-markdown** + **diff** — Markdown rendering and word-level diff highlighting

## Getting Started

**Prerequisites:** Node.js ≥ 18

```bash
# Install dependencies
npm install

# Add your Gemini API key
cp .env.example .env.local
# Edit .env.local → VITE_GEMINI_API_KEY=your_key_here

# Start dev server
npm run dev
```

## Project Structure

```
src/
├── components/
│   ├── AIGuidedExplore.tsx   # Landing page — AI prompt generator
│   ├── Editor.tsx            # Prompt editor with enhance modal
│   ├── Feed.tsx              # History / favorites list view
│   ├── Sidebar.tsx           # Navigation sidebar
│   └── SpecCard.tsx          # Prompt preview card with markdown render
├── App.tsx                   # Root layout and state management
├── types.ts                  # Shared TypeScript types
└── index.css                 # Design tokens and global styles
```

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_GEMINI_API_KEY` | Google Gemini API key ([get one here](https://aistudio.google.com/app/apikey)) |
