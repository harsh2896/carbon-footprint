export const calculatorCard =
  'rounded-[28px] border border-[rgba(229,229,229,0.78)] bg-[rgba(255,255,255,0.96)] shadow-[0_14px_30px_rgba(15,23,42,0.08)] backdrop-blur-[18px] text-[#111111] dark:border-white/10 dark:bg-[rgba(15,23,42,0.88)] dark:text-slate-50';

export const calculatorSoftCard =
  'rounded-[20px] border border-[rgba(229,229,229,0.82)] bg-[rgba(255,255,255,0.94)] shadow-[0_10px_20px_rgba(15,23,42,0.06)] backdrop-blur-[14px] dark:border-white/10 dark:bg-[rgba(30,41,59,0.82)]';

export const calculatorCardGlow =
  'before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-white/50 before:opacity-70 before:content-[\'\'] after:pointer-events-none after:absolute after:inset-px after:rounded-[inherit] after:bg-[linear-gradient(135deg,rgba(255,255,255,0.28),transparent_46%)] after:content-[\'\'] dark:before:border-white/10 dark:after:bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_46%)]';

export const calculatorSectionToggle =
  'flex w-full items-center justify-between gap-4 rounded-[24px] text-left';

export const calculatorControl =
  'calculator-control w-full rounded-2xl border border-[#e5e5e5] bg-[rgba(250,250,250,0.96)] px-4 py-3.5 text-[15px] text-[#111111] shadow-[0_1px_0_rgba(255,255,255,0.6)] outline-none transition duration-200 placeholder:text-[#666666] hover:border-[#d4d4d4] focus:border-emerald-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(34,197,94,0.12)] dark:border-white/10 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-400 dark:hover:border-white/20 dark:focus:bg-slate-950';

export const calculatorRange =
  `${calculatorControl} calculator-range h-3 cursor-pointer appearance-none rounded-full bg-[linear-gradient(90deg,rgba(34,197,94,0.18),rgba(34,211,238,0.22))] px-0 py-0`;

export const calculatorPrimaryButton =
  'calculator-button calculator-button-primary inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#16a34a,#22c55e)] px-5 py-3.5 font-bold text-white shadow-[0_12px_24px_rgba(34,197,94,0.2)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(34,197,94,0.26)]';

export const calculatorSecondaryButton =
  'calculator-button calculator-button-secondary inline-flex items-center justify-center gap-2 rounded-2xl border border-[#e5e5e5] bg-white px-5 py-3.5 font-bold text-[#111111] shadow-[0_10px_20px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#fafafa] dark:border-white/10 dark:bg-slate-900 dark:text-slate-50 dark:hover:bg-slate-800';

export const calculatorLinkButton = `${calculatorPrimaryButton} calculator-link-button no-underline`;

export const calculatorIconBadge =
  'inline-flex h-11 w-11 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,#0f5c38,#34d399)] text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(16,185,129,0.22)]';

export const calculatorFieldShell =
  'grid gap-3 rounded-3xl border border-[#e5e5e5] bg-[rgba(255,255,255,0.78)] p-4 shadow-[0_10px_20px_rgba(15,23,42,0.06)] transition duration-200 dark:border-white/10 dark:bg-[rgba(15,23,42,0.5)]';

export const calculatorKpiLabel =
  'calculator-kpi-label text-[0.75rem] font-extrabold uppercase tracking-[0.22em] text-[#666666] dark:text-slate-400';

export const calculatorKpiValue =
  'calculator-kpi-value text-[clamp(1.8rem,3vw,2.6rem)] font-black tracking-[-0.04em] text-[#111111] dark:text-slate-50';

export const levelPillBase =
  'calculator-level-pill inline-flex items-center rounded-full px-3.5 py-2 text-[0.83rem] font-bold';

export const levelPill = (tone) => {
  if (tone === 'low') return `${levelPillBase} calculator-level-low bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300`;
  if (tone === 'medium') return `${levelPillBase} calculator-level-medium bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300`;
  if (tone === 'high') return `${levelPillBase} calculator-level-high bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300`;
  if (tone === 'basic') return `${levelPillBase} calculator-level-basic bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300`;
  if (tone === 'advanced') return `${levelPillBase} calculator-level-advanced bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300`;
  return `${levelPillBase} bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300`;
};

export const calculatorTrend = (direction) => {
  if (direction === 'up') return 'calculator-trend calculator-trend-up rounded-full bg-rose-100 px-3 py-1.5 text-sm font-bold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300';
  if (direction === 'down') return 'calculator-trend calculator-trend-down rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300';
  return 'calculator-trend calculator-trend-steady rounded-full bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-700 dark:bg-slate-500/15 dark:text-slate-300';
};
