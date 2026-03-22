import React, { useEffect, useRef, useState } from 'react';
import {
  askLearnQuestion,
  fetchEnvironmentalFact,
  summarizeLearnResponse,
} from '../utils/aiClient';

const TOPIC_BUTTONS = [
  { label: 'Climate Change', prompt: 'What is climate change and its impact?' },
  { label: 'Pollution', prompt: 'What are types of pollution and how to reduce them?' },
  { label: 'Renewable Energy', prompt: 'What is renewable energy and its benefits?' },
];

const VIDEO_FILTERS = ['All', 'Carbon Footprint', 'Pollution', 'Nature'];
const INITIAL_VIDEO_COUNT = 6;
const YOUTUBE_THUMBNAIL_HOST = 'https://img.youtube.com/vi';

const VIDEO_DATA = [
  { category: 'Climate Change', url: 'https://www.youtube.com/watch?v=G9t__9Tmwv4', title: 'Climate Change Basics' },
  { category: 'Climate Change', url: 'https://www.youtube.com/watch?v=EuwMB1Dal-4', title: 'Climate Change Explained' },
  { category: 'Climate Change', url: 'https://www.youtube.com/watch?v=DYHAZaasdxI', title: 'Impacts of Climate Change' },
  { category: 'Pollution', url: 'https://www.youtube.com/watch?v=ocqu-QD4jGc', title: 'Understanding Pollution' },
  { category: 'Pollution', url: 'https://www.youtube.com/watch?v=8q7_aV8eLUE', title: 'How Pollution Affects Daily Life' },
  { category: 'Pollution', url: 'https://www.youtube.com/watch?v=yBkRZFp75ZY', title: 'Ways to Reduce Pollution' },
  { category: 'Nature', url: 'https://www.youtube.com/watch?v=7GEwY14pFfA', title: 'Protecting Nature' },
  { category: 'Nature', url: 'https://www.youtube.com/watch?v=G9t__9Tmwv4', title: 'Nature and Climate' },
  { category: 'Nature', url: 'https://www.youtube.com/watch?v=EuwMB1Dal-4', title: 'Nature in a Changing World' },
  { category: 'Carbon Footprint', url: 'https://www.youtube.com/watch?v=a9yO-K8mwL0', title: 'Carbon Footprint Explained' },
  { category: 'Carbon Footprint', url: 'https://www.youtube.com/watch?v=8q7_aV8eLUE', title: 'Reducing Your Carbon Footprint' },
  { category: 'Advanced', url: 'https://www.youtube.com/watch?v=SDRxfuEvqGg', title: 'Advanced Sustainability Concepts' },
  { category: 'Advanced', url: 'https://www.youtube.com/watch?v=7SkrXzysw5c', title: 'Deep Dive into Climate Science' },
  { category: 'Advanced', url: 'https://www.youtube.com/watch?v=SLEenW2UiUw', title: 'Advanced Environmental Systems' },
  { category: 'Advanced', url: 'https://www.youtube.com/watch?v=Dv2mbh_BUCU', title: 'Advanced Carbon Solutions' },
  { category: 'Short Awareness', url: 'https://www.youtube.com/watch?v=cZ_rru339-s', title: 'Short Awareness Clip 1' },
  { category: 'Short Awareness', url: 'https://www.youtube.com/watch?v=x8cmi7f', title: 'Short Awareness Clip 2' },
  { category: 'Short Awareness', url: 'https://www.youtube.com/watch?v=709387', title: 'Short Awareness Clip 3' },
  { category: 'Documentary', url: 'https://www.youtube.com/watch?v=Zk11vI-7czE', title: 'Environmental Documentary 1' },
  { category: 'Documentary', url: 'https://www.youtube.com/watch?v=EtW2rrLHs08', title: 'Environmental Documentary 2' },
];

const getVideoId = (url) => {
  try {
    return new URL(url).searchParams.get('v') || '';
  } catch (error) {
    return '';
  }
};

const buildThumbnailUrl = (url) => {
  const videoId = getVideoId(url);
  return videoId ? `${YOUTUBE_THUMBNAIL_HOST}/${videoId}/hqdefault.jpg` : '';
};

const createMessage = (role, text) => ({
  id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  role,
  text,
  summary: '',
  isSummarizing: false,
});

const surfaceCardClasses =
  'rounded-[26px] border border-[color:color-mix(in_srgb,var(--border-color)_70%,rgba(29,102,72,0.12))] bg-[color:color-mix(in_srgb,var(--card-color)_94%,transparent)] shadow-[0_18px_45px_rgba(30,72,48,0.08)]';

