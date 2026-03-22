import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import {
  CARBON_LIMIT,
  attachBackendIdToCurrentUser,
  buyCreditsLocally,
  calculateCreditSummary,
  getCurrentTradingUser,
  getStoredTrades,
  getStoredUsers,
  initializeTradingStorage,
  sellCreditsLocally,
  tradingApiRequest,
  upsertCurrentUser,
} from '../utils/carbonTrading';
import { DEFAULT_PRICE_PER_CREDIT } from '../utils/emissionFactors';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const PRICE_PER_CREDIT = DEFAULT_PRICE_PER_CREDIT;

const shellClasses =
  'relative z-[1] mx-auto w-[min(1280px,calc(100%-32px))] max-md:w-[min(100%-20px,1280px)]';
const glassCardClasses =
  'rounded-[28px] border border-[var(--border-color)] bg-[var(--card-color)] shadow-[0_30px_80px_var(--shadow-color)] backdrop-blur-[22px]';
const panelClasses = `${glassCardClasses} p-7 max-md:p-[22px]`;
const eyebrowClasses =
  'mb-2 text-[0.73rem] uppercase tracking-[0.22em] text-sky-300';
const mutedClasses = 'text-[var(--text-muted)]';
const buttonBaseClasses =
  'rounded-[18px] px-[18px] py-[14px] font-bold transition duration-200 hover:-translate-y-0.5 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50';
const primaryButtonClasses = `${buttonBaseClasses} bg-[linear-gradient(135deg,#4ade80,#67e8f9)] text-[#022c22] shadow-[0_16px_30px_rgba(34,197,94,0.22)]`;
const secondaryButtonClasses = `${buttonBaseClasses} border border-[var(--border-color)] bg-[var(--pill-bg)] text-[var(--text-color)]`;
const inputClasses =
  'w-full rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-[14px] text-[var(--input-text)] outline-none transition duration-200 focus:-translate-y-px focus:border-[rgba(34,197,94,0.6)]';
const miniCardClasses = `${glassCardClasses} rounded-[22px] p-[18px]`;

const getStatusClass = (status) =>
  status === 'App Saver'
    ? 'bg-[rgba(34,197,94,0.18)] text-green-300'
    : 'bg-[rgba(248,113,113,0.18)] text-rose-300';

const getToastClass = (tone) => {
  if (tone === 'warning') return 'bg-[rgba(120,53,15,0.78)]';
  if (tone === 'error') return 'bg-[rgba(127,29,29,0.78)]';
  return 'bg-[rgba(20,83,45,0.78)]';
};

const getBackendStatusClass = (tone) => {
  if (tone === 'success') return 'bg-[rgba(34,197,94,0.14)] text-green-300';
  if (tone === 'error') return 'bg-[rgba(239,68,68,0.14)] text-rose-300';
  return 'bg-[rgba(148,163,184,0.12)] text-slate-300';
};

const createToast = (message, tone = 'success') => ({
  id: Date.now() + Math.random(),
  message,
  tone,
});

const formatValue = (value) =>
  Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 1 });

