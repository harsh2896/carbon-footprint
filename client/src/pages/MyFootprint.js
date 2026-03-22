import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useQuery } from '@apollo/client';
import {
  Chart as ChartJS,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import Pledges from '../components/Pledges';
import {
  getFootprintGoal,
  getFootprintHistory,
  saveFootprintGoal,
} from '../utils/footprintHistory';
import { QUERY_ME } from '../utils/queries';
import Auth from '../utils/auth';

ChartJS.register(
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Filler
);

const FILTER_OPTIONS = [
  { id: 'day', label: 'Day-wise' },
  { id: 'week', label: 'Week-wise' },
  { id: 'month', label: 'Month-wise' },
  { id: 'year', label: 'Year-wise' },
  { id: 'all', label: 'All-time' },
  { id: 'custom', label: 'Custom range' },
];

const CATEGORY_META = {
  transport: { label: 'Transport', icon: 'solar:bus-bold-duotone' },
  electricity: { label: 'Electricity', icon: 'solar:lightbulb-bolt-bold-duotone' },
  water: { label: 'Water', icon: 'solar:waterdrop-bold-duotone' },
  food: { label: 'Food', icon: 'solar:leaf-bold-duotone' },
  lifestyle: { label: 'Lifestyle', icon: 'solar:bag-bold-duotone' },
  advanced: { label: 'Advanced', icon: 'solar:graph-up-bold-duotone' },
};

const SUGGESTION_LIBRARY = {
  transport: {
    icon: 'solar:bus-bold-duotone',
    title: 'Shift some trips away from solo travel',
    description: 'Use public transport or carpool more often to lower transport emissions.',
  },
  electricity: {
    icon: 'solar:lightbulb-bolt-bold-duotone',
    title: 'Trim household power peaks',
    description: 'Reduce AC usage and move toward efficient appliances where possible.',
  },
  food: {
    icon: 'solar:leaf-bold-duotone',
    title: 'Make food choices lighter',
    description: 'Reduce meat-heavy meals and prefer local, lower-impact food more often.',
  },
  water: {
    icon: 'solar:waterdrop-bold-duotone',
    title: 'Lower water waste',
    description: 'Shorter showers and less wastage can meaningfully reduce your water footprint.',
  },
  lifestyle: {
    icon: 'solar:bag-bold-duotone',
    title: 'Slow down shopping emissions',
    description: 'Buy less often, reuse more, and consolidate deliveries where you can.',
  },
  advanced: {
    icon: 'solar:cpu-bolt-bold-duotone',
    title: 'Tune advanced habits',
    description: 'Review digital, work, pet, and home setup choices to remove hidden emissions.',
  },
  rising: {
    icon: 'solar:arrow-to-top-left-bold-duotone',
    title: 'Your emissions are rising',
    description: 'Focus on your top contributors first to reverse the current upward trend.',
  },
  improved: {
    icon: 'solar:medal-ribbons-star-bold-duotone',
    title: 'Great progress',
    description: 'You reduced your footprint recently. Keep repeating the habits behind that drop.',
  },
  goal: {
    icon: 'solar:target-bold-duotone',
    title: 'Stay on your reduction target',
    description: 'A consistent drop in your largest category will move the goal tracker faster.',
  },
};

const numberFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 1,
});

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
});

const monthFormatter = new Intl.DateTimeFormat('en-IN', {
  month: 'short',
  year: 'numeric',
});

const yearFormatter = new Intl.DateTimeFormat('en-IN', {
  year: 'numeric',
});

const formatFootprint = (value) => numberFormatter.format(Number(value || 0));

const toDateInputValue = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateValue = (value, mode = 'start') => {
  if (!value) return null;
  return mode === 'end' ? new Date(`${value}T23:59:59.999`) : new Date(`${value}T00:00:00`);
};

const startOfDay = (date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const endOfDay = (date) => {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
};

const startOfWeek = (date) => {
  const next = startOfDay(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  return next;
};

const endOfWeek = (date) => {
  const next = startOfWeek(date);
  next.setDate(next.getDate() + 6);
  return endOfDay(next);
};

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
const endOfMonth = (date) => endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0));
const startOfYear = (date) => new Date(date.getFullYear(), 0, 1);
const endOfYear = (date) => endOfDay(new Date(date.getFullYear(), 11, 31));

