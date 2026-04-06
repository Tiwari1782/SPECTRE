const Groq = require('groq-sdk');

// Dual-key fallback system
const PRIMARY_KEY = process.env.GROQ_API_KEY_PRIMARY;
const FALLBACK_KEY = process.env.GROQ_API_KEY_FALLBACK;

let groqPrimary = null;
let groqFallback = null;

if (PRIMARY_KEY) {
  groqPrimary = new Groq({ apiKey: PRIMARY_KEY });
}
if (FALLBACK_KEY) {
  groqFallback = new Groq({ apiKey: FALLBACK_KEY });
}

const MODEL = 'llama-3.3-70b-versatile';

// Core request handler with automatic fallback
async function groqRequest(messages, options = {}) {
  const {
    maxTokens = 300,
    temperature = 0.7,
    jsonMode = false
  } = options;

  const requestBody = {
    model: MODEL,
    messages,
    max_tokens: maxTokens,
    temperature,
    ...(jsonMode && { response_format: { type: 'json_object' } })
  };

  // Try primary key first
  if (groqPrimary) {
    try {
      const res = await groqPrimary.chat.completions.create(requestBody);
      return res.choices[0].message.content.trim();
    } catch (err) {
      console.warn(`[GROQ] Primary key failed: ${err.message}. Trying fallback...`);
    }
  }

  // Fallback key
  if (groqFallback) {
    try {
      const res = await groqFallback.chat.completions.create(requestBody);
      return res.choices[0].message.content.trim();
    } catch (err) {
      console.error(`[GROQ] Fallback key also failed: ${err.message}`);
      throw new Error('AI service temporarily unavailable. Both API keys exhausted.');
    }
  }

  throw new Error('No Groq API keys configured.');
}

// Generate match explanation between two users
exports.generateMatchExplanation = async (user, target, score, breakdown) => {
  const prompt = `You are DevMatch AI. Given two hackathon participants, write a 2-sentence match explanation.
Be specific about their skills and roles. Sound smart but conversational.

User A: ${user.name}, Role: ${user.role}, Skills: ${user.skills.map(s => s.name).join(', ')}, Goal: ${user.goals}
User B: ${target.name}, Role: ${target.role}, Skills: ${target.skills.map(s => s.name).join(', ')}, Goal: ${target.goals}
Compatibility: ${score}%
Breakdown: ${JSON.stringify(breakdown)}

Return only the explanation text, no preamble.`;

  return await groqRequest(
    [{ role: 'user', content: prompt }],
    { maxTokens: 150 }
  );
};

// Generate project ideas for a team
exports.generateProjectIdeas = async (team) => {
  const teamSummary = team.map(m =>
    `${m.user?.name || m.name} (${m.role}): ${(m.user?.skills || m.skills || []).map(s => s.name).join(', ')}`
  ).join('\n');

  const prompt = `You are a hackathon idea generator. Given a team's skills and roles, suggest 3 project ideas.
Each idea: name, one-line description, and highlight which team member leads each part.
Return as JSON: { "ideas": [{ "name": "...", "description": "...", "roleMapping": { "memberName": "responsibility" } }] }
Team:
${teamSummary}`;

  const result = await groqRequest(
    [{ role: 'user', content: prompt }],
    { maxTokens: 600, jsonMode: true }
  );
  return JSON.parse(result);
};

// Conversational Idea Co-Pilot
exports.ideaCopilot = async (messages, teamContext) => {
  const systemPrompt = `You are DevMatch's AI Idea Co-Pilot for a hackathon team.
Team context: ${JSON.stringify(teamContext)}
Help them brainstorm, refine, and evolve project ideas conversationally.
When they say "make it more X" or "add Y angle", update the idea accordingly.
Keep responses concise (3-5 sentences max). Be enthusiastic but practical.`;

  return await groqRequest(
    [{ role: 'system', content: systemPrompt }, ...messages],
    { maxTokens: 400 }
  );
};

// Team Health Analysis
exports.analyzeTeamHealth = async (team) => {
  const teamSummary = team.map(m =>
    `${m.name} (${m.role}): ${m.skills.map(s => s.name).join(', ')}`
  ).join('\n');

  const prompt = `Analyze this hackathon team and return JSON:
{
  "overallScore": 0-100,
  "strengths": ["..."],
  "gaps": ["..."],
  "suggestedRoles": { "memberName": "role" },
  "recommendation": "one sentence"
}
Team:
${teamSummary}`;

  const result = await groqRequest(
    [{ role: 'user', content: prompt }],
    { maxTokens: 500, jsonMode: true }
  );
  return JSON.parse(result);
};

// Generate Skill Quiz
exports.generateQuiz = async (skill) => {
  const prompt = `Generate 5 multiple-choice questions to verify intermediate knowledge of "${skill}".
Return only JSON:
{
  "questions": [
    {
      "id": 1,
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "..."
    }
  ]
}
Make questions practical, not theoretical. No preamble.`;

  const result = await groqRequest(
    [{ role: 'user', content: prompt }],
    { maxTokens: 1000, jsonMode: true }
  );
  return JSON.parse(result);
};
