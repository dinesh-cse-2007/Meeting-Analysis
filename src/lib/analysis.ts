import type {
  MeetingAnalysis,
  ActionItem,
  KeyPoint,
  Decision,
  Question,
  TalkRatioEntry,
  Sentiment,
} from '@/types';

const POSITIVE_WORDS = [
  'great', 'excellent', 'agree', 'love', 'perfect', 'excited', 'happy',
  'success', 'fantastic', 'wonderful', 'good', 'progress', 'accomplished',
  'achieved', 'delighted', 'thrilled', 'confident', 'optimistic', 'glad',
  'impressive', 'outstanding', 'remarkable', 'pleased', 'satisfied', 'win',
  'breakthrough', 'improved', 'boost', 'benefit', 'advantage', 'opportunity',
  'collaborate', 'supportive', 'smooth', 'effective', 'productive', 'innovative',
];

const NEGATIVE_WORDS = [
  'concern', 'problem', 'issue', 'difficult', 'frustrated', 'worried',
  'confused', 'disappointed', 'bad', 'terrible', 'fail', 'failed', 'failure',
  'angry', 'unhappy', 'risk', 'blocker', 'blocked', 'stuck', 'delay',
  'overdue', 'struggling', 'challenging', 'unfortunately', 'regret', 'negative',
  'decline', 'drop', 'loss', 'threat', 'obstacle', 'complicated', 'unclear',
  'misunderstanding', 'disagree', 'reject', 'rejected', 'can\'t', 'won\'t',
  'unable', 'missed', 'broken', 'bottleneck', 'escalate', 'critical',
];

const ACTION_VERBS = [
  'will', 'need to', 'should', 'must', 'let\'s', 'we\'ll', 'I\'ll',
  'going to', 'plan to', 'aim to', 'commit to', 'responsible for',
  'follow up', 'send', 'prepare', 'review', 'schedule', 'create',
  'update', 'fix', 'investigate', 'research', 'draft', 'finalize',
  'implement', 'deploy', 'test', 'reach out', 'coordinate', 'organize',
  'set up', 'gather', 'analyze', 'submit', 'share', 'complete', 'build',
];

const DECISION_INDICATORS = [
  'decided', 'agreed to', 'we agreed', 'conclusion', 'resolved',
  'approved', 'confirmed', 'finalized', 'concluded', 'settled on',
  'chosen', 'selected', 'adopted', 'accepted', 'determined',
  'we will go with', 'moving forward with', 'rolling out',
  'pivoting to', 'switching to', 'canceling', 'launching',
];

const QUESTION_INDICATORS = ['?', 'what about', 'how do we', 'should we',
  'can we', 'could we', 'what if', 'when will', 'who will', 'where is',
  'why is', 'is there', 'are we', 'do we', 'have we', 'will we',
];

const TOPIC_KEYWORDS: Record<string, string[]> = {
  'Budget & Finance': ['budget', 'cost', 'spend', 'spending', 'revenue', 'price',
    'pricing', 'financial', 'investment', 'roi', 'expense', 'profit', 'margin'],
  'Product': ['product', 'feature', 'roadmap', 'release', 'launch', 'version',
    'update', 'bug', 'enhancement', 'ui', 'ux', 'design', 'prototype'],
  'Engineering': ['code', 'deploy', 'architecture', 'infrastructure', 'technical',
    'system', 'api', 'database', 'server', 'deployment', 'pipeline', 'testing'],
  'Marketing': ['marketing', 'campaign', 'brand', 'ad', 'advertisement', 'social',
    'content', 'seo', 'email', 'newsletter', 'promotion', 'audience', 'engagement'],
  'Sales': ['sales', 'deal', 'pipeline', 'prospect', 'client', 'customer',
    'lead', 'quota', 'revenue', 'contract', 'negotiation', 'closing'],
  'Human Resources': ['hire', 'hiring', 'employee', 'staff', 'team', 'onboarding',
    'training', 'performance', 'review', 'compensation', 'benefits', 'culture'],
  'Operations': ['process', 'workflow', 'operation', 'efficiency', 'logistics',
    'supply', 'vendor', 'procurement', 'quality', 'timeline', 'milestone'],
  'Strategy': ['strategy', 'goal', 'objective', 'vision', 'mission', 'priority',
    'initiative', 'growth', 'market', 'competitive', 'opportunity', 'plan'],
};

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'was', 'are', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these',
  'those', 'i', 'we', 'they', 'he', 'she', 'it', 'what', 'which', 'who',
  'when', 'where', 'why', 'how', 'all', 'each', 'every', 'some', 'any',
  'about', 'if', 'then', 'there', 'here', 'so', 'than', 'too', 'very',
  'just', 'also', 'only', 'now', 'well', 'back', 'more', 'most', 'other',
  'into', 'through', 'during', 'before', 'after', 'above', 'below', 'up',
  'down', 'out', 'off', 'over', 'under', 'again', 'further', 'once',
  'me', 'my', 'myself', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
  'them', 'their', 'theirs', 'themselves', 'him', 'his', 'her', 'hers',
  'its', 'itself', 'as', 'because', 'while', 'hadn', 'doesn', 'isn',
  'wasn', 'aren', 'weren', 'won', 'wouldn', 'shouldn', 'couldn', 'didn',
  'hasn', 'haven', 'mightn', 'mustn', 'needn', 'shan', 'let', 'll', 've',
  're', 'd', 's', 't', 'm', 'o', 'yes', 'yeah', 'ok', 'okay', 'right',
  'like', 'kind', 'sort', 'thing', 'things', 'stuff', 'actually', 'really',
  'basically', 'essentially', 'literally', 'got', 'get', 'go', 'going',
  'one', 'two', 'three', 'okay', 'uh', 'um', 'hmm', 'hmm,', 'oh',
]);