const shiftDate = (date, filter, amount) => {
  const next = new Date(date);
  if (filter === 'day') next.setDate(next.getDate() + amount);
  if (filter === 'week') next.setDate(next.getDate() + amount * 7);
  if (filter === 'month') next.setMonth(next.getMonth() + amount);
  if (filter === 'year') next.setFullYear(next.getFullYear() + amount);
  return next;
};

const getRangeForDate = (date, filter) => {
  if (filter === 'day') return { start: startOfDay(date), end: endOfDay(date) };
  if (filter === 'week') return { start: startOfWeek(date), end: endOfWeek(date) };
  if (filter === 'month') return { start: startOfMonth(date), end: endOfMonth(date) };
  if (filter === 'year') return { start: startOfYear(date), end: endOfYear(date) };
  return { start: startOfMonth(date), end: endOfMonth(date) };
};

const getDateLabel = (start, filter) => {
  if (filter === 'day') return dateFormatter.format(start);
  if (filter === 'week') {
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `${dateFormatter.format(start)} - ${dateFormatter.format(end)}`;
  }
  if (filter === 'month') return monthFormatter.format(start);
  return yearFormatter.format(start);
};

const sumRecords = (records) =>
  records.reduce((sum, record) => sum + Number(record.total || 0), 0);

const aggregateCategories = (records) =>
  records.reduce(
    (totals, record) => {
      Object.keys(totals).forEach((key) => {
        totals[key] += Number(record.categories?.[key] || 0);
      });
      return totals;
    },
    {
      transport: 0,
      electricity: 0,
      water: 0,
      food: 0,
      lifestyle: 0,
      advanced: 0,
    }
  );

const getTopCategory = (totals) =>
  Object.entries(totals).sort(([, a], [, b]) => b - a)[0] || ['transport', 0];

const aggregateTimeline = (records, filter) => {
  const bucketFilter = filter === 'all' ? 'month' : filter;
  const buckets = new Map();

  records.forEach((record) => {
    const currentDate = new Date(record.timestamp);
    const { start } = getRangeForDate(currentDate, bucketFilter);
    const key = start.toISOString();
    const existing = buckets.get(key) || {
      key,
      start,
      label: getDateLabel(start, bucketFilter),
      total: 0,
      records: [],
    };

    existing.total += Number(record.total || 0);
    existing.records.push(record);
    buckets.set(key, existing);
  });

  return [...buckets.values()]
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .map((bucket) => ({
      ...bucket,
      total: Number(bucket.total.toFixed(2)),
    }));
};

const getCustomTimelineFilter = (start, end) => {
  const diffDays = Math.max((end.getTime() - start.getTime()) / 86400000, 1);
  if (diffDays <= 31) return 'day';
  if (diffDays <= 120) return 'week';
  if (diffDays <= 730) return 'month';
  return 'year';
};

const getComparison = (records, filter, timeline, customRange) => {
  if (filter === 'custom') {
    const start = parseDateValue(customRange.start);
    const end = parseDateValue(customRange.end, 'end');

    if (!start || !end || start > end) return null;

    const currentRecords = records.filter((record) => {
      const date = new Date(record.timestamp);
      return date >= start && date <= end;
    });
    const rangeMs = end.getTime() - start.getTime();
    const previousStart = new Date(start.getTime() - rangeMs - 86400000);
    const previousEnd = new Date(end.getTime() - rangeMs - 86400000);
    const previousRecords = records.filter((record) => {
      const date = new Date(record.timestamp);
      return date >= previousStart && date <= previousEnd;
    });

    return {
      current: sumRecords(currentRecords),
      previous: sumRecords(previousRecords),
      label: 'previous date range',
    };
  }

  const currentBucket = timeline[timeline.length - 1];
  const previousBucket = timeline[timeline.length - 2];

  if (!currentBucket) return null;

  if (previousBucket) {
    return {
      current: currentBucket.total,
      previous: previousBucket.total,
      label:
        filter === 'all'
          ? 'previous month'
          : `previous ${filter === 'day' ? 'day' : filter}`,
    };
  }

  const comparisonFilter = filter === 'all' ? 'month' : filter;
  const previousRange = getRangeForDate(
    shiftDate(currentBucket.start, comparisonFilter, -1),
    comparisonFilter
  );
  const previousRecords = records.filter((record) => {
    const date = new Date(record.timestamp);
    return date >= previousRange.start && date <= previousRange.end;
  });

  return {
    current: currentBucket.total,
    previous: sumRecords(previousRecords),
    label: `previous ${comparisonFilter === 'day' ? 'day' : comparisonFilter}`,
  };
};

