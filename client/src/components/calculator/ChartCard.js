import React from 'react';
import { motion } from 'framer-motion';
import { calculatorCard, calculatorCardGlow } from './tailwind';

const ChartCard = ({ title, subtitle, children, className = '', bodyClassName = '' }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className={`calculator-chart-card relative overflow-hidden p-5 ${calculatorCard} ${calculatorCardGlow} ${className}`}
  >
    <div className="calculator-chart-card-header mb-4">
      <h3 className="calculator-chart-card-title text-[1.18rem] font-extrabold tracking-[-0.03em] text-[#111111] dark:text-slate-50">{title}</h3>
      <p className="calculator-chart-card-subtitle text-sm text-[#666666] dark:text-slate-400">{subtitle}</p>
    </div>
    <div className={`calculator-chart-card-body min-h-0 ${bodyClassName}`}>{children}</div>
  </motion.div>
);

export default ChartCard;
