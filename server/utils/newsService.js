const NEWS_API_BASE_URL = 'https://newsapi.org/v2/everything';
const DEFAULT_QUERY = 'climate OR pollution OR energy';
const NEWS_TIMEOUT_MS = 12000;
const API_KEY = process.env.NEWS_API_KEY;

if (!API_KEY) {
  throw new Error('NEWS_API_KEY is missing. Set it in environment variables.');
}

const CATEGORY_QUERY_MAP = {
  climate: 'climate',
  pollution: 'pollution',
  energy: 'energy',
};

const FALLBACK_ARTICLES = {
  climate: [
    {
      id: 'fallback-climate-1',
      title: 'Cities expand clean cooling plans as heat risks increase',
      description:
        'Urban climate planning is increasingly focused on efficient cooling, tree cover, and cleaner energy systems.',
      imageUrl: '',
      sourceName: 'Sample Climate Brief',
      publishedAt: '2026-03-18T09:00:00Z',
      url: 'https://newsapi.org',
    },
    {
      id: 'fallback-climate-2',
      title: 'Researchers highlight faster adaptation for vulnerable communities',
      description:
        'Recent reporting continues to emphasize local adaptation, resilience planning, and climate-risk awareness.',
      imageUrl: '',
      sourceName: 'Sample Climate Desk',
      publishedAt: '2026-03-17T11:30:00Z',
      url: 'https://newsapi.org',
    },
    {
      id: 'fallback-climate-3',
      title: 'Climate policy debates center on practical emissions cuts',
      description:
        'Governments and businesses are discussing realistic near-term actions to reduce emissions across sectors.',
      imageUrl: '',
      sourceName: 'Sample Environment Wire',
      publishedAt: '2026-03-16T14:15:00Z',
      url: 'https://newsapi.org',
    },
    {
      id: 'fallback-climate-4',
      title: 'Community-led resilience projects gain attention worldwide',
      description:
        'Smaller local projects are being showcased as effective models for climate resilience and public engagement.',
      imageUrl: '',
      sourceName: 'Sample Sustainability Report',
      publishedAt: '2026-03-15T08:10:00Z',
      url: 'https://newsapi.org',
    },
  ],
  pollution: [
    {
      id: 'fallback-pollution-1',
      title: 'Air quality alerts renew focus on cleaner transport choices',
      description:
        'Cities facing pollution spikes are highlighting public transport, cleaner fuels, and emissions monitoring.',
      imageUrl: '',
      sourceName: 'Sample Pollution Watch',
      publishedAt: '2026-03-18T07:45:00Z',
      url: 'https://newsapi.org',
    },
    {
      id: 'fallback-pollution-2',
      title: 'Plastic waste reduction remains a major policy priority',
      description:
        'New coverage shows growing pressure on packaging, recycling systems, and waste reduction targets.',
      imageUrl: '',
      sourceName: 'Sample Green Bulletin',
      publishedAt: '2026-03-17T13:20:00Z',
      url: 'https://newsapi.org',
    },
    {
      id: 'fallback-pollution-3',
      title: 'Water pollution monitoring tools become more accessible',
      description:
        'Communities are adopting better tracking and reporting tools to identify and respond to water pollution.',
      imageUrl: '',
      sourceName: 'Sample Eco Monitor',
      publishedAt: '2026-03-16T10:05:00Z',
      url: 'https://newsapi.org',
    },
    {
      id: 'fallback-pollution-4',
      title: 'Local clean-up campaigns show measurable awareness gains',
      description:
        'Grassroots programs continue to improve public awareness around litter, waste, and neighborhood pollution.',
      imageUrl: '',
      sourceName: 'Sample Civic Climate',
      publishedAt: '2026-03-15T16:40:00Z',
      url: 'https://newsapi.org',
    },
  ],
  energy: [
    {
      id: 'fallback-energy-1',
      title: 'Renewable energy projects continue to scale across regions',
      description:
        'Solar, wind, and grid modernization remain at the center of current clean-energy reporting.',
      imageUrl: '',
      sourceName: 'Sample Energy Update',
      publishedAt: '2026-03-18T12:00:00Z',
      url: 'https://newsapi.org',
    },
    {
      id: 'fallback-energy-2',
      title: 'Energy efficiency seen as a fast route to lower emissions',
      description:
        'Experts continue to highlight efficient buildings and appliances as practical climate solutions.',
      imageUrl: '',
      sourceName: 'Sample Net Zero News',
      publishedAt: '2026-03-17T09:50:00Z',
      url: 'https://newsapi.org',
    },
    {
      id: 'fallback-energy-3',
      title: 'Battery storage becomes more visible in clean power planning',
      description:
        'Storage and grid flexibility are increasingly featured in discussions around reliable renewable power.',
      imageUrl: '',
      sourceName: 'Sample Power Journal',
      publishedAt: '2026-03-16T18:25:00Z',
      url: 'https://newsapi.org',
    },
    {
      id: 'fallback-energy-4',
      title: 'Businesses target cleaner operations through energy upgrades',
      description:
        'Operational efficiency and renewable procurement remain common themes in sustainability coverage.',
      imageUrl: '',
      sourceName: 'Sample Sustainable Business',
      publishedAt: '2026-03-15T06:35:00Z',
      url: 'https://newsapi.org',
    },
  ],
};

const buildNewsUrl = (category = 'all') => {
  const query = CATEGORY_QUERY_MAP[category] || DEFAULT_QUERY;
  const url = new URL(NEWS_API_BASE_URL);

  url.searchParams.set('q', query);
  url.searchParams.set('language', 'en');
  url.searchParams.set('sortBy', 'publishedAt');
  url.searchParams.set('pageSize', '18');
  url.searchParams.set('apiKey', API_KEY);

  return url.toString();
};

const normalizeArticle = (article, index) => ({
  id: article.url || `article-${index}`,
  title: article.title || 'Untitled article',
  description: article.description || 'No description available.',
  imageUrl: article.urlToImage || '',
  sourceName: article.source?.name || 'Unknown source',
  publishedAt: article.publishedAt || '',
  url: article.url || '#',
});

const getFallbackArticles = (category = 'all') => {
  if (CATEGORY_QUERY_MAP[category]) {
    return FALLBACK_ARTICLES[category];
  }

  return [
    ...FALLBACK_ARTICLES.climate.slice(0, 2),
    ...FALLBACK_ARTICLES.pollution.slice(0, 1),
    ...FALLBACK_ARTICLES.energy.slice(0, 1),
  ];
};

const fetchNews = async (category = 'all') => {
  const response = await fetch(buildNewsUrl(category), {
    method: 'GET',
    signal: AbortSignal.timeout(NEWS_TIMEOUT_MS),
  });

  const data = await response.json();

  if (!response.ok || data?.status !== 'ok') {
    throw new Error(data?.message || 'Unable to fetch news.');
  }

  const articles = Array.isArray(data.articles)
    ? data.articles
        .filter((article) => article?.title && article?.url)
        .map(normalizeArticle)
    : [];

  return {
    category,
    articles,
    featured: articles.slice(0, 4),
  };
};

module.exports = { fetchNews, getFallbackArticles };
