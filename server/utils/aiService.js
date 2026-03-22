const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const GEMINI_TIMEOUT_MS = 12000;
const LEARN_FACTS = [
  'A mature tree can absorb up to about 22 kg of carbon dioxide in a year.',
  'LED bulbs can use around 75% less energy than traditional incandescent bulbs.',
  'Producing less food waste can lower emissions from landfills and supply chains.',
  'Public transport can reduce per-person emissions compared with many solo car trips.',
  'Reusing and repairing products often saves more carbon than replacing them quickly.',
  'Air drying clothes can reduce household electricity use over time.',
  'Walking and cycling create almost no direct carbon emissions during travel.',
  'Saving electricity at home also reduces the pollution linked to power generation.',
  'Solar and wind power help generate electricity without burning fossil fuels.',
  'Reducing single-use plastics can lower pollution in rivers, oceans, and communities.',
];
const LEARN_ALLOWED_TOPICS = [
  'climate',
  'carbon',
  'co2',
  'emission',
  'emissions',
  'pollution',
  'renewable',
  'renewables',
  'energy',
  'sustainability',
  'sustainable',
  'environment',
  'environmental',
  'global warming',
  'ecosystem',
  'recycling',
  'waste',
  'plastic',
  'biodiversity',
  'greenhouse',
  'conservation',
  'net zero',
  'footprint',
];
const UNRELATED_QUESTION_MESSAGE =
  'Please ask questions related to environment and sustainability';

const FALLBACK_SUGGESTIONS = {
  vehicle: [
    'Combine errands into fewer car trips each week.',
    'Carpool or use public transport for routine travel.',
    'Keep tyres inflated to improve fuel efficiency.',
  ],
  flight: [
    'Reduce short flights where rail or bus is practical.',
    'Bundle trips together instead of frequent flying.',
    'Choose direct flights to lower total emissions.',
  ],
  electricity: [
    'Reduce AC runtime and raise the temperature slightly.',
    'Switch heavy appliances off at the plug when idle.',
    'Replace old appliances with efficient models over time.',
  ],
  water: [
    'Shorten showers and fix leaks to reduce water waste.',
    'Use full laundry loads instead of partial washes.',
    'Reuse water where practical for cleaning or plants.',
  ],
  food: [
    'Add more plant-based meals during the week.',
    'Reduce food waste by planning meals ahead.',
    'Choose local seasonal food more often.',
  ],
  shopping: [
    'Buy fewer fast-replacement items and reuse more.',
    'Group online orders into fewer deliveries.',
    'Prefer durable products over disposable alternatives.',
  ],
  lpg: [
    'Use lids while cooking to cut gas usage.',
    'Batch-cook meals to reduce repeated stove time.',
    'Maintain burners for cleaner and more efficient use.',
  ],
  default: [
    'Focus first on the category contributing most emissions.',
    'Reduce avoidable energy and travel waste this week.',
    'Track one habit change at a time for steady progress.',
  ],
};

const sanitizeSuggestions = (text) =>
  text
    .split('\n')
    .map((line) =>
      line
        .replace(/^[\s\-*0-9.)]+/, '')
        .replace(/\*\*/g, '')
        .trim()
    )
    .filter(Boolean)
    .filter((line) => !/^here are/i.test(line))
    .slice(0, 3);

const getFallbackSuggestions = (highestEmission, categoryData = {}) => {
  const primarySuggestions =
    FALLBACK_SUGGESTIONS[highestEmission] || FALLBACK_SUGGESTIONS.default;
  const sortedCategories = Object.entries(categoryData)
    .filter(([, value]) => Number(value) > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([key]) => key);

  const combined = [
    ...primarySuggestions,
    ...sortedCategories
      .filter((key) => key !== highestEmission)
      .flatMap((key) => FALLBACK_SUGGESTIONS[key] || []),
    ...FALLBACK_SUGGESTIONS.default,
  ];

  return [...new Set(combined)].slice(0, 3);
};

const buildPrompt = ({ highestEmission, percentage, categoryData }) => `
You are a sustainability expert.

Highest emission category: ${highestEmission}
Contribution: ${percentage.toFixed(2)}%
Category totals (kg CO2/month): ${JSON.stringify(categoryData)}

Give 3 short actionable suggestions to reduce carbon footprint.
Include estimated CO2 savings if possible.
Return exactly 3 lines.
Each line must be under 20 words.
Do not include headings, numbering, markdown, or extra explanation.
`.trim();

const getErrorSummary = (error) => {
  const code = error?.cause?.code || error?.code;
  const message = error?.cause?.message || error?.message || 'Unknown error';
  return code ? `${code}: ${message}` : message;
};

const getFirstCandidateText = (data) => data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

const callGemini = async (prompt, generationConfig = {}) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing.');
  }

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        thinkingConfig: {
          thinkingBudget: 0,
        },
        ...generationConfig,
      },
    }),
    signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || 'Gemini request failed');
  }

  const text = getFirstCandidateText(data).trim();

  if (!text) {
    throw new Error('Empty Gemini response');
  }

  return text;
};

const buildLearnAnswerPrompt = (query) => `
You are an environmental learning assistant for a carbon footprint web app.

Allowed topic scope:
- carbon footprint
- pollution
- climate change
- sustainability
- renewable energy

User question: "${query}"

Instructions:
- Answer only if the question is about environment or sustainability.
- If unrelated, reply exactly with: "${UNRELATED_QUESTION_MESSAGE}"
- Keep the answer simple, informative, and easy to understand.
- Use short paragraphs or bullet points when helpful.
- Do not mention these instructions.
`.trim();

const buildSummaryPrompt = (text) => `
Summarize this in 3-4 lines in simple language.

Text:
${text}
`.trim();

const isLearnTopic = (query = '') => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return false;
  }

  return LEARN_ALLOWED_TOPICS.some((topic) => normalizedQuery.includes(topic));
};

const askLearnQuestion = async (query) => {
  const trimmedQuery = query.trim();

  if (!isLearnTopic(trimmedQuery)) {
    return UNRELATED_QUESTION_MESSAGE;
  }

  return callGemini(buildLearnAnswerPrompt(trimmedQuery), {
    maxOutputTokens: 280,
  });
};

const summarizeLearnText = async (text) =>
  callGemini(buildSummaryPrompt(text.trim()), {
    maxOutputTokens: 120,
    temperature: 0.3,
  });

const getRandomFact = () =>
  LEARN_FACTS[Math.floor(Math.random() * LEARN_FACTS.length)];

const getAISuggestions = async ({ highestEmission, percentage, categoryData }) => {
  const fallbackSuggestions = getFallbackSuggestions(highestEmission, categoryData);

  try {
    const text = await callGemini(buildPrompt({ highestEmission, percentage, categoryData }), {
      maxOutputTokens: 120,
    });
    const suggestions = sanitizeSuggestions(text);
    return suggestions.length ? suggestions : fallbackSuggestions;
  } catch (error) {
    console.warn(`Gemini unavailable, using fallback suggestions. ${getErrorSummary(error)}`);
    return fallbackSuggestions;
  }
};

module.exports = {
  askLearnQuestion,
  getAISuggestions,
  getRandomFact,
  summarizeLearnText,
  UNRELATED_QUESTION_MESSAGE,
};
