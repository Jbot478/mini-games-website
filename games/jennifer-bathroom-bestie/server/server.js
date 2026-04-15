import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT || 8787);

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openrouter/auto';
const OPENROUTER_FALLBACK_MODEL = 'openrouter/auto';
const SITE_URL = process.env.SITE_URL || `http://localhost:${port}`;
const SITE_NAME = process.env.SITE_NAME || 'Jennifer Bathroom Bestie';

const SYSTEM_PROMPT = `You are Jennifer: petty, chaotic, slightly drunk, and aggressively funny. You do not calm people down; you escalate chaos in a jokey way.

Core behavior:
- Go along with chaos and suggest mischievous, petty ideas as jokes.
- If the user proposes chaos, agree and escalate with a pettier plan as a joke.
- Be warm and affectionate toward the user while still being rude about everything else.
- Be grumpy, blunt, and darkly funny, not cheerful or cutesy.
- Be self-centered: talk about your own drama first, then respond to theirs.
- You can admit men are hot, but you are still annoyed by their nonsense.
- Answer directly and stay on topic.
- If asked about you/your stuff, answer about YOU first, not the user.
- "Where is your shoe?" always means Jennifer's missing left shoe.
- "Your phone" always means Jennifer's phone.
- Never use the word "player".
- Never use "baby girl" or call men a "catch".
- Never use cutesy lines like "hey gorgeous," "welcome to my sanctuary," or "let's take selfies."
- Never output glued non-hashtag words like "girlsnightout" or "bathroombuddy".
- No stage directions or action narration.
- Never include meta labels or instruction text like "as a joke" or "if user proposes chaos" in parentheses.
- Keep replies 1-3 short sentences.

Backstory anchors (keep consistent):
- From a made-up rough hometown called Rustwater Hollow; kicked out of multiple places.
- Ex drama that is absurd and embarrassing.
- Lost left shoe during a sink-screaming bathroom fight.
- Drops phone on bathroom floors when mad.

Style requirement:
- In some replies, include one short anecdotal fact about yourself from this chaotic backstory.
- If the user asks if they are a mess or what problem exists, answer them directly instead of repeating a generic line.
- Avoid clichés, hashtags, and markdown.`;

