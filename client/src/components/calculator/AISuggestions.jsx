import React from 'react';
import ChartCard from './ChartCard';
import { calculatorIconBadge } from './tailwind';

const AISuggestions = ({ aiInsights, ruleSuggestions }) => (
  <ChartCard
    title="Hybrid AI Suggestions"
    subtitle="Smart tips from your input patterns plus Gemini-backed AI insights"
    className="calculator-ai-card"
  >
    {aiInsights.loading ? (
      <p className="calculator-status-message rounded-2xl bg-sky-100 px-4 py-3 text-sm font-semibold text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
        Generating suggestions...
      </p>
    ) : null}
    {aiInsights.error ? (
      <p className="calculator-status-message calculator-status-warning rounded-2xl bg-amber-100 px-4 py-3 text-sm font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
        Showing smart suggestions based on your data while AI reconnects.
      </p>
    ) : null}

    <div className="calculator-suggestion-grid grid gap-4 xl:grid-cols-2">
      <div className="calculator-suggestion-column grid gap-3 rounded-[24px] border border-[#e5e5e5] bg-[rgba(250,250,250,0.92)] p-4 dark:border-white/10 dark:bg-slate-900/60">
        <h4 className="calculator-suggestion-heading flex items-center gap-3 text-base font-extrabold text-[#111111] dark:text-slate-50">
          <span className={`calculator-suggestion-heading-icon ${calculatorIconBadge}`}>S</span>
          Smart Tips
        </h4>
        {ruleSuggestions.map((suggestion) => (
          <div
            key={suggestion.message}
            className="calculator-suggestion-item grid gap-1.5 rounded-2xl border border-[#e5e5e5] bg-white p-4 shadow-[0_10px_20px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-0.5 dark:border-white/10 dark:bg-slate-950/60"
          >
            <div className="calculator-suggestion-item-icon inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 font-extrabold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
              !
            </div>
            <p className="calculator-suggestion-text text-sm font-semibold text-[#111111] dark:text-slate-100">
              {suggestion.message}
            </p>
            <p className="calculator-suggestion-impact text-xs uppercase tracking-[0.14em] text-[#666666] dark:text-slate-400">
              {suggestion.impact}
            </p>
          </div>
        ))}
      </div>

      <div className="calculator-suggestion-column grid gap-3 rounded-[24px] border border-[#e5e5e5] bg-[rgba(250,250,250,0.92)] p-4 dark:border-white/10 dark:bg-slate-900/60">
        <h4 className="calculator-suggestion-heading flex items-center gap-3 text-base font-extrabold text-[#111111] dark:text-slate-50">
          <span className={`calculator-suggestion-heading-icon ${calculatorIconBadge}`}>A</span>
          AI Insights
        </h4>
        {(aiInsights.data?.aiSuggestions || []).map((suggestion, index) => (
          <div
            key={`${suggestion}-${index}`}
            className="calculator-suggestion-item grid gap-1.5 rounded-2xl border border-[#e5e5e5] bg-white p-4 shadow-[0_10px_20px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-0.5 dark:border-white/10 dark:bg-slate-950/60"
          >
            <div className="calculator-suggestion-item-icon calculator-suggestion-item-icon-ai inline-flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 font-extrabold text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
              *
            </div>
            <p className="calculator-suggestion-text text-sm font-semibold text-[#111111] dark:text-slate-100">
              {suggestion}
            </p>
          </div>
        ))}
        {!aiInsights.data?.aiSuggestions?.length ? (
          <div className="calculator-suggestion-empty rounded-2xl border border-dashed border-[#d4d4d4] px-4 py-5 text-center text-sm text-[#666666] dark:border-white/10 dark:text-slate-400">
            Use Recalculate to refresh the AI layer.
          </div>
        ) : null}
      </div>
    </div>
  </ChartCard>
);

export default AISuggestions;
