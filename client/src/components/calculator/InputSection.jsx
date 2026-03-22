import React from 'react';
import SectionCard from './SectionCard';
import { levelPill } from './tailwind';

const InputSection = ({
  title,
  subtitle,
  icon,
  isOpen,
  onToggle,
  badge,
  children,
}) => (
  <div className="calculator-input-section w-full">
    <SectionCard
      title={title}
      subtitle={subtitle}
      icon={icon}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      {badge ? <div className={`calculator-section-badge mb-4 ${levelPill('advanced')}`}>{badge}</div> : null}
      {children}
    </SectionCard>
  </div>
);

export default InputSection;