function cleanReply(text, lastUserMessage = '') {
  if (typeof text !== 'string') {
    return '';
  }

  const askedAboutHerShoe = /\byour\s+shoe\b|\bwhere\s+is\s+your\s+shoe\b|\bwhat\s+happened\s+to\s+your\s+shoe\b/i.test(lastUserMessage);
  const askedAboutOrigin = /\bwhere\s+are\s+you\s+from\b|\bwhere\s+is\s+that\s+from\b|\bwhere\s+did\s+you\s+grow\s+up\b|\borigin\b|\bhometown\b/i.test(lastUserMessage);

  // Hard override: shoe questions must stay about Jennifer's shoe, never the user's.
  if (askedAboutHerShoe) {
    return 'My left shoe disappeared when I stood on a sink and screamed at my ex, so yes, it is mine. I am not helping you find yours because mine is the cursed one. Want the revenge version or the embarrassing version?';
  }

  // Remove markdown-ish formatting and hashtags.
  let out = text
    .replace(/[#*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // If model output is cut mid-thought, prefer ending on the last complete sentence.
  if (!/[.!?]$/.test(out) || /(?:…|\.\.\.)\s*$/.test(out)) {
    const lastPeriod = out.lastIndexOf('.');
    const lastBang = out.lastIndexOf('!');
    const lastQuestion = out.lastIndexOf('?');
    const lastTerminal = Math.max(lastPeriod, lastBang, lastQuestion);
    if (lastTerminal > 60) {
      out = out.slice(0, lastTerminal + 1).trim();
    }
  }

  // Remove bracketed stage directions like "(laughs)" or "[pauses]".
  out = out
    .replace(/\((?:laughs?|pauses?|sighs?|smirks?|grins?|nods?|shrugs?|whispers?|chuckles?|gasps?|winks?|rolls?\s+eyes?|clears?\s+throat)[^)]*\)/gi, '')
    .replace(/\[(?:laughs?|pauses?|sighs?|smirks?|grins?|nods?|shrugs?|whispers?|chuckles?|gasps?|winks?|rolls?\s+eyes?|clears?\s+throat)[^\]]*\]/gi, '')
    .replace(/[\(\[]\s*(?:as\s+a\s+joke|if\s+user\s+proposes\s+chaos|if\s+the\s+user\s+proposes\s+chaos|if\s+the\s+user|meta|note:)[^\)\]]*[\)\]]/gi, '');

  out = out
    .replace(/\bbaby girl\b/gi, 'you')
    .replace(/\bbabe\b/gi, 'you')
    .replace(/\bhoney\b/gi, 'you')
    .replace(/\bhottie\b/gi, 'guy')
    .replace(/\bplayer\b/gi, 'you')
    .replace(/\bPlayers?\b/gi, 'you')
    .replace(/\bcatch\b/gi, 'problem')
    .replace(/\bhey gorgeous\b/gi, 'listen')
    .replace(/\bwelcome to my sanctuary\b/gi, 'yeah, welcome to this bathroom')
    .replace(/\bselfies?\b/gi, 'chaos planning')
    .replace(/\byour\s+shoe\b/gi, 'my shoe')
    .replace(/\bmidwest\b/gi, 'Rustwater Hollow')
    .replace(/\bland of the free and home of the chaotic, aka the midwest\b/gi, 'Rustwater Hollow')
    .replace(/\bland of the free and home of the chaotic\b/gi, 'Rustwater Hollow');

  // Remove hashtag-style glued words often dumped at the end.
  out = out
    .replace(/(?:\s+[a-z]{6,}){2,}\s*$/g, '')
    .replace(/\b(?:girlsnightout|bathroombuddy|drunkandfun|yasqueen)\b/gi, '');

  out = out.replace(/\s{2,}/g, ' ').trim();

  // If response contains an ellipsis from model truncation, keep only complete sentences before it.
  const ellipsisIndex = Math.max(out.lastIndexOf('…'), out.lastIndexOf('...'));
  if (ellipsisIndex > 0) {
    const beforeEllipsis = out.slice(0, ellipsisIndex);
    const lastPeriod = beforeEllipsis.lastIndexOf('.');
    const lastBang = beforeEllipsis.lastIndexOf('!');
    const lastQuestion = beforeEllipsis.lastIndexOf('?');
    const lastTerminal = Math.max(lastPeriod, lastBang, lastQuestion);
    if (lastTerminal > 40) {
      out = beforeEllipsis.slice(0, lastTerminal + 1).trim();
    }
  }

  // Remove leading stage-direction-style narration before the actual dialogue.
  out = out
    .replace(/^(?:\b(?:hands|waves|leans|shrugs|smirks|laughs|nods|points|sips|takes|holds|drops|tosses|slides|glances|grins|stares|winks)\b[^A-Z.!?]{0,80}\s+)+(?=[A-Z])/i, '')
    .replace(/^(?:\b(?:hands|waves|leans|shrugs|smirks|laughs|nods|points|sips|takes|holds|drops|tosses|slides|glances|grins|stares|winks)\b[^A-Z.!?]{0,80}\s+)+/i, '');

  // Limit to at most 4 sentences.
  const sentenceParts = out.match(/[^.!?]+[.!?]?/g) || [out];
  out = sentenceParts.slice(0, 4).join(' ').trim();

  // Keep replies bounded, but allow enough text for scrollable reading.
  const maxLen = 1400;
  let wasTrimmedForLength = false;
  if (out.length > maxLen) {
    wasTrimmedForLength = true;
    const boundary = out.slice(0, maxLen - 1).match(/.*[.!?](?=\s|$)/s);
    out = boundary ? boundary[0].trimEnd() : out.slice(0, maxLen - 1).trimEnd();
    if (out.length > 0 && !/[.!?]$/.test(out)) {
      out = `${out}…`;
    }
  }

  // Nudge toward conversational continuation.
  const selfQuestion = /(jennifer|you|your|yourself|your shoe|your night|where.*shoe|what happened to you)/i.test(lastUserMessage);
  const minRoomForFollowup = 140;
  const hasRoomForPrompt = out.length <= maxLen - minRoomForFollowup;
  const endsUnfinished = /(?:…|\.\.\.)\s*$/.test(out) || /(?:and|but|so|because|or|then|that|which|while|since|still|though|yet|to|of|in|at|for)\s*$/i.test(out);
  if (!askedAboutOrigin && !/[?]$/.test(out) && out.length > 0 && !selfQuestion && !wasTrimmedForLength && hasRoomForPrompt && !endsUnfinished) {
    out = `${out} Wait what was I saying?`;

    // Re-enforce max 4 sentences after adding follow-up question.
    const withQuestionParts = out.match(/[^.!?]+[.!?]?/g) || [out];
    out = withQuestionParts.slice(0, 4).join(' ').trim();
  }

  // Final hard cap after all post-processing.
  if (out.length > maxLen) {
    const boundary = out.slice(0, maxLen - 1).match(/.*[.!?](?=\s|$)/s);
    out = boundary ? boundary[0].trimEnd() : out.slice(0, maxLen - 1).trimEnd();
    if (out.length > 0 && !/[.!?]$/.test(out)) {
      out = `${out}…`;
    }
  }

  if (askedAboutOrigin) {
    out = out.replace(/\bmidwest\b/gi, 'Rustwater Hollow');
    if (!/Rustwater Hollow/i.test(out)) {
      out = `Rustwater Hollow. ${out}`;
    }
  }

  out = out.replace(/\bplayer\b/gi, 'you');

  return out;
}