const CarbonTrading = () => {
  const [users, setUsers] = useState([]);
  const [trades, setTrades] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    emission: 88,
  });
  const [sellAmount, setSellAmount] = useState(5);
  const [buyAmounts, setBuyAmounts] = useState({});
  const [toasts, setToasts] = useState([]);
  const [backendUsers, setBackendUsers] = useState([]);
  const [backendTrades, setBackendTrades] = useState([]);
  const [backendState, setBackendState] = useState({
    loading: false,
    message: 'Backend sync ready to test',
    tone: 'neutral',
  });

  const pushToast = (message, tone = 'success') => {
    const toast = createToast(message, tone);
    setToasts((prev) => [...prev, toast]);

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== toast.id));
    }, 3000);
  };

  const refreshLocalState = () => {
    setUsers(getStoredUsers());
    setTrades(getStoredTrades());
    setCurrentUser(getCurrentTradingUser());
  };

  const loadBackendData = async () => {
    setBackendState({
      loading: true,
      message: 'Loading backend marketplace data...',
      tone: 'neutral',
    });

    try {
      const [usersResponse, tradesResponse] = await Promise.all([
        tradingApiRequest('/users'),
        tradingApiRequest('/trades'),
      ]);

      setBackendUsers(usersResponse.users || []);
      setBackendTrades(tradesResponse.trades || []);
      setBackendState({
        loading: false,
        message: 'Backend connected successfully',
        tone: 'success',
      });
    } catch (error) {
      setBackendState({
        loading: false,
        message: error.message,
        tone: 'error',
      });
    }
  };

  useEffect(() => {
    initializeTradingStorage();
    refreshLocalState();
    loadBackendData();
  }, []);

  const creditSummary = useMemo(
    () => calculateCreditSummary(form.emission),
    [form.emission]
  );

  const marketplaceSellers = useMemo(
    () =>
      users
        .filter((user) => user.id !== currentUser?.id)
        .sort((a, b) => b.credits - a.credits),
    [currentUser?.id, users]
  );

  const leaderboard = useMemo(
    () =>
      [...users]
        .sort((a, b) => {
          if (b.credits !== a.credits) return b.credits - a.credits;
          return a.emission - b.emission;
        })
        .slice(0, 5),
    [users]
  );

  const marketChartData = useMemo(
    () => ({
      labels: leaderboard.map((user) => user.name.split(' ')[0]),
      datasets: [
        {
          label: 'Credits',
          data: leaderboard.map((user) => user.credits),
          backgroundColor: 'rgba(34, 197, 94, 0.72)',
          borderRadius: 14,
        },
        {
          label: 'Emission',
          data: leaderboard.map((user) => user.emission),
          backgroundColor: 'rgba(56, 189, 248, 0.58)',
          borderRadius: 14,
        },
      ],
    }),
    [leaderboard]
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#e2e8f0',
          },
        },
        tooltip: {
          backgroundColor: 'rgba(2, 6, 23, 0.96)',
          borderColor: 'rgba(148, 163, 184, 0.18)',
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          ticks: { color: '#cbd5e1' },
          grid: { color: 'rgba(148, 163, 184, 0.08)' },
        },
        y: {
          ticks: { color: '#94a3b8' },
          grid: { color: 'rgba(148, 163, 184, 0.08)' },
        },
      },
    }),
    []
  );

  const handleCreateWallet = async (event) => {
    event.preventDefault();

    const { user, summary } = upsertCurrentUser(form);
    refreshLocalState();
    pushToast('Wallet updated in local marketplace storage.');

    try {
      const response = await tradingApiRequest('/user', {
        method: 'POST',
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          carbonEmission: user.emission,
        }),
      });

      const syncedUser = attachBackendIdToCurrentUser(response.user.id);
      setCurrentUser(syncedUser);
      await loadBackendData();
      pushToast('Wallet synced to backend database.');
    } catch (error) {
      setBackendState({
        loading: false,
        message: error.message,
        tone: 'error',
      });
      pushToast(`Local wallet saved. Backend sync skipped: ${error.message}`, 'warning');
    }

    if (summary.status === 'App Saver') {
      pushToast(`You earned ${summary.credits} app credits in the demo marketplace.`);
    } else {
      pushToast(`You need ${summary.creditsNeeded} app credits to reach the demo baseline.`, 'warning');
    }
  };

  const handleBuyCredits = async (sellerId) => {
    if (!currentUser) {
      pushToast('Create your wallet before buying app credits.', 'warning');
      return;
    }

    const creditsToBuy = Number(buyAmounts[sellerId] || 1);

    try {
      const { buyer } = buyCreditsLocally({
        sellerId,
        buyerId: currentUser.id,
        credits: creditsToBuy,
        pricePerCredit: PRICE_PER_CREDIT,
      });

      refreshLocalState();
      pushToast(`Purchased ${creditsToBuy} app credits from the marketplace.`);

      const seller = getStoredUsers().find((user) => user.id === sellerId);

      if (seller?.backendId && buyer?.backendId) {
        await tradingApiRequest('/buy', {
          method: 'POST',
          body: JSON.stringify({
            sellerId: seller.backendId,
            buyerId: buyer.backendId,
            credits: creditsToBuy,
            price: creditsToBuy * PRICE_PER_CREDIT,
          }),
        });

        await loadBackendData();
      }
    } catch (error) {
      pushToast(error.message, 'error');
    }
  };

  const handleSellCredits = async () => {
    try {
      const { user } = sellCreditsLocally({ credits: sellAmount });
      refreshLocalState();
      pushToast(`${sellAmount} app credits added to your marketplace wallet.`);

      if (user?.backendId) {
        await tradingApiRequest('/sell', {
          method: 'POST',
          body: JSON.stringify({
            userId: user.backendId,
            credits: Number(sellAmount),
            carbonEmission: user.emission,
          }),
        });

        await loadBackendData();
      }
    } catch (error) {
      pushToast(error.message, 'error');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg-color)] pb-[60px] pt-[110px] text-[var(--text-color)] max-md:pt-[94px]">
      <div className="pointer-events-none fixed inset-0 -z-[2] bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.22),transparent_30%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_28%),var(--bg-accent)]" />
      <div className="pointer-events-none fixed inset-0 -z-[1] bg-[linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[length:64px_64px] opacity-25" />

      <section className="fixed right-[18px] top-[88px] z-[60] grid gap-[10px] max-md:left-[10px] max-md:right-[10px]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`max-w-[360px] rounded-2xl border border-white/10 px-4 py-[14px] shadow-[0_16px_32px_rgba(0,0,0,0.24)] backdrop-blur-[16px] max-md:max-w-none ${getToastClass(
              toast.tone
            )}`}
          >
            {toast.message}
          </div>
        ))}
      </section>

      <div className={shellClasses}>
        <motion.section
          className={`${glassCardClasses} mb-6 grid gap-6 p-7 md:grid-cols-[1.65fr_0.85fr] max-md:p-[22px]`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div>
            <p className={eyebrowClasses}>App Credit Trading System</p>
            <h1 className="m-0 text-[clamp(2rem,4vw,3.8rem)] leading-[1.05]">
              Trade emissions like a beginner-friendly carbon marketplace.
            </h1>
            <p className={`max-w-[62ch] ${mutedClasses}`}>
              Phase 1 calculates app credits from your footprint, Phase 2 runs a live
              browser marketplace with localStorage, and Phase 3 mirrors the flow
              through Express and MongoDB.
            </p>
          </div>

          <div className="flex flex-col justify-between rounded-3xl bg-[linear-gradient(160deg,rgba(34,197,94,0.2),rgba(8,47,73,0.5))] p-6">
            <span className="text-[0.88rem] text-[var(--text-soft)]">Wallet Balance</span>
            <strong className="text-[2rem]">
              {formatValue(currentUser?.credits || 0)} app credits
            </strong>
            <p className={mutedClasses}>App credit baseline fixed at {CARBON_LIMIT} for every user.</p>
          </div>
        </motion.section>

        <section className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
          <div className="grid content-start gap-6">
            <div className={panelClasses}>
              <div className="mb-[22px] flex items-center justify-between gap-[18px] max-md:flex-col max-md:items-start">
                <div>
                  <p className={eyebrowClasses}>Phase 1</p>
                  <h2 className="m-0">App Credit Calculation</h2>
                </div>
                <span className={`inline-flex items-center rounded-full px-[14px] py-[10px] text-[0.82rem] font-bold tracking-[0.03em] ${getStatusClass(creditSummary.status)}`}>
                  {creditSummary.status}
                </span>
              </div>

              <form className="grid gap-5" onSubmit={handleCreateWallet}>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-[10px] text-[var(--text-color)]">
                    <span>Name</span>
                    <input type="text" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Enter your name" required className={inputClasses} />
                  </label>
                  <label className="grid gap-[10px] text-[var(--text-color)]">
                    <span>Email</span>
                    <input type="email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} placeholder="Enter your email" required className={inputClasses} />
                  </label>
                  <label className="grid gap-[10px] text-[var(--text-color)] md:col-span-2">
                    <span>Carbon Emission</span>
                    <input type="range" min="0" max="200" value={form.emission} onChange={(event) => setForm((prev) => ({ ...prev, emission: event.target.value }))} className="w-full accent-emerald-400" />
                    <div className="flex justify-between gap-4 text-[0.92rem] text-[var(--text-muted)] max-md:flex-col max-md:items-start">
                      <strong>{formatValue(form.emission)} emission units</strong>
                      <span>Move the slider to calculate app credits instantly</span>
                    </div>
                  </label>
                </div>

                <div className="my-[22px] grid gap-4 md:grid-cols-2">
                  <div className={miniCardClasses}><span className="text-[0.88rem] text-[var(--text-soft)]">User Emission</span><strong className="mt-1.5 block text-[1.3rem] text-[var(--text-color)]">{formatValue(creditSummary.carbonEmission)}</strong></div>
                  <div className={miniCardClasses}><span className="text-[0.88rem] text-[var(--text-soft)]">Carbon Limit</span><strong className="mt-1.5 block text-[1.3rem] text-[var(--text-color)]">{formatValue(creditSummary.carbonLimit)}</strong></div>
                  <div className={miniCardClasses}><span className="text-[0.88rem] text-[var(--text-soft)]">App Credits Earned</span><strong className="mt-1.5 block text-[1.3rem] text-[var(--text-color)]">{formatValue(creditSummary.credits)}</strong></div>
                  <div className={miniCardClasses}><span className="text-[0.88rem] text-[var(--text-soft)]">App Credits Needed</span><strong className="mt-1.5 block text-[1.3rem] text-[var(--text-color)]">{formatValue(creditSummary.creditsNeeded)}</strong></div>
                </div>

                <button type="submit" className={primaryButtonClasses}>Save Wallet And Sync Marketplace</button>
              </form>
            </div>

            <div className={panelClasses}>
              <div className="mb-[22px] flex items-center justify-between gap-[18px] max-md:flex-col max-md:items-start">
                <div>
                  <p className={eyebrowClasses}>Phase 2</p>
                  <h2 className="m-0">App Credit Marketplace</h2>
                </div>
                <button type="button" className={secondaryButtonClasses} onClick={loadBackendData}>Refresh Backend Data</button>
              </div>

              <div className="grid gap-[18px] xl:grid-cols-2">
                {marketplaceSellers.map((seller) => (
                  <div className={`${glassCardClasses} rounded-3xl p-5`} key={seller.id}>
                    <div className="flex items-center justify-between gap-[14px] max-md:flex-col max-md:items-start">
                      <div>
                        <h3 className="m-0">{seller.name}</h3>
                        <p className={mutedClasses}>{seller.email}</p>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-[14px] py-[10px] text-[0.82rem] font-bold tracking-[0.03em] ${getStatusClass(seller.status || 'App Saver')}`}>{seller.status || 'App Saver'}</span>
                    </div>
                    <div className="my-[18px] grid gap-4 md:grid-cols-3">
                      <div><span className="text-[0.88rem] text-[var(--text-soft)]">Emission</span><strong className="mt-1.5 block text-[1.3rem] text-[var(--text-color)]">{formatValue(seller.emission)}</strong></div>
                      <div><span className="text-[0.88rem] text-[var(--text-soft)]">Available App Credits</span><strong className="mt-1.5 block text-[1.3rem] text-[var(--text-color)]">{formatValue(seller.credits)}</strong></div>
                      <div><span className="text-[0.88rem] text-[var(--text-soft)]">Price</span><strong className="mt-1.5 block text-[1.3rem] text-[var(--text-color)]">Rs. {PRICE_PER_CREDIT}/app credit</strong></div>
                    </div>
                    <div className="flex items-center justify-between gap-[14px] max-md:flex-col max-md:items-start">
                      <input type="number" min="1" max={Math.max(1, seller.credits)} value={buyAmounts[seller.id] || 1} onChange={(event) => setBuyAmounts((prev) => ({ ...prev, [seller.id]: event.target.value }))} className={inputClasses} />
                      <button type="button" className={`${primaryButtonClasses} w-full md:w-auto`} onClick={() => handleBuyCredits(seller.id)} disabled={seller.credits <= 0}>Buy App Credits</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between gap-[14px] max-md:flex-col max-md:items-start">
                <div>
                  <p className={eyebrowClasses}>Sell App Credits</p>
                  <h3 className="m-0">Add more app credits to your wallet for marketplace trading.</h3>
                </div>
                <div className="flex items-center justify-between gap-[14px] max-md:w-full max-md:flex-col max-md:items-start">
                  <input type="number" min="1" value={sellAmount} onChange={(event) => setSellAmount(event.target.value)} className={inputClasses} />
                  <button type="button" className={`${secondaryButtonClasses} w-full md:w-auto`} onClick={handleSellCredits}>Sell App Credits</button>
                </div>
              </div>
            </div>

            <div className={panelClasses}>
              <div className="mb-[22px]">
                <p className={eyebrowClasses}>History</p>
                <h2 className="m-0">Transaction History</h2>
              </div>
              <div className="overflow-hidden rounded-[22px] border border-[rgba(148,163,184,0.12)]">
                <div className="grid gap-[14px] bg-[color:color-mix(in_srgb,var(--card-solid)_90%,transparent)] px-[18px] py-4 font-bold md:grid-cols-[1.1fr_1.1fr_0.6fr_0.8fr_1.2fr]">
                  <span className="text-[0.88rem] text-[var(--text-soft)]">Seller</span>
                  <span className="text-[0.88rem] text-[var(--text-soft)]">Buyer</span>
                  <span className="text-[0.88rem] text-[var(--text-soft)]">App Credits</span>
                  <span className="text-[0.88rem] text-[var(--text-soft)]">Price</span>
                  <span className="text-[0.88rem] text-[var(--text-soft)]">Date</span>
                </div>
                {trades.length ? trades.map((trade) => {
                  const seller = users.find((user) => user.id === trade.sellerId);
                  const buyer = users.find((user) => user.id === trade.buyerId);
                  return (
                    <div className="grid gap-[14px] border-t border-[var(--border-color)] px-[18px] py-4 text-[var(--text-color)] md:grid-cols-[1.1fr_1.1fr_0.6fr_0.8fr_1.2fr]" key={trade.id}>
                      <span>{seller?.name || 'Unknown Seller'}</span>
                      <span>{buyer?.name || 'Unknown Buyer'}</span>
                      <span>{trade.credits}</span>
                      <span>Rs. {formatValue(trade.price)}</span>
                      <span>{new Date(trade.date).toLocaleString()}</span>
                    </div>
                  );
                }) : <div className="rounded-[18px] bg-[color:color-mix(in_srgb,var(--card-solid)_84%,transparent)] p-[18px] text-center text-[var(--text-muted)]">No local trades yet. Buy app credits to populate the transaction history.</div>}
              </div>
            </div>
          </div>

          <div className="grid content-start gap-6">
            <div className={panelClasses}>
              <div className="mb-[22px]">
                <p className={eyebrowClasses}>Wallet</p>
                <h2 className="m-0">Current User</h2>
              </div>
              {currentUser ? (
                <div className="grid gap-[14px]">
                  <div><h3 className="m-0">{currentUser.name}</h3><p className={mutedClasses}>{currentUser.email}</p></div>
                  <div className="my-[22px] grid gap-4 md:grid-cols-2">
                    <div><span className="text-[0.88rem] text-[var(--text-soft)]">Emission</span><strong className="mt-1.5 block text-[1.3rem] text-[var(--text-color)]">{formatValue(currentUser.emission)}</strong></div>
                    <div><span className="text-[0.88rem] text-[var(--text-soft)]">App Credits</span><strong className="mt-1.5 block text-[1.3rem] text-[var(--text-color)]">{formatValue(currentUser.credits)}</strong></div>
                    <div><span className="text-[0.88rem] text-[var(--text-soft)]">Status</span><strong className="mt-1.5 block text-[1.3rem] text-[var(--text-color)]">{currentUser.status}</strong></div>
                    <div><span className="text-[0.88rem] text-[var(--text-soft)]">Backend Sync</span><strong className="mt-1.5 block text-[1.3rem] text-[var(--text-color)]">{currentUser.backendId ? 'Connected' : 'Local Only'}</strong></div>
                  </div>
                </div>
              ) : <div className="rounded-[18px] bg-[color:color-mix(in_srgb,var(--card-solid)_84%,transparent)] p-[18px] text-center text-[var(--text-muted)]">Create a wallet to start trading app credits.</div>}
            </div>

            <div className={panelClasses}>
              <div className="mb-[22px]">
                <p className={eyebrowClasses}>Bonus</p>
                  <h2 className="m-0">App Credit Leaderboard</h2>
              </div>
              <div className="grid gap-[14px]">
                {leaderboard.map((user, index) => (
                  <div className="flex gap-[14px] rounded-[20px] bg-[color:color-mix(in_srgb,var(--card-solid)_84%,transparent)] p-4" key={user.id}>
                    <span className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#fde68a,#4ade80)] font-extrabold text-[#022c22]">#{index + 1}</span>
                    <div><strong>{user.name}</strong><p className={mutedClasses}>{formatValue(user.credits)} app credits | {formatValue(user.emission)} emission</p></div>
                  </div>
                ))}
              </div>
              <div className="mt-[18px] h-80">
                <Bar data={marketChartData} options={chartOptions} />
              </div>
            </div>

            <div className={panelClasses}>
              <div className="mb-[22px]">
                <p className={eyebrowClasses}>Phase 3</p>
                <h2 className="m-0">Backend Status</h2>
              </div>
              <div className={`mb-[18px] rounded-2xl px-4 py-[14px] font-semibold ${getBackendStatusClass(backendState.tone)}`}>
                {backendState.loading ? 'Syncing...' : backendState.message}
              </div>
              <div className="my-[22px] grid gap-4 md:grid-cols-2">
                <div className={miniCardClasses}><span className="text-[0.88rem] text-[var(--text-soft)]">Mongo Users</span><strong className="mt-1.5 block text-[1.3rem] text-[var(--text-color)]">{backendUsers.length}</strong></div>
                <div className={miniCardClasses}><span className="text-[0.88rem] text-[var(--text-soft)]">Mongo Trades</span><strong className="mt-1.5 block text-[1.3rem] text-[var(--text-color)]">{backendTrades.length}</strong></div>
              </div>
              <div className="grid gap-[14px]">
                {backendTrades.slice(0, 5).map((trade) => (
                  <div className="flex gap-[14px] rounded-[20px] bg-[color:color-mix(in_srgb,var(--card-solid)_84%,transparent)] p-4" key={trade._id}>
                    <div>
                      <strong>{trade.sellerId?.name || 'Seller'} to {trade.buyerId?.name || 'Buyer'}</strong>
                      <p className={mutedClasses}>{trade.credits} app credits | Rs. {formatValue(trade.price)} | {new Date(trade.date).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                {!backendTrades.length && <div className="rounded-[18px] bg-[color:color-mix(in_srgb,var(--card-solid)_84%,transparent)] p-[18px] text-center text-[var(--text-muted)]">No backend trades yet or the API is not running.</div>}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CarbonTrading;