function splitSentences(text: string): string[] {
  return text
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);
}

function parseTranscript(transcript: string): { speaker: string; text: string }[] {
  const lines = transcript.split('\n').map((l) => l.trim()).filter(Boolean);
  const parsed: { speaker: string; text: string }[] = [];

  for (const line of lines) {
    const match = line.match(/^(.+?):\s*(.+)$/);
    if (match) {
      parsed.push({ speaker: match[1].trim(), text: match[2].trim() });
    } else if (parsed.length > 0) {
      parsed[parsed.length - 1].text += ' ' + line;
    }
  }

  if (parsed.length === 0) {
    const sentences = splitSentences(transcript);
    return sentences.map((text, i) => ({
      speaker: `Speaker ${Math.floor(i / 4) + 1}`,
      text,
    }));
  }

  return parsed;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function analyzeSentiment(text: string): { sentiment: Sentiment; score: number } {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  let positive = 0;
  let negative = 0;
  const total = words.length || 1;

  for (const word of words) {
    if (POSITIVE_WORDS.includes(word)) positive++;
    if (NEGATIVE_WORDS.includes(word)) negative++;
  }

  const score = (positive - negative) / Math.sqrt(total);
  const normalizedScore = Math.max(-1, Math.min(1, score * 10));

  let sentiment: Sentiment = 'neutral';
  if (normalizedScore > 0.15) sentiment = 'positive';
  else if (normalizedScore < -0.15) sentiment = 'negative';

  return { sentiment, score: Math.round(normalizedScore * 100) / 100 };
}

function extractActionItems(parsed: { speaker: string; text: string }[]): ActionItem[] {
  const items: ActionItem[] = [];
  const seen = new Set<string>();

  for (const { speaker, text } of parsed) {
    const lower = text.toLowerCase();
    for (const verb of ACTION_VERBS) {
      if (lower.includes(verb)) {
        if (seen.has(text)) continue;
        seen.add(text);

        const deadlineMatch = text.match(
          /(?:by|before|after|on|due)\s+((?:next\s+)?(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|week|month|end of (?:week|month|quarter)|\d{1,2}(?:st|nd|rd|th)?(?:\s+(?:of\s+)?(?:January|February|March|April|May|June|July|August|September|October|November|December))?))/i,
        );

        let priority: 'high' | 'medium' | 'low' = 'medium';
        if (/urgent|asap|immediately|critical|today|tonight/i.test(text)) {
          priority = 'high';
        } else if (/when possible|eventually|at some point|low priority/i.test(text)) {
          priority = 'low';
        }

        items.push({
          id: generateId(),
          text: text.length > 200 ? text.substring(0, 200) + '...' : text,
          owner: speaker,
          deadline: deadlineMatch ? deadlineMatch[1] : null,
          status: 'pending',
          priority,
        });
        break;
      }
    }
  }

  return items.slice(0, 20);
}

function extractDecisions(parsed: { speaker: string; text: string }[]): Decision[] {
  const decisions: Decision[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < parsed.length; i++) {
    const { text } = parsed[i];
    const lower = text.toLowerCase();
    for (const indicator of DECISION_INDICATORS) {
      if (lower.includes(indicator)) {
        const key = text.substring(0, 60);
        if (seen.has(key)) break;
        seen.add(key);

        const context = i > 0 ? parsed[i - 1].text : '';

        decisions.push({
          id: generateId(),
          text: text.length > 250 ? text.substring(0, 250) + '...' : text,
          context: context.length > 150 ? context.substring(0, 150) + '...' : context,
        });
        break;
      }
    }
  }

  return decisions.slice(0, 15);
}

function extractQuestions(parsed: { speaker: string; text: string }[]): Question[] {
  const questions: Question[] = [];
  const seen = new Set<string>();

  for (const { speaker, text } of parsed) {
    const hasQuestionMark = text.includes('?');
    const lower = text.toLowerCase();
    const hasIndicator = QUESTION_INDICATORS.some((q) => lower.startsWith(q) || lower.includes(q));

    if (hasQuestionMark || hasIndicator) {
      const key = text.substring(0, 50);
      if (seen.has(key)) continue;
      seen.add(key);

      questions.push({
        id: generateId(),
        text: text.length > 200 ? text.substring(0, 200) + '...' : text,
        raisedBy: speaker,
      });
    }
  }

  return questions.slice(0, 15);
}

function extractKeyPoints(parsed: { speaker: string; text: string }[]): KeyPoint[] {
  const sentences = parsed.map((p) => p.text);
  const wordFreq: Record<string, number> = {};
  const sentenceFreq: Record<number, number> = {};

  for (let i = 0; i < sentences.length; i++) {
    const words = sentences[i].toLowerCase().match(/\b\w+\b/g) || [];
    const significant = words.filter((w) => !STOP_WORDS.has(w) && w.length > 3);
    for (const word of significant) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
    sentenceFreq[i] = significant.length;
  }

  const scored = sentences.map((text, i) => {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    let score = 0;
    for (const word of words) {
      score += wordFreq[word] || 0;
    }
    score = score / Math.sqrt(words.length || 1);
    if (text.length > 20 && text.length < 300) score *= 1.2;
    return { text, score, index: i };
  });

  scored.sort((a, b) => b.score - a.score);

  const top = scored.slice(0, 10);
  top.sort((a, b) => a.index - b.index);

  return top.map((s) => {
    const category = categorizeSentence(s.text);
    return {
      id: generateId(),
      text: s.text,
      category,
    };
  });
}

function categorizeSentence(text: string): string {
  const lower = text.toLowerCase();
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return topic;
    }
  }
  return 'General';
}