const buildRecommendations = ({ topCategory, delta, goalProgress }) => {
  const suggestions = [];

  if (SUGGESTION_LIBRARY[topCategory]) suggestions.push(SUGGESTION_LIBRARY[topCategory]);
  if (delta > 0) suggestions.push(SUGGESTION_LIBRARY.rising);
  if (delta < 0) suggestions.push(SUGGESTION_LIBRARY.improved);
  if (goalProgress < 100) suggestions.push(SUGGESTION_LIBRARY.goal);

  return suggestions.filter(Boolean).slice(0, 3);
};

const shellClasses =
  'relative z-[1] grid gap-7 rounded-[26px] p-5 before:pointer-events-none before:absolute before:inset-0 before:z-0 before:opacity-35 before:content-[\'\'] before:bg-[linear-gradient(135deg,rgba(255,255,255,0.02),transparent_42%),repeating-linear-gradient(135deg,rgba(255,255,255,0.012)_0,rgba(255,255,255,0.012)_1px,transparent_1px,transparent_18px)]';
const surfaceClasses =
  'relative z-[1] rounded-[22px] border border-[var(--border-color)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--card-color)_96%,transparent),color-mix(in_srgb,var(--card-color)_92%,var(--bg-color))),linear-gradient(135deg,rgba(52,211,153,0.03),transparent_44%)] shadow-[0_14px_28px_rgba(15,23,42,0.08)] backdrop-blur-[14px]';
const smallLabelClasses =
  'text-[0.75rem] font-bold uppercase tracking-[1.2px] text-[var(--text-muted)]';
const chipBaseClasses =
  'rounded-full border border-[var(--border-color)] bg-[var(--card-color)] px-4 py-2.5 font-semibold text-[var(--text-color)] transition duration-200 hover:border-[rgba(52,211,153,0.35)] hover:bg-[linear-gradient(120deg,rgba(52,211,153,0.16),rgba(34,211,238,0.1))]';
const chipActiveClasses =
  'border-[rgba(52,211,153,0.35)] bg-[linear-gradient(120deg,rgba(52,211,153,0.16),rgba(34,211,238,0.1))]';
const inputClasses =
  'w-full rounded-[14px] border border-[var(--border-color)] bg-[var(--card-color)] px-[14px] py-3 text-[var(--text-color)]';

