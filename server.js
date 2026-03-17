require('dotenv').config();
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');
const { buildSystemPrompt, buildUserPrompt } = require('./prompt');

const app = express();
const port = process.env.PORT || 3000;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

app.use(express.json());
app.use(express.static(path.join(__dirname)));

/**
 * Route: POST /api/decode
 * Accepts a GitHub URL and returns a non-technical summary.
 */
app.post('/api/decode', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'GitHub URL is required' });
  }

  try {
    // 1. Extract owner/repo
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      return res.status(400).json({ error: 'Invalid GitHub URL' });
    }
    const [_, owner, repoClean] = match;
    const repo = repoClean.replace(/\.git$/, '');

    console.log(`[Server] Decoding: ${owner}/${repo}`);

    // 2. Fetch data from GitHub API
    // Note: In a production app, we'd use a GitHub token to avoid rate limits.
    // For this demo, we use public access.
    
    // Fetch Repo Metadata
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
    if (!repoResponse.ok) throw new Error('Repo not found or private');
    const repoData = await repoResponse.json();

    // Fetch README
    let readme = '';
    const readmeResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`);
    if (readmeResponse.ok) {
      const readmeJson = await readmeResponse.json();
      readme = Buffer.from(readmeJson.content, 'base64').toString('utf-8');
    }

    // Fetch File Tree
    let fileTree = '';
    const treeResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`);
    if (treeResponse.ok) {
      const treeJson = await treeResponse.json();
      fileTree = treeJson.tree
        .filter(node => node.type === 'blob' && !node.path.includes('node_modules'))
        .map(node => node.path)
        .slice(0, 50) // Limit to 50 files for prompt efficiency
        .join('\n');
    }

    // 3. Call Claude AI
    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1024,
      system: buildSystemPrompt(),
      messages: [
        { role: "user", content: buildUserPrompt({ 
          name: repoData.name, 
          description: repoData.description, 
          language: repoData.language, 
          readme, 
          fileTree 
        }) }
      ],
    });

    const responseText = msg.content[0].text;
    const summary = JSON.parse(responseText);

    res.json(summary);

  } catch (error) {
    console.error('[Server Error]', error);
    res.status(500).json({ error: error.message || 'Failed to decode repository' });
  }
});

app.listen(port, () => {
  console.log(`[WhatintheGit] Server running at http://localhost:${port}`);
});
