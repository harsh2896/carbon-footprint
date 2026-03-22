import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { calculatorCard, calculatorCardGlow } from './tailwind';

const ResultCard = ({
  title,
  value,
  suffix = '',
  accent = 'text-emerald-400',
  helper,
  className = '',
  children,
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frame;
    const start = performance.now();
    const duration = 700;

    const animate = (timestamp) => {
      const progress = Math.min((timestamp - start) / duration, 1);
      setDisplayValue(value * progress);
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      className={`calculator-result-card relative overflow-hidden p-5 ${calculatorCard} ${calculatorCardGlow} ${className}`}
    >
      <p className="calculator-result-title text-[0.82rem] font-extrabold uppercase tracking-[0.2em] text-[#666666] dark:text-slate-400">{title}</p>
      <div className={`calculator-result-value mt-2 text-[clamp(2rem,3vw,3rem)] font-black tracking-[-0.06em] ${accent}`}>
        {displayValue.toLocaleString('en-IN', {
          maximumFractionDigits: 1,
        })}
        <span className="calculator-result-suffix ml-2 text-sm font-bold tracking-normal text-[#666666] dark:text-slate-400">{suffix}</span>
      </div>
      {helper ? <p className="calculator-result-helper mt-2 text-sm text-[#666666] dark:text-slate-400">{helper}</p> : null}
      {children}
    </motion.div>
  );
};

export default ResultCard;
