import React, { useEffect, useMemo, useRef, useState } from 'react';
import { fetchNewsByCategory } from '../utils/newsClient';

const FILTERS = [
  { label: 'Climate', value: 'climate' },
  { label: 'Pollution', value: 'pollution' },
  { label: 'Energy', value: 'energy' },
];
const INITIAL_ARTICLE_COUNT = 6;
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;
const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675"><rect width="1200" height="675" fill="%23e8f6ea"/><circle cx="970" cy="110" r="70" fill="%23c9e9d0"/><rect x="76" y="122" width="472" height="44" rx="12" fill="%23143a2b" opacity="0.9"/><rect x="76" y="188" width="620" height="24" rx="12" fill="%234c6a59" opacity="0.7"/><rect x="76" y="228" width="560" height="24" rx="12" fill="%234c6a59" opacity="0.55"/><rect x="76" y="424" width="214" height="56" rx="18" fill="%232c8d56"/><path d="M782 462c0-78 63-141 141-141 58 0 108 35 130 84 6 14-4 29-20 29H927c-17 0-26 20-15 33l71 81c10 11 5 29-10 34-16 5-33 8-51 8-78 0-140-63-140-140Z" fill="%23288a55"/><path d="M204 584c77-27 145-92 182-174 39 50 53 108 39 168-4 18-20 31-38 31H226c-24 0-33-17-22-25Z" fill="%2397d3a7"/></svg>';
const FRONTEND_FALLBACK_NEWS = {
  climate: [
    { id: 'frontend-climate-1', title: 'Climate adaptation plans keep growing in major cities', description: 'Local climate strategies are increasingly focused on heat resilience, cleaner energy, and public health.', imageUrl: '', sourceName: 'Fallback Climate Brief', publishedAt: '2026-03-18T09:00:00Z', url: 'https://newsapi.org' },
    { id: 'frontend-climate-2', title: 'Communities test practical ways to reduce emissions', description: 'Recent sustainability coverage continues to spotlight realistic actions with measurable impact.', imageUrl: '', sourceName: 'Fallback Environment Desk', publishedAt: '2026-03-17T12:00:00Z', url: 'https://newsapi.org' },
    { id: 'frontend-climate-3', title: 'Researchers call for faster resilience investment', description: 'Adaptation, early warning systems, and stronger planning remain central topics in climate reporting.', sourceName: 'Fallback Green Report', imageUrl: '', publishedAt: '2026-03-16T08:20:00Z', url: 'https://newsapi.org' },
    { id: 'frontend-climate-4', title: 'Climate education stories remain a major news theme', description: 'Simple public-facing climate explainers continue to draw interest across media outlets.', sourceName: 'Fallback Eco Wire', imageUrl: '', publishedAt: '2026-03-15T10:10:00Z', url: 'https://newsapi.org' },
  ],
  pollution: [
    { id: 'frontend-pollution-1', title: 'Air pollution response plans emphasize cleaner mobility', description: 'Cities are continuing to connect pollution alerts with cleaner transport and monitoring efforts.', imageUrl: '', sourceName: 'Fallback Pollution Watch', publishedAt: '2026-03-18T07:15:00Z', url: 'https://newsapi.org' },
    { id: 'frontend-pollution-2', title: 'Plastic waste reduction remains a policy priority', description: 'Recycling systems, packaging cuts, and local cleanup efforts are still common themes in reporting.', imageUrl: '', sourceName: 'Fallback Waste Monitor', publishedAt: '2026-03-17T13:40:00Z', url: 'https://newsapi.org' },
    { id: 'frontend-pollution-3', title: 'Water quality monitoring expands in more communities', description: 'Improved water testing and public alerts are helping communities respond faster to pollution risks.', imageUrl: '', sourceName: 'Fallback Blue Planet News', publishedAt: '2026-03-16T09:35:00Z', url: 'https://newsapi.org' },
    { id: 'frontend-pollution-4', title: 'Local cleanup campaigns continue to build awareness', description: 'Public participation campaigns remain one of the easiest ways to keep pollution visible and actionable.', imageUrl: '', sourceName: 'Fallback Civic Green', publishedAt: '2026-03-15T17:25:00Z', url: 'https://newsapi.org' },
  ],
  energy: [
    { id: 'frontend-energy-1', title: 'Clean energy investment stories remain in focus', description: 'Coverage continues to highlight solar, wind, storage, and grid modernization as key transition themes.', imageUrl: '', sourceName: 'Fallback Energy Update', publishedAt: '2026-03-18T11:05:00Z', url: 'https://newsapi.org' },
    { id: 'frontend-energy-2', title: 'Efficiency upgrades are still seen as fast climate wins', description: 'Energy efficiency in buildings and appliances keeps appearing as a practical path to lower emissions.', imageUrl: '', sourceName: 'Fallback Net Zero File', publishedAt: '2026-03-17T08:50:00Z', url: 'https://newsapi.org' },
    { id: 'frontend-energy-3', title: 'Battery storage stays central in renewable power coverage', description: 'Storage systems are increasingly discussed alongside reliability and long-term clean energy planning.', imageUrl: '', sourceName: 'Fallback Power Journal', publishedAt: '2026-03-16T15:30:00Z', url: 'https://newsapi.org' },
    { id: 'frontend-energy-4', title: 'Businesses pursue cleaner operations through energy strategy', description: 'Operational efficiency and renewable procurement continue to shape sustainability reporting.', imageUrl: '', sourceName: 'Fallback Sustainable Business', publishedAt: '2026-03-15T07:10:00Z', url: 'https://newsapi.org' },
  ],
};

