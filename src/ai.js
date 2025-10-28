require('dotenv').config();
const OpenAI = require('openai');

const apiKey = process.env.OPENAI_API_KEY;
const defaultModel = process.env.OPENAI_MODEL || 'gpt-4o-mini';

let client;
if (apiKey) {
  client = new OpenAI({ apiKey });
}

async function completeCategorization(prompt) {
  if (!client) {
    throw new Error('Missing OPENAI_API_KEY. Cannot run AI categorization.');
  }
  const response = await client.chat.completions.create({
    model: defaultModel,
    messages: [
      {
        role: 'system',
        content:
          'You are a concise assistant. Output ONLY the requested markdown structure. No extra commentary.'
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.2,
    max_tokens: 800
  });
  const text = response.choices?.[0]?.message?.content?.trim();
  return text || 'No output produced.';
}

module.exports = { completeCategorization };
