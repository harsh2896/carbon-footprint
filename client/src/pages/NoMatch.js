import React from 'react';
import bgImage from './assets/images/bottom-wave-blue.png';

const NoMatch = () => {
  return (
    <div className="relative flex min-h-screen items-start justify-start overflow-hidden">
      <img src={bgImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <p className="relative px-[50px] py-[50px] text-[30px] font-bold text-[var(--text-color)]">
        Oops, we couldn't find that page.
      </p>
    </div>
  );
};

export default NoMatch;