function extractTopics(text: string): string[] {
  const lower = text.toLowerCase();
  const found = new Set<string>();
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        found.add(topic);
        break;
      }
    }
  }
  return Array.from(found);
}

function extractKeywords(text: string): string[] {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const freq: Record<string, number> = {};

  for (const word of words) {
    if (STOP_WORDS.has(word) || word.length < 4) continue;
    freq[word] = (freq[word] || 0) + 1;
  }

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word]) => word);
}

function calculateTalkRatios(parsed: { speaker: string; text: string }[]): TalkRatioEntry[] {
  const speakerWords: Record<string, number> = {};
  let totalWords = 0;

  for (const { speaker, text } of parsed) {
    const count = (text.match(/\b\w+\b/g) || []).length;
    speakerWords[speaker] = (speakerWords[speaker] || 0) + count;
    totalWords += count;
  }

  if (totalWords === 0) return [];

  return Object.entries(speakerWords)
    .map(([name, wordCount]) => ({
      name,
      wordCount,
      percentage: Math.round((wordCount / totalWords) * 1000) / 10,
    }))
    .sort((a, b) => b.wordCount - a.wordCount);
}

function generateSummary(
  keyPoints: KeyPoint[],
  actionItems: ActionItem[],
  decisions: Decision[],
  durationMinutes: number,
  participants: string[],
): string {
  const parts: string[] = [];

  parts.push(
    `This ${durationMinutes}-minute meeting involved ${participants.length} participant${participants.length !== 1 ? 's' : ''} (${participants.join(', ') || 'attendees'}).`,
  );

  if (decisions.length > 0) {
    parts.push(
      `Key decisions were made, including: ${decisions.slice(0, 3).map((d) => `"${d.text.substring(0, 80)}"`).join('; ')}.`,
    );
  }

  if (actionItems.length > 0) {
    const owners = new Set(actionItems.map((a) => a.owner));
    parts.push(
      `${actionItems.length} action item${actionItems.length !== 1 ? 's were' : ' was'} identified, assigned to ${owners.size} owner${owners.size !== 1 ? 's' : ''}.`,
    );
  }

  if (keyPoints.length > 0) {
    const categories = new Set(keyPoints.map((k) => k.category));
    parts.push(
      `Discussion covered ${categories.size} topic area${categories.size !== 1 ? 's' : ''}: ${Array.from(categories).join(', ')}.`,
    );
  }

  return parts.join(' ');
}

export function analyzeTranscript(
  transcript: string,
  durationMinutes: number,
  participants: string[],
): MeetingAnalysis {
  const parsed = parseTranscript(transcript);
  const fullText = parsed.map((p) => p.text).join(' ');

  const { sentiment, score } = analyzeSentiment(fullText);
  const actionItems = extractActionItems(parsed);
  const decisions = extractDecisions(parsed);
  const questions = extractQuestions(parsed);
  const keyPoints = extractKeyPoints(parsed);
  const topics = extractTopics(fullText);
  const keywords = extractKeywords(fullText);
  const talkRatios = calculateTalkRatios(parsed);
  const summary = generateSummary(keyPoints, actionItems, decisions, durationMinutes, participants);

  return {
    summary,
    keyPoints,
    actionItems,
    decisions,
    questions,
    topics,
    sentiment,
    sentimentScore: score,
    talkRatios,
    keywords,
  };
}

export function analyzeMeeting(
  transcript: string,
  durationMinutes: number,
  participants: string[],
): MeetingAnalysis {
  return analyzeTranscript(transcript, durationMinutes, participants);
}