const getFrontendFallbackNews = (category) => FRONTEND_FALLBACK_NEWS[category] || FRONTEND_FALLBACK_NEWS.climate;

const formatPublishedDate = (value) => {
  if (!value) return 'Recent';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recent';
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
};

const surfaceClasses =
  'rounded-[26px] border border-[color:color-mix(in_srgb,var(--border-color)_72%,rgba(26,93,62,0.12))] bg-[color:color-mix(in_srgb,var(--card-color)_94%,transparent)] shadow-[0_18px_40px_rgba(20,58,43,0.08)]';

const News = () => {
  const [activeFilter, setActiveFilter] = useState('climate');
  const [articles, setArticles] = useState([]);
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [visibleCount, setVisibleCount] = useState(INITIAL_ARTICLE_COUNT);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const inFlightFilterRef = useRef('');

  const loadNews = async (category, signal) => {
    if (inFlightFilterRef.current === category) return;
    inFlightFilterRef.current = category;
    setIsLoading(true);
    setError('');
    try {
      const payload = await fetchNewsByCategory(category, signal);
      setArticles(payload.articles || []);
      setFeaturedArticles(payload.featured || []);
      setVisibleCount(INITIAL_ARTICLE_COUNT);
    } catch (fetchError) {
      if (fetchError.name !== 'AbortError') {
        const fallbackArticles = getFrontendFallbackNews(category);
        setArticles(fallbackArticles);
        setFeaturedArticles(fallbackArticles.slice(0, 4));
        setVisibleCount(INITIAL_ARTICLE_COUNT);
        setError('');
      }
    } finally {
      inFlightFilterRef.current = '';
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadNews(activeFilter, controller.signal);
    const intervalId = window.setInterval(() => {
      loadNews(activeFilter, controller.signal);
    }, REFRESH_INTERVAL_MS);
    return () => {
      controller.abort();
      window.clearInterval(intervalId);
    };
  }, [activeFilter]);

  const visibleArticles = useMemo(() => articles.slice(0, visibleCount), [articles, visibleCount]);
  const canLoadMore = visibleCount < articles.length;

  return (
    <main className="min-h-[calc(100vh-70px)] bg-[radial-gradient(circle_at_top_right,rgba(136,213,157,0.24),transparent_26%),radial-gradient(circle_at_top_left,rgba(37,111,74,0.12),transparent_28%),linear-gradient(180deg,color-mix(in_srgb,var(--bg-color)_82%,#dcfce7)_0%,color-mix(in_srgb,var(--bg-color)_92%,var(--card-color))_46%,var(--bg-color)_100%)] px-[18px] pb-[60px] pt-7 text-[var(--text-color)] max-md:px-[14px] max-md:pb-12 max-md:pt-5">
      <section className="mx-auto grid max-w-[1180px] gap-[26px]">
        <div className="rounded-[26px] bg-[linear-gradient(135deg,#12372a_0%,#1f6a4d_58%,#6dbb7d_100%)] p-[34px] text-white shadow-[0_18px_40px_rgba(20,58,43,0.08)] max-md:rounded-[22px] max-md:p-5">
          <span className="inline-flex rounded-full bg-white/15 px-[14px] py-2 text-[0.82rem] font-extrabold uppercase tracking-[0.04em]">Latest Updates</span>
          <h1 className="my-4 text-[clamp(2rem,4vw,3rem)] leading-[1.1]">Climate and sustainability news</h1>
          <p className="max-w-[720px] text-white/90">Track recent coverage on climate, pollution, and energy with a clean eco-themed reading experience.</p>
        </div>

        <section className={`${surfaceClasses} p-7 max-md:rounded-[22px] max-md:p-5`}>
          <div className="mb-5">
            <h2 className="mb-1.5 text-2xl">Top Climate Headlines</h2>
            <p className="text-[var(--text-muted)]">Featured stories from the latest news feed.</p>
          </div>
          {error ? (
            <div className="rounded-[20px] border border-[color:color-mix(in_srgb,var(--border-color)_72%,rgba(23,68,47,0.1))] bg-[color:color-mix(in_srgb,var(--card-color)_84%,#dcfce7)] p-[22px] text-center font-semibold text-[var(--text-color)]">{error}</div>
          ) : (
            <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2">
              {(isLoading ? Array.from({ length: 4 }) : featuredArticles).map((article, index) =>
                isLoading ? (
                  <div className="overflow-hidden rounded-[22px] border border-[color:color-mix(in_srgb,var(--border-color)_72%,rgba(22,66,46,0.1))] bg-[var(--card-color)] shadow-[0_16px_30px_rgba(20,58,43,0.08)] animate-pulse" key={`featured-${index}`}>
                    <div className="h-[210px] bg-[linear-gradient(90deg,color-mix(in_srgb,var(--card-color)_76%,#dcfce7),color-mix(in_srgb,var(--bg-color)_90%,var(--card-color)),color-mix(in_srgb,var(--card-color)_76%,#dcfce7))]"></div>
                    <div className="mx-[18px] mt-[14px] h-[14px] w-[78%] rounded-full bg-[linear-gradient(90deg,color-mix(in_srgb,var(--card-color)_76%,#dcfce7),color-mix(in_srgb,var(--bg-color)_90%,var(--card-color)),color-mix(in_srgb,var(--card-color)_76%,#dcfce7))]"></div>
                    <div className="mx-[18px] mb-[18px] mt-[14px] h-[14px] rounded-full bg-[linear-gradient(90deg,color-mix(in_srgb,var(--card-color)_76%,#dcfce7),color-mix(in_srgb,var(--bg-color)_90%,var(--card-color)),color-mix(in_srgb,var(--card-color)_76%,#dcfce7))]"></div>
                  </div>
                ) : (
                  <article className="overflow-hidden rounded-[22px] border border-[color:color-mix(in_srgb,var(--border-color)_72%,rgba(22,66,46,0.1))] bg-[var(--card-color)] shadow-[0_16px_30px_rgba(20,58,43,0.08)] transition duration-200 hover:-translate-y-1.5 hover:shadow-[0_24px_42px_rgba(20,58,43,0.14)]" key={article.id}>
                    <img src={article.imageUrl || PLACEHOLDER_IMAGE} alt={article.title} className="block h-60 w-full object-cover bg-[color:color-mix(in_srgb,var(--bg-color)_78%,#dcfce7)]" loading="lazy" onError={(event) => { event.currentTarget.src = PLACEHOLDER_IMAGE; }} />
                    <div className="p-[18px]">
                      <span className="flex flex-wrap gap-2.5 text-[0.88rem] font-bold text-[var(--text-muted)]">{article.sourceName}</span>
                      <h3 className="my-2.5 leading-[1.4]">{article.title}</h3>
                      <a href={article.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-w-[116px] items-center justify-center rounded-[14px] bg-[#0f5a3a] px-4 py-[11px] font-bold text-white no-underline transition duration-200 hover:-translate-y-px">Read More</a>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>

        <section className={`${surfaceClasses} p-7 max-md:rounded-[22px] max-md:p-5`}>
          <div className="mb-5">
            <h2 className="mb-1.5 text-2xl">Browse by Category</h2>
            <p className="text-[var(--text-muted)]">Switch topics to refresh the article feed.</p>
          </div>
          <div className="mb-[22px] flex flex-wrap gap-3" aria-label="News category filters">
            {FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={`rounded-full px-4 py-[11px] font-bold transition duration-200 hover:-translate-y-px ${
                  activeFilter === filter.value
                    ? 'bg-[linear-gradient(180deg,#2b9b57_0%,#1f7c45_100%)] text-white shadow-[0_14px_24px_rgba(31,124,69,0.18)]'
                    : 'bg-[color:color-mix(in_srgb,var(--card-color)_72%,#dcfce7)] text-[var(--text-color)] shadow-[inset_0_0_0_1px_rgba(23,68,47,0.08)]'
                } ${isLoading && inFlightFilterRef.current === filter.value ? 'cursor-wait opacity-70' : ''}`}
                onClick={() => setActiveFilter(filter.value)}
                disabled={isLoading && inFlightFilterRef.current === filter.value}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {error ? (
            <div className="rounded-[20px] border border-[color:color-mix(in_srgb,var(--border-color)_72%,rgba(23,68,47,0.1))] bg-[color:color-mix(in_srgb,var(--card-color)_84%,#dcfce7)] p-[22px] text-center font-semibold text-[var(--text-color)]">{error}</div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2 xl:grid-cols-3">
                {(isLoading ? Array.from({ length: INITIAL_ARTICLE_COUNT }) : visibleArticles).map((article, index) =>
                  isLoading ? (
                    <div className="overflow-hidden rounded-[22px] border border-[color:color-mix(in_srgb,var(--border-color)_72%,rgba(22,66,46,0.1))] bg-[var(--card-color)] shadow-[0_16px_30px_rgba(20,58,43,0.08)] animate-pulse" key={`article-${index}`}>
                      <div className="h-[210px] bg-[linear-gradient(90deg,color-mix(in_srgb,var(--card-color)_76%,#dcfce7),color-mix(in_srgb,var(--bg-color)_90%,var(--card-color)),color-mix(in_srgb,var(--card-color)_76%,#dcfce7))]"></div>
                      <div className="p-[18px]">
                        <div className="h-[14px] rounded-full bg-[linear-gradient(90deg,color-mix(in_srgb,var(--card-color)_76%,#dcfce7),color-mix(in_srgb,var(--bg-color)_90%,var(--card-color)),color-mix(in_srgb,var(--card-color)_76%,#dcfce7))]"></div>
                        <div className="mt-[14px] h-[14px] w-[78%] rounded-full bg-[linear-gradient(90deg,color-mix(in_srgb,var(--card-color)_76%,#dcfce7),color-mix(in_srgb,var(--bg-color)_90%,var(--card-color)),color-mix(in_srgb,var(--card-color)_76%,#dcfce7))]"></div>
                        <div className="mt-[14px] h-[14px] rounded-full bg-[linear-gradient(90deg,color-mix(in_srgb,var(--card-color)_76%,#dcfce7),color-mix(in_srgb,var(--bg-color)_90%,var(--card-color)),color-mix(in_srgb,var(--card-color)_76%,#dcfce7))]"></div>
                        <div className="mt-[14px] h-[14px] w-[42%] rounded-full bg-[linear-gradient(90deg,color-mix(in_srgb,var(--card-color)_76%,#dcfce7),color-mix(in_srgb,var(--bg-color)_90%,var(--card-color)),color-mix(in_srgb,var(--card-color)_76%,#dcfce7))]"></div>
                      </div>
                    </div>
                  ) : (
                    <article className="overflow-hidden rounded-[22px] border border-[color:color-mix(in_srgb,var(--border-color)_72%,rgba(22,66,46,0.1))] bg-[var(--card-color)] shadow-[0_16px_30px_rgba(20,58,43,0.08)] transition duration-200 hover:-translate-y-1.5 hover:shadow-[0_24px_42px_rgba(20,58,43,0.14)]" key={article.id}>
                      <img src={article.imageUrl || PLACEHOLDER_IMAGE} alt={article.title} className="block h-[190px] w-full object-cover bg-[color:color-mix(in_srgb,var(--bg-color)_78%,#dcfce7)]" loading="lazy" onError={(event) => { event.currentTarget.src = PLACEHOLDER_IMAGE; }} />
                      <div className="p-[18px]">
                        <div className="flex flex-wrap gap-2.5 text-[0.88rem] font-bold text-[var(--text-muted)]">
                          <span>{article.sourceName}</span>
                          <span>{formatPublishedDate(article.publishedAt)}</span>
                        </div>
                        <h3 className="my-2.5 leading-[1.4]">{article.title}</h3>
                        <p className="mb-4 text-[var(--text-muted)]">{article.description}</p>
                        <a href={article.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-w-[116px] items-center justify-center rounded-[14px] bg-[#0f5a3a] px-4 py-[11px] font-bold text-white no-underline transition duration-200 hover:-translate-y-px">Read More</a>
                      </div>
                    </article>
                  )
                )}
              </div>
              {!isLoading && !visibleArticles.length ? (
                <div className="mt-5 rounded-[20px] border border-[color:color-mix(in_srgb,var(--border-color)_72%,rgba(23,68,47,0.1))] bg-[color:color-mix(in_srgb,var(--card-color)_84%,#dcfce7)] p-[22px] text-center font-semibold text-[var(--text-color)]">No articles are available right now.</div>
              ) : null}
              {!isLoading && canLoadMore ? (
                <div className="mt-[26px] flex justify-center">
                  <button type="button" className="rounded-full bg-[#12372a] px-4 py-[11px] font-bold text-white shadow-[0_14px_24px_rgba(18,55,42,0.16)] transition duration-200 hover:-translate-y-px" onClick={() => setVisibleCount((currentCount) => currentCount + INITIAL_ARTICLE_COUNT)}>Load More</button>
                </div>
              ) : null}
            </>
          )}
        </section>
      </section>
    </main>
  );
};

export default News;