const Learn = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    createMessage('assistant', 'Ask about climate change, pollution, renewable energy, carbon footprint, or sustainability.'),
  ]);
  const [isAsking, setIsAsking] = useState(false);
  const [fact, setFact] = useState('');
  const [isFactLoading, setIsFactLoading] = useState(true);
  const [activeVideoFilter, setActiveVideoFilter] = useState('All');
  const [showAllVideos, setShowAllVideos] = useState(false);
  const inFlightQueryRef = useRef('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetchInitialFact = async () => {
      try {
        const payload = await fetchEnvironmentalFact();
        setFact(payload.fact);
      } catch (error) {
        setFact('Unable to fetch response. Try again.');
      } finally {
        setIsFactLoading(false);
      }
    };

    fetchInitialFact();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isAsking]);

  const filteredVideos =
    activeVideoFilter === 'All'
      ? VIDEO_DATA
      : VIDEO_DATA.filter((video) => video.category === activeVideoFilter);

  const visibleVideos = showAllVideos
    ? filteredVideos
    : filteredVideos.slice(0, INITIAL_VIDEO_COUNT);
  const canToggleVideoCount = filteredVideos.length > INITIAL_VIDEO_COUNT;

  const loadFact = async () => {
    if (isFactLoading && fact) return;
    setIsFactLoading(true);
    try {
      const payload = await fetchEnvironmentalFact();
      setFact(payload.fact);
    } catch (error) {
      setFact('Unable to fetch response. Try again.');
    } finally {
      setIsFactLoading(false);
    }
  };

  const handleVideoFilterChange = (filter) => {
    setActiveVideoFilter(filter);
    setShowAllVideos(false);
  };

  const handleSend = async () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery || isAsking || inFlightQueryRef.current === trimmedQuery) return;

    inFlightQueryRef.current = trimmedQuery;
    setMessages((currentMessages) => [...currentMessages, createMessage('user', trimmedQuery)]);
    setQuery('');
    setIsAsking(true);

    try {
      const payload = await askLearnQuestion(trimmedQuery);
      setMessages((currentMessages) => [...currentMessages, createMessage('assistant', payload.answer)]);
    } catch (error) {
      setMessages((currentMessages) => [...currentMessages, createMessage('assistant', 'Unable to fetch response. Try again.')]);
    } finally {
      inFlightQueryRef.current = '';
      setIsAsking(false);
    }
  };

  const handleSummarize = async (messageId, text) => {
    setMessages((currentMessages) =>
      currentMessages.map((message) =>
        message.id === messageId ? { ...message, isSummarizing: true } : message
      )
    );

    try {
      const payload = await summarizeLearnResponse(text);
      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === messageId
            ? { ...message, isSummarizing: false, summary: payload.summary }
            : message
        )
      );
    } catch (error) {
      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === messageId
            ? { ...message, isSummarizing: false, summary: 'Unable to fetch response. Try again.' }
            : message
        )
      );
    }
  };

  return (
    <main className="min-h-[calc(100vh-70px)] bg-[radial-gradient(circle_at_top_left,rgba(61,153,112,0.22),transparent_32%),radial-gradient(circle_at_top_right,rgba(155,230,186,0.28),transparent_24%),linear-gradient(180deg,color-mix(in_srgb,var(--bg-color)_82%,#dcfce7)_0%,color-mix(in_srgb,var(--bg-color)_92%,var(--card-color))_48%,var(--bg-color)_100%)] px-5 pb-16 pt-8 text-[var(--text-color)] max-md:px-[14px] max-md:pb-12 max-md:pt-5">
      <section className="mx-auto mb-6 max-w-[1180px]">
        <div className="rounded-[28px] bg-[linear-gradient(135deg,#12372a_0%,#1f6a4d_58%,#6dbb7d_100%)] p-9 text-white shadow-[0_24px_50px_rgba(18,55,42,0.18)] max-md:rounded-[22px] max-md:p-5">
          <span className="inline-flex items-center rounded-full bg-white/15 px-[14px] py-2 text-[0.82rem] font-bold uppercase tracking-[0.04em] text-[#ecfff1]">AI Learning Tools</span>
          <h1 className="my-4 text-[clamp(2rem,4vw,3.2rem)] leading-[1.1]">Learn sustainability with guided AI answers</h1>
          <p className="max-w-[760px] text-[1.04rem] text-white/90">Explore environment-focused topics, get simple explanations, and review quick summaries without leaving your carbon footprint app.</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1180px] gap-6">
        <article className={`${surfaceCardClasses} p-7 max-md:rounded-[22px] max-md:p-5`}>
          <div className="mb-5">
            <h2 className="mb-1.5 text-2xl">AI Chat Assistant</h2>
            <p className="text-[var(--text-muted)]">Focused on carbon footprint, pollution, and sustainability.</p>
          </div>

          <div className="mb-6 grid grid-cols-[minmax(0,1fr)_132px] gap-[14px] max-md:grid-cols-1">
            <textarea
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  handleSend();
                }
              }}
              className="min-h-[108px] w-full resize-y rounded-[18px] border border-[var(--input-border)] bg-[var(--input-bg)] px-[18px] py-4 leading-[1.5] text-[var(--input-text)] outline-none transition focus:border-[#56a76f] focus:outline focus:outline-2 focus:outline-[rgba(40,167,69,0.24)]"
              placeholder="Ask something about climate, pollution, clean energy, or sustainability..."
              rows={3}
            />
            <button
              type="button"
              className="min-h-[108px] rounded-2xl bg-[linear-gradient(180deg,#2b9b57_0%,#1f7c45_100%)] p-4 font-bold text-white shadow-[0_18px_28px_rgba(31,124,69,0.22)] transition duration-200 hover:-translate-y-px disabled:cursor-wait disabled:opacity-70 max-md:min-h-0 max-md:px-4 max-md:py-[14px]"
              onClick={handleSend}
              disabled={isAsking || !query.trim()}
            >
              {isAsking ? 'Sending...' : 'Send'}
            </button>
          </div>

          <div className="flex max-h-[680px] flex-col gap-[18px] overflow-y-auto pr-1.5">
            {messages.map((message) => (
              <div key={message.id} className={`flex flex-col gap-2 ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className="text-[0.82rem] font-extrabold uppercase tracking-[0.03em] text-[var(--text-muted)]">
                  {message.role === 'user' ? 'You' : 'AI Guide'}
                </div>
                <div
                  className={`max-w-[min(780px,100%)] rounded-[22px] px-[18px] py-4 leading-[1.6] shadow-[0_14px_26px_rgba(23,49,38,0.08)] ${
                    message.role === 'user'
                      ? 'rounded-br-lg bg-[linear-gradient(180deg,#2f9d58_0%,#238347_100%)] text-white'
                      : 'rounded-bl-lg border border-[color:color-mix(in_srgb,var(--border-color)_72%,rgba(33,95,61,0.1))] bg-[color:color-mix(in_srgb,var(--card-color)_84%,#dcfce7)] text-[var(--text-color)]'
                  }`}
                >
                  <p className="m-0 whitespace-pre-wrap">{message.text}</p>
                </div>
                {message.role === 'assistant' && message.text !== 'Unable to fetch response. Try again.' ? (
                  <div className="w-[min(780px,100%)] max-md:w-full">
                    <button
                      type="button"
                      className="mt-0.5 rounded-2xl bg-[#0f5a3a] px-[14px] py-[10px] font-bold text-white transition duration-200 hover:-translate-y-px disabled:cursor-wait disabled:opacity-70"
                      onClick={() => handleSummarize(message.id, message.text)}
                      disabled={message.isSummarizing}
                    >
                      {message.isSummarizing ? 'Summarizing...' : 'Summarize'}
                    </button>
                    {message.summary ? (
                      <div className="mt-3 rounded-[18px] border border-[color:color-mix(in_srgb,var(--border-color)_72%,rgba(43,118,68,0.12))] bg-[color:color-mix(in_srgb,var(--card-color)_82%,#dcfce7)] px-4 py-[14px]">
                        <h3 className="mb-2 text-[0.95rem]">Quick Summary</h3>
                        <p className="m-0">{message.summary}</p>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}

            {isAsking ? (
              <div className="flex flex-col items-start gap-2">
                <div className="text-[0.82rem] font-extrabold uppercase tracking-[0.03em] text-[var(--text-muted)]">AI Guide</div>
                <div className="inline-flex min-w-24 items-center gap-2 rounded-[22px] rounded-bl-lg border border-[color:color-mix(in_srgb,var(--border-color)_72%,rgba(33,95,61,0.1))] bg-[color:color-mix(in_srgb,var(--card-color)_84%,#dcfce7)] px-[18px] py-4 shadow-[0_14px_26px_rgba(23,49,38,0.08)]" aria-live="polite">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#2b8a57]"></span>
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#2b8a57] [animation-delay:150ms]"></span>
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#2b8a57] [animation-delay:300ms]"></span>
                </div>
              </div>
            ) : null}
            <div ref={chatEndRef}></div>
          </div>
        </article>

        <article className={`${surfaceCardClasses} px-7 py-[26px] max-md:rounded-[22px] max-md:p-5`}>
          <div className="mb-5">
            <h2 className="mb-1.5 text-2xl">Topic Buttons</h2>
            <p className="text-[var(--text-muted)]">Jump into common environmental questions with one click.</p>
          </div>
          <div className="flex flex-wrap gap-3" aria-label="Suggested learning topics">
            {TOPIC_BUTTONS.map((topic) => (
              <button
                key={topic.label}
                type="button"
                className="rounded-2xl bg-[#e7f7eb] px-4 py-3 font-bold text-[#15523a] shadow-[inset_0_0_0_1px_rgba(21,82,58,0.1)] transition duration-200 hover:-translate-y-px hover:bg-[#d6f0dd]"
                onClick={() => setQuery(topic.prompt)}
              >
                {topic.label}
              </button>
            ))}
          </div>
        </article>

        <article className={`${surfaceCardClasses} px-7 py-[26px] max-md:rounded-[22px] max-md:p-5`}>
          <div className="mb-5">
            <h2 className="mb-1.5 text-2xl">Learn with Videos</h2>
            <p className="text-[var(--text-muted)]">Browse short explainers and deeper lessons by category.</p>
          </div>
          <div className="mb-[22px] flex flex-wrap gap-3" aria-label="Video categories">
            {VIDEO_FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                className={`rounded-full px-4 py-[11px] font-bold transition duration-200 hover:-translate-y-px ${
                  activeVideoFilter === filter
                    ? 'bg-[linear-gradient(180deg,#2b9b57_0%,#1f7c45_100%)] text-white shadow-[0_14px_24px_rgba(31,124,69,0.18)]'
                    : 'bg-[color:color-mix(in_srgb,var(--card-color)_72%,#dcfce7)] text-[var(--text-color)] shadow-[inset_0_0_0_1px_rgba(24,69,48,0.08)]'
                }`}
                onClick={() => handleVideoFilterChange(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2 lg:grid-cols-3">
            {visibleVideos.map((video) => (
              <article key={`${video.category}-${video.url}`} className="overflow-hidden rounded-[22px] border border-[color:color-mix(in_srgb,var(--border-color)_72%,rgba(19,71,49,0.1))] bg-[var(--card-color)] shadow-[0_16px_30px_rgba(23,49,38,0.08)] transition duration-200 hover:-translate-y-1.5 hover:shadow-[0_22px_38px_rgba(23,49,38,0.14)]">
                <div className="relative aspect-video overflow-hidden bg-[linear-gradient(135deg,color-mix(in_srgb,var(--card-color)_70%,#d8f0de),color-mix(in_srgb,var(--bg-color)_70%,#f3fbf5))]">
                  <img src={buildThumbnailUrl(video.url)} alt={video.title} className="block h-full w-full object-cover" loading="lazy" />
                  <span className="absolute left-3 top-3 rounded-full bg-[rgba(18,55,42,0.84)] px-[10px] py-[7px] text-[0.74rem] font-extrabold uppercase tracking-[0.04em] text-[#f2fff4]">{video.category}</span>
                </div>
                <div className="flex flex-col gap-[14px] p-[18px]">
                  <h3 className="min-h-[2.9em] text-base leading-[1.45] text-[var(--text-color)]">{video.title}</h3>
                  <a href={video.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-w-28 items-center justify-center self-start rounded-[14px] bg-[#0f5a3a] px-4 py-[11px] font-bold text-white no-underline transition duration-200 hover:-translate-y-px">
                    Watch
                  </a>
                </div>
              </article>
            ))}
          </div>
          {canToggleVideoCount ? (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                className="rounded-full bg-[#12372a] px-4 py-[11px] font-bold text-white shadow-[0_14px_24px_rgba(18,55,42,0.16)] transition duration-200 hover:-translate-y-px"
                onClick={() => setShowAllVideos((current) => !current)}
              >
                {showAllVideos ? 'Show Less' : 'View More'}
              </button>
            </div>
          ) : null}
        </article>

        <article className={`${surfaceCardClasses} px-7 py-[26px] max-md:rounded-[22px] max-md:p-5`}>
          <div className="mb-5 flex items-start justify-between gap-4 max-md:flex-col max-md:items-stretch">
            <div>
              <h2 className="mb-1.5 text-2xl">Did you know?</h2>
              <p className="text-[var(--text-muted)]">Small facts that make big environmental ideas easier to remember.</p>
            </div>
            <button
              type="button"
              className="rounded-2xl bg-[#12372a] px-[18px] py-3 font-bold text-white transition duration-200 hover:-translate-y-px disabled:cursor-wait disabled:opacity-70"
              onClick={loadFact}
              disabled={isFactLoading}
            >
              {isFactLoading ? 'Loading...' : 'Next Fact'}
            </button>
          </div>
          <div className="rounded-[22px] bg-[linear-gradient(135deg,rgba(18,55,42,0.96),rgba(36,98,67,0.92)),#12372a] p-7 text-[#f8fff9]">
            <span className="mb-3 inline-block text-[0.8rem] font-extrabold uppercase tracking-[0.05em] text-[#bff4cc]">Environmental Fact</span>
            <p className="m-0 text-[1.08rem] leading-[1.7]">{fact || 'Loading a sustainability fact...'}</p>
          </div>
        </article>
      </section>
    </main>
  );
};

export default Learn;
