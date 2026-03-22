const {
  askLearnQuestion,
  getAISuggestions,
  getRandomFact,
  summarizeLearnText,
} = require('../utils/aiService');

const generateAISuggestions = async (req, res) => {
  try {
    const rawData = req.body || {};
    const categoryData = Object.entries(rawData).reduce((accumulator, [key, value]) => {
      const normalizedValue = Number(value) || 0;
      if (normalizedValue > 0) {
        accumulator[key] = normalizedValue;
      }
      return accumulator;
    }, {});

    const entries = Object.entries(categoryData);

    if (!entries.length) {
      return res.status(400).json({ error: 'Valid footprint category data is required.' });
    }

    const total = entries.reduce((sum, [, value]) => sum + value, 0);

    if (!total) {
      return res.status(400).json({ error: 'Total emissions must be greater than zero.' });
    }

    const [highestCategory] = entries.reduce((highest, current) =>
      current[1] > highest[1] ? current : highest
    );

    const percentage = (categoryData[highestCategory] / total) * 100;

    const aiSuggestions = await getAISuggestions({
      highestEmission: highestCategory,
      percentage,
      categoryData,
    });

    return res.json({
      highestCategory,
      percentage: Number(percentage.toFixed(2)),
      aiSuggestions,
    });
  } catch (error) {
    console.error('AI processing failed:', error.message || error);
    return res.status(500).json({ error: 'AI processing failed' });
  }
};

const askLearn = async (req, res) => {
  try {
    const query = req.body?.query?.trim();

    if (!query) {
      return res.status(400).json({ error: 'A question is required.' });
    }

    const answer = await askLearnQuestion(query);
    return res.json({ answer });
  } catch (error) {
    console.error('Learn question failed:', error.message || error);
    return res.status(500).json({ error: 'Unable to fetch response. Try again.' });
  }
};

const summarizeLearnResponse = async (req, res) => {
  try {
    const text = req.body?.text?.trim();

    if (!text) {
      return res.status(400).json({ error: 'Response text is required.' });
    }

    const summary = await summarizeLearnText(text);
    return res.json({ summary });
  } catch (error) {
    console.error('Learn summary failed:', error.message || error);
    return res.status(500).json({ error: 'Unable to fetch response. Try again.' });
  }
};

const getFact = (req, res) => res.json({ fact: getRandomFact() });

module.exports = {
  askLearn,
  generateAISuggestions,
  getFact,
  summarizeLearnResponse,
};
