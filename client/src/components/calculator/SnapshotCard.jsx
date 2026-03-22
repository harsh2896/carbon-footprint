import React from 'react';
import ChartCard from './ChartCard';
import { calculatorKpiLabel, calculatorKpiValue, calculatorTrend } from './tailwind';

const SnapshotCard = ({ monthlyTotal, snapshot, snapshotBars, formatNumber }) => {
  const previous = snapshot?.previousMonthlyTotal ?? monthlyTotal;
  const delta = monthlyTotal - previous;
  const deltaPercent = previous ? Math.abs((delta / previous) * 100) : 0;
  const direction = delta > 2 ? 'up' : delta < -2 ? 'down' : 'steady';

  return (
    <ChartCard
      title="Monthly Snapshot"
      subtitle="Your latest monthly footprint and how each category contributes"
    >
      <div className="calculator-snapshot grid gap-4">
        <div className="calculator-snapshot-top flex items-start justify-between gap-4">
          <div>
            <p className={calculatorKpiLabel}>This Month</p>
            <p className={calculatorKpiValue}>{formatNumber(monthlyTotal)} kg CO2</p>
          </div>
          <div className={calculatorTrend(direction)}>
            {direction === 'up' && `+${formatNumber(deltaPercent)}% vs last snapshot`}
            {direction === 'down' && `-${formatNumber(deltaPercent)}% vs last snapshot`}
            {direction === 'steady' && 'Stable vs last snapshot'}
          </div>
        </div>

        <div className="calculator-mini-bars grid gap-3">
          {snapshotBars.map((item) => (
            <div key={item.name} className="calculator-mini-bar-row grid gap-1.5">
              <div className="calculator-mini-bar-meta flex items-center justify-between gap-3 text-sm font-semibold text-[#444444] dark:text-slate-300">
                <span>{item.label}</span>
                <span>{item.share}%</span>
              </div>
              <div className="calculator-mini-bar-track h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="calculator-mini-bar-fill h-full rounded-full bg-[linear-gradient(90deg,#16a34a,#34d399)]"
                  style={{ width: `${Math.max(item.share, 4)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
};

export default SnapshotCard;
