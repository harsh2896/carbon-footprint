import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import ResultCard from './ResultCard';
import {
  APP_SCORE_DIVISOR,
  APP_SCORE_MAX,
  APP_SCORE_MIN,
  LOW_CARBON_THRESHOLD,
  MEDIUM_CARBON_THRESHOLD,
} from '../../utils/emissionFactors';
import {
  calculatorKpiLabel,
  calculatorRange,
  levelPill,
} from './tailwind';

const LivePreview = ({ results, period, breakdown, formatNumber }) => {
  const [previewScale, setPreviewScale] = useState(100);

  const previewData = useMemo(() => {
    const multiplier = previewScale / 100;
    const total = results.total * multiplier;
    const basic = results.basicEmission * multiplier;
    const advanced = results.advancedEmission * multiplier;
    const ecoScore = Math.max(
      APP_SCORE_MIN,
      Math.min(APP_SCORE_MAX, Math.round(100 - total / APP_SCORE_DIVISOR))
    );
    const carbonLevel =
      total < LOW_CARBON_THRESHOLD
        ? 'Low'
        : total < MEDIUM_CARBON_THRESHOLD
        ? 'Medium'
        : 'High';

    return {
      total,
      basic,
      advanced,
      ecoScore,
      carbonLevel,
      breakdown: breakdown.map((item) => ({
        ...item,
        value: item.value * multiplier,
      })),
    };
  }, [breakdown, previewScale, results]);

  return (
    <ResultCard
      title="Live Preview"
      value={previewData.total}
      suffix={period === 'yearly' ? 'kg CO2 / year' : 'kg CO2 / month'}
      accent="text-emerald-600 dark:text-emerald-300"
      helper="Use the scenario slider to preview lighter or heavier lifestyle patterns in real time."
      className="live-preview"
    >
      <div className="calculator-preview-slider mt-5 grid gap-4 rounded-[24px] border border-[#e5e5e5] bg-[rgba(250,250,250,0.92)] p-4 dark:border-white/10 dark:bg-slate-900/60">
        <div className="calculator-preview-slider-header flex items-start justify-between gap-4">
          <div>
            <p className={calculatorKpiLabel}>Scenario Slider</p>
            <p className="calculator-preview-slider-copy text-sm text-[#444444] dark:text-slate-300">
              Preview your footprint from a lighter to heavier month without changing saved inputs.
            </p>
          </div>
          <div className="calculator-preview-slider-value rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-extrabold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            {previewScale}%
          </div>
        </div>
        <input
          type="range"
          min="70"
          max="130"
          step="1"
          value={previewScale}
          onChange={(event) => setPreviewScale(Number(event.target.value))}
          className={`${calculatorRange} calculator-preview-range`}
          aria-label="Live preview scenario slider"
        />
        <div className="calculator-preview-slider-scale flex items-center justify-between text-xs font-bold uppercase tracking-[0.18em] text-[#666666] dark:text-slate-400">
          <span>Lighter</span>
          <span>Balanced</span>
          <span>Heavier</span>
        </div>
      </div>

      <div className="calculator-pill-row mt-4 flex flex-wrap gap-2.5">
        <div className={levelPill(previewData.carbonLevel.toLowerCase())}>
          Carbon Level: {previewData.carbonLevel}
        </div>
        <div className={levelPill('basic')}>Basic: {formatNumber(previewData.basic)} kg</div>
        <div className={levelPill('advanced')}>
          Advanced: {formatNumber(previewData.advanced)} kg
        </div>
      </div>

      <div className="calculator-score space-y-3 pt-4">
        <div className="calculator-score-header flex items-center justify-between gap-3 text-sm font-bold text-[#444444] dark:text-slate-300">
          <span>App Score</span>
          <span className="calculator-score-value text-base text-emerald-700 dark:text-emerald-300">
            {previewData.ecoScore}/100
          </span>
        </div>
        <div className="calculator-progress h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${previewData.ecoScore}%` }}
            className="calculator-progress-bar h-full rounded-full bg-[linear-gradient(90deg,#16a34a,#22d3ee)]"
          />
        </div>
      </div>

      <div className="calculator-breakdown-list mt-4 grid gap-3">
        {previewData.breakdown.map((item) => (
          <div
            key={item.name}
            className="calculator-breakdown-row flex items-center justify-between gap-4 rounded-2xl border border-[#e5e5e5] bg-[rgba(255,255,255,0.82)] px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-900/50"
          >
            <span
              className={`calculator-breakdown-label font-semibold ${
                item.isOffset
                  ? 'calculator-breakdown-label-offset text-emerald-700 dark:text-emerald-300'
                  : 'text-[#111111] dark:text-slate-100'
              }`}
            >
              {item.label}
              <small className="ml-1 text-[#666666] dark:text-slate-400">{` ${Math.round(
                item.percentage || 0
              )}%`}</small>
            </span>
            <span
              className={`calculator-breakdown-value font-extrabold ${
                item.isOffset
                  ? 'calculator-breakdown-value-offset text-emerald-700 dark:text-emerald-300'
                  : 'text-[#111111] dark:text-slate-100'
              }`}
            >
              {item.isOffset ? '-' : ''}
              {formatNumber(Math.abs(item.value))} kg
            </span>
          </div>
        ))}
      </div>
    </ResultCard>
  );
};

export default LivePreview;
