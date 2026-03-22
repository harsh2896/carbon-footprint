const { fetchNews, getFallbackArticles } = require('../utils/newsService');

const getNews = async (req, res) => {
  const category = String(req.query.category || 'all').toLowerCase();

  try {
    const payload = await fetchNews(category);
    console.log('Normalized news payload:', {
      category: payload.category,
      status: 'ok',
      articleCount: payload.articles.length,
    });
    return res.json(payload);
  } catch (error) {
    console.error('News fetch failed:', error.message || error);
    const fallbackArticles = getFallbackArticles(category);

    return res.json({
      category,
      articles: fallbackArticles,
      featured: fallbackArticles.slice(0, 4),
      fallback: true,
      error: 'Unable to load news. Please try again later.',
    });
  }
};

module.exports = { getNews };