const MyFootprint = () => {
  const { data, loading } = useQuery(QUERY_ME, {
    skip: !Auth.loggedIn(),
  });

  const { username, carbonData = [] } = data?.me || {};
  const [history, setHistory] = useState([]);
  const [chartType, setChartType] = useState('line');
  const [activeFilter, setActiveFilter] = useState('month');
  const [goalTarget, setGoalTarget] = useState(20);
  const [goalDraft, setGoalDraft] = useState('20');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });

  useEffect(() => {
    const records = getFootprintHistory();
    const target = getFootprintGoal();
    setHistory(records);
    setGoalTarget(target);
    setGoalDraft(String(target));

    if (records.length) {
      setCustomRange({
        start: toDateInputValue(new Date(records[0].timestamp)),
        end: toDateInputValue(new Date(records[records.length - 1].timestamp)),
      });
    }
  }, []);

  const analytics = useMemo(() => {
    const records = [...history].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    const latest = records[records.length - 1] || null;
    const start = parseDateValue(customRange.start);
    const end = parseDateValue(customRange.end, 'end');
    const filteredRecords =
      activeFilter === 'custom'
        ? records.filter((record) => {
            const date = new Date(record.timestamp);
            return start && end ? date >= start && date <= end : false;
          })
        : records;
    const timelineFilter =
      activeFilter === 'custom' && start && end
        ? getCustomTimelineFilter(start, end)
        : activeFilter;
    const timeline = aggregateTimeline(filteredRecords, timelineFilter);
    const categoryTotals = aggregateCategories(filteredRecords);
    const [topCategoryKey, topCategoryValue] = getTopCategory(categoryTotals);
    const comparison = getComparison(records, activeFilter, timeline, customRange);
    const delta = comparison ? comparison.current - comparison.previous : 0;
    const percentChange =
      comparison && comparison.previous > 0 ? (delta / comparison.previous) * 100 : 0;
    const dailyTimeline = aggregateTimeline(records, 'day');
    const bestDay = [...dailyTimeline].sort((a, b) => a.total - b.total)[0] || null;
    const worstDay = [...dailyTimeline].sort((a, b) => b.total - a.total)[0] || null;
    const average = timeline.length
      ? timeline.reduce((sum, item) => sum + item.total, 0) / timeline.length
      : 0;
    const baseline = Number(records[0]?.total || 0);
    const latestTotal = Number(latest?.total || 0);
    const reductionPercent =
      baseline > 0 ? Math.max(((baseline - latestTotal) / baseline) * 100, 0) : 0;
    const goalProgress =
      goalTarget > 0 ? Math.min((reductionPercent / goalTarget) * 100, 100) : 0;

    return {
      latest,
      filteredRecords,
      timeline,
      topCategoryKey,
      topCategoryValue,
      comparison,
      delta,
      percentChange,
      bestDay,
      worstDay,
      average,
      reductionPercent,
      goalProgress,
      recommendations: buildRecommendations({
        topCategory: topCategoryKey,
        delta,
        goalProgress,
      }),
    };
  }, [activeFilter, customRange, goalTarget, history]);

  const hasHistory = Boolean(analytics.latest);
  const hasFilteredData = Boolean(analytics.timeline.length);

  const chartData = useMemo(() => {
    if (!analytics.timeline.length) return null;

    return {
      labels: analytics.timeline.map((item) => item.label),
      datasets: [
        {
          label: 'kg CO2',
          data: analytics.timeline.map((item) => item.total),
          borderColor: '#22d3ee',
          backgroundColor:
            chartType === 'line'
              ? 'rgba(34, 211, 238, 0.18)'
              : analytics.timeline.map((item, index, items) => {
                  if (index === items.length - 1) return '#34d399';
                  if (index === items.length - 2) return '#38bdf8';
                  return 'rgba(56, 189, 248, 0.45)';
                }),
          borderWidth: 3,
          fill: chartType === 'line',
          tension: 0.35,
          borderRadius: chartType === 'bar' ? 12 : 0,
          pointRadius: ({ dataIndex, dataset }) =>
            chartType === 'line' && dataIndex >= dataset.data.length - 2 ? 5 : 3,
          pointHoverRadius: 6,
          pointBackgroundColor: ({ dataIndex, dataset }) => {
            if (dataIndex === dataset.data.length - 1) return '#34d399';
            if (dataIndex === dataset.data.length - 2) return '#38bdf8';
            return '#22d3ee';
          },
        },
      ],
    };
  }, [analytics.timeline, chartType]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 700,
        easing: 'easeOutQuart',
      },
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: 'rgba(3, 7, 18, 0.95)',
          borderColor: 'rgba(34, 211, 238, 0.35)',
          borderWidth: 1,
          displayColors: false,
          callbacks: {
            label: (context) => `${formatFootprint(context.parsed.y || context.parsed)} kg CO2`,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: '#cbd5e1' },
          grid: { display: false },
        },
        y: {
          ticks: { color: '#94a3b8' },
          grid: { color: 'rgba(148, 163, 184, 0.12)' },
        },
      },
    }),
    []
  );

  const comparisonTone =
    !hasFilteredData || !analytics.comparison
      ? 'neutral'
      : analytics.delta < 0
      ? 'positive'
      : analytics.delta > 0
      ? 'negative'
      : 'neutral';
  const comparisonCopy = hasFilteredData && analytics.comparison
    ? analytics.comparison.previous > 0
      ? analytics.delta < 0
        ? `Your footprint decreased by ${Math.abs(analytics.percentChange).toFixed(1)}% compared to ${analytics.comparison.label}.`
        : analytics.delta > 0
        ? `Your footprint increased by ${Math.abs(analytics.percentChange).toFixed(1)}% compared to ${analytics.comparison.label}.`
        : `Your footprint is unchanged compared to ${analytics.comparison.label}.`
      : 'More history is needed before period-over-period change can be calculated.'
    : 'No comparison data available yet.';

  const insightItems = hasFilteredData
    ? [
        {
          title: 'Highest Contributing Category',
          body: `${CATEGORY_META[analytics.topCategoryKey]?.label || 'Transport'} is your highest emission source at ${formatFootprint(analytics.topCategoryValue)} kg CO2.`,
        },
        {
          title: 'Trend Direction',
          body:
            analytics.delta < 0
              ? `Your footprint is decreasing in the latest ${activeFilter === 'all' ? 'monthly' : activeFilter} comparison.`
              : analytics.delta > 0
              ? `Your footprint is increasing in the latest ${activeFilter === 'all' ? 'monthly' : activeFilter} comparison.`
              : 'Your footprint is steady in the latest comparison window.',
        },
        {
          title: 'Performance Summary',
          body: `You have ${analytics.filteredRecords.length} tracked calculations in view with an average of ${formatFootprint(analytics.average)} kg CO2.`,
        },
      ]
    : [
        {
          title: 'Insights Unavailable',
          body: 'No entries were found for the selected filters. Try widening the date range.',
        },
      ];

  const displayedRecommendations = hasFilteredData
    ? analytics.recommendations
    : [
        {
          icon: 'solar:calendar-search-bold-duotone',
          title: 'Expand your range',
          description: 'Try a wider date range or switch to all-time to view smart suggestions.',
        },
      ];

  const handleGoalSave = () => {
    const nextValue = Math.max(Number(goalDraft) || 0, 1);
    setGoalTarget(nextValue);
    setGoalDraft(String(nextValue));
    saveFootprintGoal(nextValue);
  };

  if (loading) {
    return <h2>LOADING...</h2>;
  }

  const comparisonPillClasses =
    comparisonTone === 'positive'
      ? 'bg-[rgba(52,211,153,0.14)] text-green-800 dark:text-green-300'
      : comparisonTone === 'negative'
      ? 'bg-[rgba(248,113,113,0.12)] text-red-700 dark:text-rose-300'
      : 'bg-[rgba(148,163,184,0.12)] text-slate-600 dark:text-slate-300';

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(52,211,153,0.08),transparent_24%),linear-gradient(180deg,color-mix(in_srgb,var(--bg-color)_96%,white)_0%,color-mix(in_srgb,var(--bg-color)_88%,var(--card-color))_54%,var(--bg-color)_100%)] px-[6vw] pb-[70px] pt-10 text-[var(--text-color)] selection:bg-[rgba(52,211,153,0.28)] selection:text-[#111111]">
      <div className="pointer-events-none fixed left-[-80px] top-[-90px] -z-[1] h-80 w-80 animate-float rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.08),transparent_70%)] blur-[22px]" />
      <div className="pointer-events-none fixed bottom-[-120px] right-[-80px] -z-[1] h-80 w-80 animate-float rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.08),transparent_70%)] blur-[22px] [animation-delay:4s]" />

      {Auth.loggedIn() ? (
        <div className={`${shellClasses} main-container`}>
          {hasHistory ? (
            <>
              <motion.section
                className="relative z-[1] grid items-center gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                <div>
                  <p className="text-[0.75rem] font-bold uppercase tracking-[2px] text-emerald-400">My Footprint</p>
                  <h1 className="my-[10px] text-[clamp(2rem,3vw,3rem)]">Footprint Analytics Dashboard</h1>
                  <p className="text-[var(--text-muted)]">Trend view for {username}. Latest calculation recorded {new Date(analytics.latest.timestamp).toLocaleString()}.</p>
                </div>
                <div className={`${surfaceClasses} grid gap-2 p-6`}>
                  <span className={smallLabelClasses}>Latest Monthly Footprint</span>
                  <h2 className="text-[1.8rem]">{formatFootprint(analytics.latest.total)} kg CO2</h2>
                  <p className="text-[var(--text-muted)]">{analytics.timeline.length} analytics points ready across your saved history.</p>
                </div>
              </motion.section>

              <section className="relative z-[1] grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(210px,1fr))]">
                {Object.entries(analytics.latest.categories).map(([key, value]) => (
                  <div className={`${surfaceClasses} flex items-center gap-[14px] p-[18px] transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_30px_rgba(15,23,42,0.12)]`} key={key}>
                    <div className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-[14px] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--card-color)_98%,white),color-mix(in_srgb,var(--card-color)_84%,var(--bg-color)))] text-cyan-400 shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--border-color)_92%,transparent)]">
                      <Icon icon={CATEGORY_META[key].icon} width="24" />
                    </div>
                    <div>
                      <h3 className="mb-1.5 text-base">{CATEGORY_META[key].label}</h3>
                      <p>{formatFootprint(value)} kg CO2</p>
                    </div>
                  </div>
                ))}
              </section>

              <section className={`${surfaceClasses} relative z-[1] grid gap-[18px] p-6 max-sm:p-[18px]`}>
                <div className="flex items-center justify-between gap-[18px] max-sm:grid">
                  <div>
                    <p className="text-[0.75rem] font-bold uppercase tracking-[2px] text-emerald-400">Footprint Trends & Analytics</p>
                    <h3 className="text-[1.4rem]">Footprint Trends & Analytics</h3>
                  </div>
                  <div className="flex flex-wrap gap-[10px]">
                    {['line', 'bar'].map((type) => (
                      <button key={type} type="button" onClick={() => setChartType(type)} className={`chart-toggle-button ${chipBaseClasses} ${chartType === type ? `chart-toggle-button-active ${chipActiveClasses}` : ''}`}>
                        {type === 'line' ? 'Line' : 'Bar'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-[10px]">
                  {FILTER_OPTIONS.map((option) => (
                    <button key={option.id} type="button" onClick={() => setActiveFilter(option.id)} className={`filter-chip ${chipBaseClasses} ${activeFilter === option.id ? `filter-chip-active ${chipActiveClasses}` : ''}`}>
                      {option.label}
                    </button>
                  ))}
                </div>

                {activeFilter === 'custom' && (
                  <div className="grid gap-[14px] [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
                    <label className="grid gap-2">
                      <span className={smallLabelClasses}>Start date</span>
                      <input type="date" value={customRange.start} onChange={(event) => setCustomRange((prev) => ({ ...prev, start: event.target.value }))} className={inputClasses} />
                    </label>
                    <label className="grid gap-2">
                      <span className={smallLabelClasses}>End date</span>
                      <input type="date" value={customRange.end} onChange={(event) => setCustomRange((prev) => ({ ...prev, end: event.target.value }))} className={inputClasses} />
                    </label>
                  </div>
                )}

                <div className="grid gap-4">
                  <div className={`comparison-pill inline-flex max-w-full items-center gap-[10px] rounded-full px-[14px] py-2.5 font-semibold max-sm:w-full max-sm:rounded-[18px] ${comparisonPillClasses}`}>
                    <Icon icon={comparisonTone === 'positive' ? 'solar:arrow-down-bold-duotone' : comparisonTone === 'negative' ? 'solar:arrow-up-bold-duotone' : 'solar:minus-circle-bold-duotone'} width="18" />
                    <span>{comparisonCopy}</span>
                  </div>
                  <div className="min-h-[360px]">
                    {chartData ? chartType === 'line' ? <Line data={chartData} options={chartOptions} /> : <Bar data={chartData} options={chartOptions} /> : <div className="grid min-h-[260px] place-items-center text-center text-[var(--text-muted)]"><p>No entries were found for this filter selection.</p></div>}
                  </div>
                </div>
              </section>

              <section className="relative z-[1] grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
                {insightItems.map((item) => (
                  <div className={`${surfaceClasses} grid gap-[10px] p-5`} key={item.title}>
                    <p className={smallLabelClasses}>{item.title}</p>
                    <p>{item.body}</p>
                  </div>
                ))}
              </section>

              <section className="relative z-[1] grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
                <div className={`${surfaceClasses} grid gap-[18px] p-6 max-sm:p-[18px]`}>
                  <div>
                    <p className="text-[0.75rem] font-bold uppercase tracking-[2px] text-emerald-400">Smart AI Suggestions</p>
                    <h3 className="text-[1.4rem]">Smart AI Suggestions</h3>
                  </div>
                  <div className="grid gap-[14px]">
                    {displayedRecommendations.map((item) => (
                      <div className="flex gap-[14px] rounded-[18px] border border-[var(--border-color)] bg-[color:color-mix(in_srgb,var(--card-color)_92%,var(--bg-color))] p-[14px]" key={item.title}>
                        <div className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-[14px] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--card-color)_98%,white),color-mix(in_srgb,var(--card-color)_84%,var(--bg-color)))] text-cyan-400 shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--border-color)_92%,transparent)]">
                          <Icon icon={item.icon} width="22" />
                        </div>
                        <div>
                          <h4 className="mb-1">{item.title}</h4>
                          <p>{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
                  <div className={`${surfaceClasses} grid gap-[10px] p-5`}><span className={smallLabelClasses}>Best Day</span><strong className="text-[1.25rem]">{analytics.bestDay ? analytics.bestDay.label : '--'}</strong><p>{analytics.bestDay ? `${formatFootprint(analytics.bestDay.total)} kg CO2` : 'No data'}</p></div>
                  <div className={`${surfaceClasses} grid gap-[10px] p-5`}><span className={smallLabelClasses}>Worst Day</span><strong className="text-[1.25rem]">{analytics.worstDay ? analytics.worstDay.label : '--'}</strong><p>{analytics.worstDay ? `${formatFootprint(analytics.worstDay.total)} kg CO2` : 'No data'}</p></div>
                  <div className={`${surfaceClasses} grid gap-[10px] p-5`}><span className={smallLabelClasses}>Average Footprint</span><strong className="text-[1.25rem]">{formatFootprint(analytics.average)} kg CO2</strong><p>Average for the currently selected analytics view.</p></div>
                  <div className={`${surfaceClasses} grid gap-[10px] p-5 md:col-span-2 lg:col-span-2`}>
                    <span className={smallLabelClasses}>Goal Tracking</span>
                    <strong className="text-[1.25rem]">{analytics.reductionPercent.toFixed(1)}% reduced</strong>
                    <p>Target: {goalTarget}% reduction from your earliest saved result.</p>
                    <div className="grid items-center gap-[10px] [grid-template-columns:minmax(0,1fr)_auto] max-sm:grid-cols-1">
                      <input type="number" min="1" max="100" value={goalDraft} onChange={(event) => setGoalDraft(event.target.value)} className={inputClasses} />
                      <button type="button" onClick={handleGoalSave} className={chipBaseClasses}>Save Goal</button>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[rgba(148,163,184,0.18)]">
                      <div className="h-full rounded-full bg-[linear-gradient(90deg,#34d399,#22d3ee)]" style={{ width: `${analytics.goalProgress}%` }} />
                    </div>
                  </div>
                </div>
              </section>

              <section className="relative z-[1]">
                <Pledges />
              </section>
            </>
          ) : (
            <div className="relative z-[1] grid gap-4 text-center">
              <h2 className="text-[1.7rem] font-bold">No historical data available. Start calculating to see trends.</h2>
              {carbonData.length > 0 && <p className="text-[var(--text-muted)]">Your account has older saved entries, but this analytics dashboard needs fresh local history created from new calculator runs.</p>}
              <div className="flex justify-center">
                <Link to="/calculator"><button type="button" className={chipBaseClasses}>Go to Calculator</button></Link>
              </div>
              <Pledges />
            </div>
          )}
        </div>
      ) : (
        <div className="px-5 py-[60px] text-center">
          <h2 className="text-[1.7rem] font-bold">Log in to see your carbon footprint!</h2>
          <Link to="/login"><button type="submit" className={`${chipBaseClasses} mt-4`}>Log In</button></Link>
        </div>
      )}
    </div>
  );
};

export default MyFootprint;
