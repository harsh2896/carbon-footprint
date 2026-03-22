import React from 'react';
import ChartCard from './ChartCard';
import { PETROL_FACTOR } from '../../utils/emissionFactors';
import {
  calculatorIconBadge,
  calculatorKpiLabel,
  calculatorKpiValue,
  levelPill,
} from './tailwind';

const SummaryCard = ({
  yearlyTotal,
  averageComparison,
  treesNeeded,
  perPersonEmission,
  formatNumber,
  carbonLevel,
  basicEmission,
  advancedEmission,
}) => {
  const fuelUsed = yearlyTotal / PETROL_FACTOR;
  const aboveAverage = yearlyTotal > averageComparison;

  return (
    <ChartCard
      title="Final Summary"
      subtitle="A simple yearly view of your footprint and real-world equivalents"
    >
      <div className="calculator-summary-grid grid gap-5 xl:grid-cols-[1.2fr_0.95fr]">
        <div className="calculator-summary-hero grid gap-4">
          <p className={calculatorKpiLabel}>Yearly Footprint</p>
          <p className={calculatorKpiValue}>{formatNumber(yearlyTotal)} kg CO2</p>
          <div className="calculator-pill-row flex flex-wrap gap-2.5">
            <span className={levelPill(carbonLevel.toLowerCase())}>{carbonLevel} Carbon</span>
            <span className={levelPill('basic')}>Basic {formatNumber(basicEmission)} kg/mo</span>
            <span className={levelPill('advanced')}>
              Advanced {formatNumber(advancedEmission)} kg/mo
            </span>
          </div>
          <p className="calculator-summary-message text-sm leading-7 text-[#444444] dark:text-slate-300">
            {aboveAverage
              ? 'You are above the typical low-impact target. Small travel and energy changes will matter quickly.'
              : 'You are below the typical low-impact target. Keep reinforcing the habits that are working.'}
          </p>
        </div>

        <div className="calculator-summary-metrics grid gap-3">
          <div className="calculator-summary-metric flex items-start gap-3 rounded-3xl border border-[#e5e5e5] bg-[rgba(250,250,250,0.92)] p-4 dark:border-white/10 dark:bg-slate-900/60">
            <span className={`calculator-summary-icon ${calculatorIconBadge}`}>T</span>
            <div>
              <strong className="block text-base font-extrabold text-[#111111] dark:text-slate-50">
                {Math.ceil(treesNeeded)} trees
              </strong>
              <p className="text-sm text-[#444444] dark:text-slate-300">
                Estimated annual offset needed
              </p>
            </div>
          </div>
          <div className="calculator-summary-metric flex items-start gap-3 rounded-3xl border border-[#e5e5e5] bg-[rgba(250,250,250,0.92)] p-4 dark:border-white/10 dark:bg-slate-900/60">
            <span className={`calculator-summary-icon ${calculatorIconBadge}`}>F</span>
            <div>
              <strong className="block text-base font-extrabold text-[#111111] dark:text-slate-50">
                {formatNumber(fuelUsed)} liters
              </strong>
              <p className="text-sm text-[#444444] dark:text-slate-300">
                Approximate fuel equivalent
              </p>
            </div>
          </div>
          <div className="calculator-summary-metric flex items-start gap-3 rounded-3xl border border-[#e5e5e5] bg-[rgba(250,250,250,0.92)] p-4 dark:border-white/10 dark:bg-slate-900/60">
            <span className={`calculator-summary-icon ${calculatorIconBadge}`}>M</span>
            <div>
              <strong className="block text-base font-extrabold text-[#111111] dark:text-slate-50">
                {formatNumber(perPersonEmission)} kg / month
              </strong>
              <p className="text-sm text-[#444444] dark:text-slate-300">
                Monthly baseline footprint
              </p>
            </div>
          </div>
        </div>
      </div>
    </ChartCard>
  );
};

export default SummaryCard;
