# WhatintheGit

**A technical-to-human translator for GitHub repositories.**

Paste any public GitHub repo URL and get a plain-English breakdown of what it does — no jargon, no code reading required. Built for PMs, MBAs, investors, and anyone who needs to understand software without being a developer.

## What it does

WhatintheGit fetches a repo's metadata, README, and file structure, then sends it to Claude AI for analysis. The result is a structured summary with:

- **One-liner** — a 10-word punchy description of what the project is
- **Value proposition** — 2–3 sentences on the problem it solves
- **Functional map** — a "Lego breakdown" of the core components
- **Complexity rating** — Low / Medium / High

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express 4 |
| AI | Anthropic Claude (`claude-3-5-sonnet`) via `@anthropic-ai/sdk` |
| Frontend | Vanilla JavaScript + CSS3 |
| Config | dotenv |

## Getting Started

### Prerequisites

- Node.js (v18+)
- An [Anthropic API key](https://console.anthropic.com/)

### Installation

```bash
git clone https://github.com/justanotheraryan-code/whatinthegit.git
cd whatinthegit
npm install
```

### Configuration

Create a `.env` file in the project root:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
PORT=3000  # optional, defaults to 3000
```

### Running

```bash
# Production
npm start

# Development (auto-restarts on file changes)
npm run dev
```

Open `http://localhost:3000` in your browser.

## Usage

1. Paste any public GitHub repository URL into the input field (e.g. `https://github.com/facebook/react`)
2. Hit **Decode**
3. Read the plain-English breakdown

## API

**POST** `/api/decode`

```json
// Request
{ "url": "https://github.com/owner/repo" }

// Response
{
  "one_liner": "...",
  "value_proposition": "...",
  "functional_map": ["...", "..."],
  "estimated_complexity": "Medium"
}
```

## Project Structure

```
whatinthegit/
├── server.js      # Express server + GitHub API integration + Claude calls
├── prompt.js      # System and user prompt builders for Claude
├── index.html     # Frontend UI
├── script.js      # Frontend event handling and result rendering
├── style.css      # Dark theme styling
└── package.json
```

## Limitations

- GitHub API is accessed without authentication — subject to 60 requests/hour rate limit
- Analysis is limited to the first 50 files in a repository
- Only public repositories are supported