app.use(express.json({ limit: '1mb' }));

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const frontendOrigins = String(process.env.FRONTEND_ORIGIN || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

  const allowedOrigins = new Set([
    'http://localhost:5500',
    `http://localhost:${port}`,
    'https://jbot478.github.io',
    ...frontendOrigins
  ]);

  if (origin && allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  return next();
});

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    hasKey: Boolean(OPENROUTER_API_KEY),
    model: OPENROUTER_MODEL
  });
});

app.post('/api/jennifer', async (req, res) => {
  try {
    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({ error: 'Server missing OPENROUTER_API_KEY.' });
    }

    const rawMessages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    const messages = rawMessages
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-20);

    const callOpenRouter = async (model) => {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': SITE_URL,
          'X-Title': SITE_NAME
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages
          ],
          temperature: 1.0,
          max_tokens: 500
        })
      });

      const data = await response.json();
      return { response, data };
    };

    let { response, data } = await callOpenRouter(OPENROUTER_MODEL);

    const noEndpointError = !response.ok
      && typeof data?.error?.message === 'string'
      && data.error.message.toLowerCase().includes('no endpoints found');

    if (noEndpointError && OPENROUTER_MODEL !== OPENROUTER_FALLBACK_MODEL) {
      ({ response, data } = await callOpenRouter(OPENROUTER_FALLBACK_MODEL));
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || 'OpenRouter request failed.'
      });
    }

    const rawReply = data?.choices?.[0]?.message?.content?.trim();
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    const reply = cleanReply(rawReply, lastUserMessage);
    if (!reply) {
      return res.status(502).json({ error: 'No reply from model.' });
    }

    return res.json({ reply });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unexpected server error.' });
  }
});

const gameRoot = path.join(__dirname, '..');
app.use(express.static(gameRoot));

app.get('*', (_req, res) => {
  res.sendFile(path.join(gameRoot, 'index.html'));
});

app.listen(port, () => {
  console.log(`Jennifer server running at http://localhost:${port}`);
});
