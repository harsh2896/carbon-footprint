export const fetchAISuggestions = async (data) => {
  return requestAI('/api/ai-suggestions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

const requestAI = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  let payload = {};

  try {
    payload = await response.json();
  } catch (error) {
    throw new Error('Invalid AI response from server.');
  }

  if (!response.ok) {
    throw new Error(payload?.error || 'Unable to fetch AI response.');
  }

  return payload;
};

export const askLearnQuestion = async (query) =>
  requestAI('/api/ask', {
    method: 'POST',
    body: JSON.stringify({ query }),
  });

export const summarizeLearnResponse = async (text) =>
  requestAI('/api/summarize', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });

export const fetchEnvironmentalFact = async () =>
  requestAI('/api/facts', {
    method: 'GET',
    headers: {},
  });
