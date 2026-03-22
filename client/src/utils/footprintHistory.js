const FOOTPRINT_HISTORY_KEY = 'carbon-footprint-history-v1';
const FOOTPRINT_GOAL_KEY = 'carbon-footprint-goal-v1';
const MAX_HISTORY_RECORDS = 365;

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.warn('Unable to parse footprint history storage', error);
    return fallback;
  }
};

const normalizeValue = (value) => Number((value || 0).toFixed(2));

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage);

export const getFootprintHistory = () => {
  if (!canUseStorage()) return [];

  const records = safeParse(window.localStorage.getItem(FOOTPRINT_HISTORY_KEY), []);

  return Array.isArray(records)
    ? records
        .filter((record) => record?.timestamp)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    : [];
};

export const createFootprintHistoryRecord = (form, results) => {
  const transport = normalizeValue(
    results.monthlyBreakdown.vehicle +
      results.transportMeta.publicTransit +
      results.monthlyBreakdown.flight
  );
  const electricity = normalizeValue(results.monthlyBreakdown.electricity);
  const water = normalizeValue(results.monthlyBreakdown.water);
  const food = normalizeValue(results.monthlyBreakdown.food + results.monthlyBreakdown.lpg);
  const lifestyle = normalizeValue(results.monthlyBreakdown.shopping);
  const advanced = {
    digital: normalizeValue(results.monthlyBreakdown.digital),
    pets: normalizeValue(results.monthlyBreakdown.pets),
    work: normalizeValue(results.monthlyBreakdown.work),
    greenActions: normalizeValue(results.monthlyBreakdown.greenActions),
    homeInfrastructure: normalizeValue(results.monthlyBreakdown.homeInfrastructure),
  };

  const advancedTotal = normalizeValue(
    advanced.digital +
      advanced.pets +
      advanced.work +
      advanced.greenActions +
      advanced.homeInfrastructure
  );

  return {
    id: `footprint-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    total: normalizeValue(results.monthlyTotal ?? results.totalEmission ?? 0),
    categories: {
      transport,
      electricity,
      water,
      food,
      lifestyle,
      advanced: advancedTotal,
    },
    breakdown: {
      vehicle: normalizeValue(results.monthlyBreakdown.vehicle),
      publicTransit: normalizeValue(results.transportMeta.publicTransit),
      flight: normalizeValue(results.monthlyBreakdown.flight),
      electricity,
      water,
      food: normalizeValue(results.monthlyBreakdown.food),
      shopping: normalizeValue(results.monthlyBreakdown.shopping),
      lpg: normalizeValue(results.monthlyBreakdown.lpg),
      digital: advanced.digital,
      pets: advanced.pets,
      work: advanced.work,
      greenActions: advanced.greenActions,
      homeInfrastructure: advanced.homeInfrastructure,
    },
    advanced,
    period: form?.period || 'monthly',
  };
};

export const saveFootprintHistoryRecord = (form, results) => {
  if (!canUseStorage()) return null;

  const record = createFootprintHistoryRecord(form, results);
  const nextRecords = [...getFootprintHistory(), record].slice(-MAX_HISTORY_RECORDS);

  window.localStorage.setItem(FOOTPRINT_HISTORY_KEY, JSON.stringify(nextRecords));

  return record;
};

export const getFootprintGoal = () => {
  if (!canUseStorage()) return 20;

  const saved = Number(window.localStorage.getItem(FOOTPRINT_GOAL_KEY));
  return Number.isFinite(saved) && saved >= 1 ? saved : 20;
};

export const saveFootprintGoal = (value) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(FOOTPRINT_GOAL_KEY, String(value));
};
