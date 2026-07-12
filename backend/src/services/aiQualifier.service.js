const DEFAULT_MODEL = 'gemini-2.5-flash';

function buildInstructions() {
  return [
    'You are a B2B sales development assistant for Oplify Solutions.',
    'Qualify inbound website leads for a software and AI automation services business.',
    'You MUST return your response as a valid JSON object.',
    'Return ONLY valid JSON with these exact keys: score, reason, emailDraft.',
    'score must be one of: Hot, Warm, Cold.',
    'reason must be one concise sentence explaining the score.',
    'emailDraft must be a polished first-response email addressed to the lead by first name.',
    'Prefer Hot when the message shows an urgent business problem, budget, timeline, or specific implementation need.',
    'Prefer Warm when there is a plausible business need but unclear urgency.',
    'Prefer Cold when the message is vague, non-commercial, spam-like, or low intent.',
  ].join(' ');
}

function buildInput(lead) {
  return JSON.stringify({
    fullName: lead.fullName,
    email: lead.email,
    businessName: lead.businessName || null,
    message: lead.message,
  });
}

function extractOutputText(responsePayload) {
  // Handle the standard OpenAI/Gemini chat completion data structure
  if (responsePayload?.choices?.[0]?.message?.content) {
    return responsePayload.choices[0].message.content;
  }
  
  // Fallback for unexpected object structure
  return '';
}

function getFirstName(fullName) {
  return fullName.trim().split(/\s+/)[0] || 'there';
}

function makeFallbackDraft(lead, score) {
  const firstName = getFirstName(lead.fullName);
  const businessLine = lead.businessName ? ` at ${lead.businessName}` : '';

  return [
    `Hi ${firstName},`,
    '',
    `Thanks for reaching out${businessLine}. I read your note and it sounds like there may be a useful opportunity to explore how Oplify can help.`,
    '',
    score === 'Hot'
      ? 'Would you be open to a quick call this week so we can understand the requirement and suggest the fastest next step?'
      : 'Could you share a little more context about your current process, timeline, and what a successful outcome would look like?',
    '',
    'Best,',
    'Oplify Solutions',
  ].join('\n');
}

function fallbackQualification(lead, reasonPrefix = 'Local fallback used') {
  const text = `${lead.businessName || ''} ${lead.message}`.toLowerCase();
  const hotSignals = ['urgent', 'asap', 'immediately', 'budget', 'proposal', 'demo', 'quote', 'enterprise', 'automation', 'integrate'];
  const coldSignals = ['student', 'job', 'internship', 'test', 'hello', 'just checking'];

  let score = 'Warm';
  let reason = `${reasonPrefix}: the lead describes a possible business need but lacks timeline or budget detail.`;

  if (hotSignals.some((signal) => text.includes(signal))) {
    score = 'Hot';
    reason = `${reasonPrefix}: the message includes buying-intent signals such as urgency, automation, budget, demo, or implementation needs.`;
  } else if (text.length < 70 || coldSignals.some((signal) => text.includes(signal))) {
    score = 'Cold';
    reason = `${reasonPrefix}: the message is brief, vague, or not clearly tied to a business buying need.`;
  }

  return {
    score,
    reason,
    emailDraft: makeFallbackDraft(lead, score),
    model: 'local-rule-fallback',
    status: 'fallback',
  };
}

function normalizeQualification(raw, lead, model) {
  const score = ['Hot', 'Warm', 'Cold'].includes(raw.score) ? raw.score : 'Warm';
  const reason =
    typeof raw.reason === 'string' && raw.reason.trim()
      ? raw.reason.trim().slice(0, 500)
      : 'The lead has a plausible business need, but the model did not provide a specific reason.';
  const emailDraft =
    typeof raw.emailDraft === 'string' && raw.emailDraft.trim()
      ? raw.emailDraft.trim().slice(0, 4000)
      : makeFallbackDraft(lead, score);

  return {
    score,
    reason,
    emailDraft,
    model,
    status: 'qualified',
  };
}

function parseJsonOutput(outputText) {
  const trimmed = outputText.trim();

  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return JSON.parse(trimmed);
  }

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch) {
    return JSON.parse(fencedMatch[1]);
  }

  const objectMatch = trimmed.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    return JSON.parse(objectMatch[0]);
  }

  throw new Error(`AI response did not contain JSON. Raw text received: ${outputText}`);
}

async function callOpenAI(lead) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;

  if (!apiKey) {
    return fallbackQualification(lead, 'No OPENAI_API_KEY configured');
  }

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {    
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: buildInstructions()
        },
        {
          role: 'user',
          content: `Here is the lead to qualify:\n${buildInput(lead)}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2
    }),
  });

  if (!response.ok) {
    const errorDetails = await response.text();
    console.error("google gemini error:", response.status, errorDetails);
    throw new Error(`google api error ${response.status}: ${errorDetails}`);
  }

  const payload = await response.json();
  const outputText = extractOutputText(payload);
  const parsed = parseJsonOutput(outputText);

  return normalizeQualification(parsed, lead, model);
}

async function qualifyLead(lead) {
  if (process.env.AI_QUALIFICATION_MODE === 'fallback') {
    return fallbackQualification(lead, 'Forced fallback mode');
  }

  try {
    return await callOpenAI(lead);
  } catch (err) {
    console.error('AI qualification fell back due to error:', err);
    return fallbackQualification(lead, 'AI API fallback used');
  }
}

module.exports = { qualifyLead, fallbackQualification };