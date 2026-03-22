import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  calculatorCard,
  calculatorCardGlow,
  calculatorIconBadge,
  calculatorSectionToggle,
} from './tailwind';

const SectionCard = ({
  title,
  subtitle,
  icon,
  isOpen,
  onToggle,
  children,
}) => (
  <motion.section
    layout
    className={`calculator-section-card relative w-full overflow-hidden p-5 ${calculatorCard} ${calculatorCardGlow}`}
    whileHover={{ y: -2 }}
  >
    <button
      type="button"
      onClick={onToggle}
      className={calculatorSectionToggle}
    >
      <div className="min-w-0 flex items-center gap-4">
        <div className={`calculator-section-icon ${calculatorIconBadge}`}>
          {icon}
        </div>
        <div className="grid gap-1">
          <h3 className="calculator-section-title text-[1.2rem] font-extrabold tracking-[-0.03em] text-[#111111] dark:text-slate-50">{title}</h3>
          <p className="calculator-section-subtitle text-sm text-[#666666] dark:text-slate-400">{subtitle}</p>
        </div>
      </div>
      <span className="calculator-section-indicator inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-xl font-bold text-emerald-700 dark:border-white/10 dark:bg-slate-900 dark:text-emerald-300">
        {isOpen ? '-' : '+'}
      </span>
    </button>
    <AnimatePresence initial={false}>
      {isOpen ? (
        <motion.div
          key="content"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.28 }}
          className="calculator-section-content overflow-hidden"
        >
          <div className="calculator-section-body w-full pt-5">{children}</div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  </motion.section>
);

export default SectionCard;
