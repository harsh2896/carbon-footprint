import React from 'react';
import { useQuery } from '@apollo/client';
import { LEADERBOARD_QUERY } from '../utils/queries';
import { addCommas } from '../utils/helpers';

const rankMeta = [
  { label: 'Gold', emoji: 'ðŸ¥‡', className: 'rank-1' },
  { label: 'Silver', emoji: 'ðŸ¥ˆ', className: 'rank-2' },
  { label: 'Bronze', emoji: 'ðŸ¥‰', className: 'rank-3' },
];

const Leaderboard = () => {
  const { loading, data } = useQuery(LEADERBOARD_QUERY, {
    pollInterval: 10000,
  });
  const leaders = data?.leaderboard || [];

  if (loading) {
    return <h2 className="py-28 text-center text-[var(--text-muted)]">Loading leaderboard...</h2>;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(52,211,153,0.08),transparent_25%),linear-gradient(180deg,color-mix(in_srgb,var(--bg-color)_92%,#eff6ff),var(--bg-color))] px-5 pb-[60px] pt-[100px] text-[var(--text-color)]">
      <div className="mx-auto w-full max-w-[820px] rounded-[20px] bg-[var(--card-color)] px-5 py-[30px] shadow-[0_12px_30px_var(--shadow-color)] md:px-8 md:py-10">
        <h1 className="mb-2.5 text-center text-[2.4rem] font-bold">Eco Leaderboard</h1>
        <p className="mb-[30px] text-center text-[var(--text-muted)]">
          Top 10 users with the lowest carbon footprint.
        </p>
        <div className="flex flex-col gap-4">
          {leaders.length ? (
            leaders.map((user, index) => {
              const rankInfo = rankMeta[index];
              const rankClasses =
                index === 0
                  ? 'border-[rgba(244,197,66,0.6)] bg-[rgba(244,197,66,0.12)]'
                  : index === 1
                    ? 'border-[rgba(192,192,192,0.7)] bg-[rgba(192,192,192,0.15)]'
                    : index === 2
                      ? 'border-[rgba(205,127,50,0.6)] bg-[rgba(205,127,50,0.12)]'
                      : 'border-[var(--border-color)] bg-[color:color-mix(in_srgb,var(--card-color)_94%,var(--bg-color))]';

              return (
                <div
                  key={user._id}
                  className={`flex flex-col items-start justify-between gap-2 rounded-[14px] border px-5 py-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_18px_var(--shadow-color)] md:flex-row md:items-center ${rankClasses}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 text-[1.2rem] font-bold text-[var(--text-color)]">{index + 1}</span>
                    {rankInfo ? (
                      <span className="rounded-full bg-[color:color-mix(in_srgb,var(--primary-green)_15%,transparent)] px-3 py-1.5 text-[0.95rem] font-bold text-[var(--text-color)]">
                        {rankInfo.emoji} {rankInfo.label}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-col items-start md:items-end">
                    <span className="text-[1.1rem] font-bold text-[var(--text-color)]">{user.username}</span>
                    <span className="text-[0.95rem] text-[var(--text-muted)]">
                      {addCommas(user.carbonFootprint || 0)} kg CO2
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-[var(--text-muted)]">No data yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
