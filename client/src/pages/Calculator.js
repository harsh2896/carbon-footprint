import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ResponsiveContainer } from 'recharts/es6/component/ResponsiveContainer';
import { Tooltip } from 'recharts/es6/component/Tooltip';
import { Cell } from 'recharts/es6/component/Cell';
import { PieChart } from 'recharts/es6/chart/PieChart';
import { Pie } from 'recharts/es6/polar/Pie';
import { BarChart } from 'recharts/es6/chart/BarChart';
import { Bar } from 'recharts/es6/cartesian/Bar';
import { XAxis } from 'recharts/es6/cartesian/XAxis';
import { YAxis } from 'recharts/es6/cartesian/YAxis';
import { CartesianGrid } from 'recharts/es6/cartesian/CartesianGrid';
import { Sector } from 'recharts/es6/shape/Sector';
import { useMutation } from '@apollo/client';
import InputSection from '../components/calculator/InputSection';
import InputField from '../components/calculator/InputField';
import TransportEntry from '../components/calculator/TransportEntry';
import ChartCard from '../components/calculator/ChartCard';
import LivePreview from '../components/calculator/LivePreview';
import SnapshotCard from '../components/calculator/SnapshotCard';
import SummaryCard from '../components/calculator/SummaryCard';
import AISuggestions from '../components/calculator/AISuggestions';
import { ADD_TRAVEL, ADD_HOME, SAVE_FOOTPRINT } from '../utils/mutations';
import { QUERY_ME } from '../utils/queries';
import Auth from '../utils/auth';
import { getRuleSuggestions } from '../utils/aiRules';
import { fetchAISuggestions } from '../utils/aiClient';
import { INDIA_STATES, calculateFootprint } from '../utils/calculate';
import { saveFootprintHistoryRecord } from '../utils/footprintHistory';
import {
  calculatorControl,
  calculatorIconBadge,
  calculatorLinkButton,
  calculatorPrimaryButton,
  calculatorSecondaryButton,
  calculatorSoftCard,
} from '../components/calculator/tailwind';

const STORAGE_KEY = 'restored-carbon-calculator';
const SNAPSHOT_KEY = 'restored-carbon-calculator-snapshot';
const pageClasses =
  'calculator-page relative min-h-screen overflow-hidden px-6 pb-14 pt-[34px] text-[#111111] dark:text-slate-50';
const containerClasses =
  'calculator-container relative z-[1] mx-auto max-w-[1380px]';
const shellClasses = 'calculator-shell flex flex-col gap-8';
const fieldGridTwo =
  'calculator-field-grid calculator-two-column-grid grid w-full grid-cols-1 gap-6 md:grid-cols-2';
const fieldGridThree =
  'calculator-field-grid calculator-three-column-grid grid w-full grid-cols-1 gap-6 md:grid-cols-2';
const controlInputClass = `${calculatorControl} calculator-input`;
const controlSelectClass = `${calculatorControl} calculator-select`;
const authCardClasses =
  'calculator-auth-card mx-auto mt-10 max-w-[560px] rounded-[32px] border border-[#e5e5e5] bg-[rgba(255,255,255,0.96)] p-8 text-center shadow-[0_18px_36px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/85';
const headerClasses = 'calculator-header mx-auto max-w-[860px] text-center';
const eyebrowClasses =
  'calculator-eyebrow mb-[14px] inline-flex items-center justify-center gap-[10px] rounded-full border border-emerald-200 bg-[linear-gradient(135deg,#0f5c38_0%,#1f8f57_45%,#34d399_100%)] px-[18px] py-[10px] text-[0.84rem] font-extrabold uppercase tracking-[0.24em] text-white shadow-[0_14px_30px_rgba(16,185,129,0.22)] transition duration-200 hover:-translate-y-px hover:scale-[1.03]';
const headingShellClasses = 'calculator-heading-shell grid justify-items-center gap-[14px]';
const headingClasses =
  'calculator-heading-gradient inline-block bg-[linear-gradient(135deg,#0f3d24_0%,#22c55e_34%,#7dffb3_62%,#22d3ee_100%)] bg-clip-text px-[0.08em] pb-[0.14em] text-[clamp(3.5rem,6.2vw,6rem)] font-black leading-[0.95] tracking-[-0.06em] text-transparent';
const headingUnderlineClasses =
  'calculator-heading-underline h-1.5 w-[min(280px,48vw)] rounded-full bg-[linear-gradient(90deg,rgba(20,83,45,0.04)_0%,#22c55e_26%,#7dffb3_60%,#22d3ee_100%)] shadow-[0_0_18px_rgba(74,222,128,0.18)]';
const ecoBadgeClasses =
  'calculator-eco-badge mx-auto mt-[22px] grid w-[min(100%,420px)] grid-cols-[auto_auto] items-center justify-center gap-x-5 gap-y-4 rounded-[26px] border border-white/10 bg-[linear-gradient(135deg,rgba(24,29,37,0.96),rgba(33,40,51,0.94))] px-5 py-[18px] text-white';
const toolbarClasses = 'calculator-toolbar flex flex-wrap items-center justify-between gap-4';
const toggleGroupClasses =
  'calculator-toggle-group inline-flex flex-wrap gap-3 rounded-[24px] border border-[#e5e5e5] bg-white p-2 shadow-[0_10px_20px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-slate-900';
const mainGridClasses =
  'calculator-main-grid mx-auto grid w-full max-w-[1380px] items-start gap-8 2xl:grid-cols-[minmax(0,1.18fr)_minmax(360px,0.82fr)]';
const resultsDashboardClasses = 'calculator-results-dashboard grid gap-6';
const previewLayoutClasses = 'calculator-preview-layout grid gap-6 xl:grid-cols-[1.02fr_0.98fr]';
const previewSidecardsClasses = 'calculator-preview-sidecards grid gap-6';
const insightsLayoutClasses = 'calculator-insights-layout grid gap-6 xl:grid-cols-[0.9fr_1.1fr]';
const advancedGroupClasses = `calculator-advanced-group ${calculatorSoftCard} overflow-hidden p-4`;
const advancedToggleClasses =
  'calculator-advanced-toggle flex w-full items-center justify-between gap-4 rounded-[20px] text-left';
const actionsClasses = 'calculator-actions flex flex-wrap gap-4';
const PIE_COLOR_MAP = {
  vehicle: '#22C55E',
  flight: '#22C55E',
  electricity: '#84CC16',
  water: '#06B6D4',
  food: '#A3E635',
  shopping: '#10B981',
  digital: '#14B8A6',
  lpg: '#6B7280',
  pets: '#6B7280',
  work: '#6B7280',
  greenActions: '#6B7280',
  homeInfrastructure: '#6B7280',
};

const getPieColor = (name) => PIE_COLOR_MAP[name] || '#6B7280';

const renderActivePieShape = ({ outerRadius, ...props }) => (
  <Sector
    {...props}
    outerRadius={outerRadius + 8}
    stroke="rgba(236, 253, 245, 0.95)"
    strokeWidth={3}
  />
);

const createTransportEntry = (overrides = {}) => ({
  id: overrides.id || `transport-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
  mode: 'car',
  fuelType: 'petrol',
  mileage: 0,
  distance: 0,
  trafficLevel: 'medium',
  vehicleAge: 'new',
  carpoolPeople: 1,
  flightType: 'domestic',
  ...overrides,
});

const INITIAL_STATE = {
  period: 'monthly',
  transports: [createTransportEntry()],
  electricity: {
    units: 0,
    acHours: 0,
    acDays: 0,
    fridgeHours: 0,
    geyserHours: 0,
    geyserDays: 0,
    state: 'Karnataka',
  },
  water: {
    liters: 0,
    source: 'municipal',
    waterType: 'normal water',
  },
  food: {
    dietType: 'veg',
    mealsPerDay: 0,
    dairyConsumption: 'medium',
    foodWasteLevel: 'medium',
    lpgCylinders: 0,
  },
  lifestyle: {
    shoppingSpend: 0,
    onlineOrdersPerMonth: 0,
    wasteLevel: 'medium',
    recyclingHabit: 'yes',
  },
  advanced: {
    digital: {
      screenTime: 0,
      streamingHours: 0,
      emailsPerDay: 0,
    },
    pets: {
      hasPets: 'no',
      count: 0,
      type: 'dog',
      foodType: 'packaged',
    },
    work: {
      type: 'home',
      laptopHours: 0,
      printingPages: 0,
    },
    greenActions: {
      treesPlanted: 0,
      climateDonations: 0,
      renewableEnergy: 'no',
    },
    homeInfrastructure: {
      houseType: 'apartment',
      solarInstalled: 'no',
      rooms: 0,
      acHours: 0,
    },
  },
  sections: {
    travel: true,
    electricity: true,
    water: true,
    food: true,
    lifestyle: true,
    workStudy: false,
    advancedSections: false,
    advancedDigital: true,
    advancedPets: false,
    advancedGreen: false,
    advancedHome: false,
  },
};

const isBlank = (value) => value === '' || value === null || value === undefined;

const formatNumber = (value) =>
  Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 1 });

const displayNumericValue = (value) => (value === '' ? '' : value || 0);

const restoreForm = (savedForm) => {
  if (!savedForm) return INITIAL_STATE;

  const legacyTransport = savedForm.travel
    ? [
        createTransportEntry({
          mode: savedForm.travel.mode,
          fuelType: savedForm.travel.fuelType,
          mileage: savedForm.travel.mileage,
          distance: savedForm.travel.distance,
          trafficLevel: savedForm.travel.trafficLevel,
          vehicleAge: savedForm.travel.carAge,
          carpoolPeople: savedForm.travel.carpoolPeople || 1,
          flightType: savedForm.travel.flightType,
        }),
      ]
    : INITIAL_STATE.transports;

  return {
    ...INITIAL_STATE,
    ...savedForm,
    transports:
      Array.isArray(savedForm.transports) && savedForm.transports.length
        ? savedForm.transports.map((entry) => createTransportEntry(entry))
        : legacyTransport,
    electricity: {
      ...INITIAL_STATE.electricity,
      ...savedForm.electricity,
    },
    water: {
      ...INITIAL_STATE.water,
      ...savedForm.water,
    },
    food: {
      ...INITIAL_STATE.food,
      ...savedForm.food,
    },
    lifestyle: {
      ...INITIAL_STATE.lifestyle,
      ...savedForm.lifestyle,
    },
    advanced: {
      digital: {
        ...INITIAL_STATE.advanced.digital,
        ...savedForm.advanced?.digital,
      },
      pets: {
        ...INITIAL_STATE.advanced.pets,
        ...savedForm.advanced?.pets,
      },
      work: {
        ...INITIAL_STATE.advanced.work,
        ...savedForm.advanced?.work,
      },
      greenActions: {
        ...INITIAL_STATE.advanced.greenActions,
        ...savedForm.advanced?.greenActions,
      },
      homeInfrastructure: {
        ...INITIAL_STATE.advanced.homeInfrastructure,
        ...savedForm.advanced?.homeInfrastructure,
      },
    },
    sections: {
      ...INITIAL_STATE.sections,
      ...savedForm.sections,
    },
  };
};

const Calculator = () => {
  const [form, setForm] = useState(INITIAL_STATE);
  const [advancedEnabled, setAdvancedEnabled] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [snapshot, setSnapshot] = useState(null);
  const [activePieIndex, setActivePieIndex] = useState(-1);
  const [aiInsights, setAiInsights] = useState({
    loading: false,
    error: '',
    data: null,
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const savedSnapshot = localStorage.getItem(SNAPSHOT_KEY);

    if (saved) {
      try {
        setForm(restoreForm(JSON.parse(saved)));
      } catch (error) {
        console.warn('Unable to restore calculator state', error);
      }
    }

    if (savedSnapshot) {
      try {
        setSnapshot(JSON.parse(savedSnapshot));
      } catch (error) {
        console.warn('Unable to restore calculator snapshot', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  }, [form]);

  const [addTravel] = useMutation(ADD_TRAVEL, {
    update(cache) {
      try {
        const { me } = cache.readQuery({ query: QUERY_ME });
        cache.writeQuery({
          query: QUERY_ME,
          data: { me: { ...me, travelData: [...me.travelData] } },
        });
      } catch (error) {
        console.warn(error);
      }
    },
  });

  const [addHome] = useMutation(ADD_HOME, {
    update(cache) {
      try {
        const { me } = cache.readQuery({ query: QUERY_ME });
        cache.writeQuery({
          query: QUERY_ME,
          data: { me: { ...me, homeData: [...me.homeData] } },
        });
      } catch (error) {
        console.warn(error);
      }
    },
  });

  const [saveFootprint] = useMutation(SAVE_FOOTPRINT, {
    refetchQueries: [{ query: QUERY_ME }],
    awaitRefetchQueries: true,
  });

  const updateField = (section, key, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const updateAdvancedField = (section, key, value) => {
    setForm((prev) => ({
      ...prev,
      advanced: {
        ...prev.advanced,
        [section]: {
          ...prev.advanced[section],
          [key]: value,
        },
      },
    }));
  };

  const handleNumericFocus = (value, applyValue) => {
    if (Number(value) === 0) {
      applyValue('');
    }
  };

  const handleNumericBlur = (value, applyValue) => {
    if (value === '') {
      applyValue(0);
    }
  };

  const updateTransportEntry = (id, key, value) => {
    setForm((prev) => ({
      ...prev,
      transports: prev.transports.map((entry) => {
        if (entry.id !== id) return entry;
        const nextEntry = { ...entry, [key]: value };
        if (key === 'mode' && value === 'cycle') nextEntry.distance = 0;
        if (key === 'mode' && value !== 'flight') nextEntry.flightType = 'domestic';
        return nextEntry;
      }),
    }));
  };

  const addTransportEntry = () => {
    setForm((prev) => ({
      ...prev,
      transports: [...prev.transports, createTransportEntry({ distance: 0 })],
      sections: { ...prev.sections, travel: true },
    }));
  };

  const removeTransportEntry = (id) => {
    setForm((prev) => ({
      ...prev,
      transports:
        prev.transports.length > 1
          ? prev.transports.filter((entry) => entry.id !== id)
          : prev.transports,
    }));
  };

  const toggleSection = (section) => {
    setForm((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: !prev.sections[section],
      },
    }));
  };

  const validationErrors = useMemo(() => {
    const nextErrors = {};
    if (isBlank(form.electricity.units) || Number(form.electricity.units) < 0) nextErrors.units = 'Required';
    if (!INDIA_STATES.includes(form.electricity.state)) nextErrors.state = 'Choose a valid state';
    if (isBlank(form.water.liters) || Number(form.water.liters) < 0) nextErrors.liters = 'Required';
    if (!form.food.dietType) nextErrors.dietType = 'Required';
    if (isBlank(form.food.mealsPerDay) || Number(form.food.mealsPerDay) < 1) nextErrors.mealsPerDay = 'Required';
    if (Number(form.lifestyle.shoppingSpend) < 0) nextErrors.shoppingSpend = 'Must be positive';
    if (Number(form.lifestyle.onlineOrdersPerMonth) < 0) nextErrors.onlineOrdersPerMonth = 'Must be positive';
    if (advancedEnabled) {
      if (Number(form.advanced.digital.screenTime) < 0) nextErrors.screenTime = 'Must be positive';
      if (Number(form.advanced.digital.streamingHours) < 0) nextErrors.streamingHours = 'Must be positive';
      if (Number(form.advanced.digital.emailsPerDay) < 0) nextErrors.emailsPerDay = 'Must be positive';
      if (form.advanced.pets.hasPets === 'yes' && Number(form.advanced.pets.count) < 1) {
        nextErrors.petCount = 'Required';
      }
      if (Number(form.advanced.work.laptopHours) < 0) nextErrors.laptopHours = 'Must be positive';
      if (Number(form.advanced.work.printingPages) < 0) nextErrors.printingPages = 'Must be positive';
      if (Number(form.advanced.greenActions.treesPlanted) < 0) nextErrors.treesPlanted = 'Must be positive';
      if (Number(form.advanced.greenActions.climateDonations) < 0) nextErrors.climateDonations = 'Must be positive';
      if (Number(form.advanced.homeInfrastructure.rooms) < 1) nextErrors.rooms = 'Required';
      if (Number(form.advanced.homeInfrastructure.acHours) < 0) nextErrors.homeAcHours = 'Must be positive';
    }

    form.transports.forEach((entry, index) => {
      const prefix = `transport_${index}`;
      const needsDistance = entry.mode !== 'cycle';
      const needsMileage = entry.mode === 'car' || entry.mode === 'bike';
      if (needsDistance && (isBlank(entry.distance) || Number(entry.distance) < 0)) {
        nextErrors[`${prefix}_distance`] = 'Required';
      }
      if (needsMileage && (isBlank(entry.mileage) || Number(entry.mileage) < 1)) {
        nextErrors[`${prefix}_mileage`] = 'Required';
      }
    });

    return nextErrors;
  }, [form, advancedEnabled]);

  useEffect(() => {
    setErrors(validationErrors);
  }, [validationErrors]);

  const results = useMemo(() => {
    const computed = calculateFootprint({ ...form, advancedEnabled });
    const multiplier = form.period === 'yearly' ? 12 : 1;
    return {
      ...computed,
      monthlyTotal: computed.totalEmission,
      total: form.period === 'yearly' ? computed.yearlyEmission : computed.totalEmission,
      displayBreakdown: computed.categoryBreakdown.map((item) => ({
        ...item,
        value: item.value * multiplier,
      })),
    };
  }, [form, advancedEnabled]);

  const highestCategory = results.highestCategory;
  const ecoScoreTone =
    results.ecoScore >= 75 ? 'good' : results.ecoScore >= 45 ? 'medium' : 'low';

  const ruleSuggestions = useMemo(() => {
    const hasTransit = form.transports.some((entry) => ['bus', 'train', 'metro'].includes(entry.mode));
    const hasCarpool = form.transports.some((entry) => Number(entry.carpoolPeople) > 1);
    const highTraffic = form.transports.some((entry) => entry.trafficLevel === 'high');

    return getRuleSuggestions(
      {
        vehicle: results.monthlyBreakdown.vehicle,
        electricity: results.monthlyBreakdown.electricity,
        water: results.monthlyBreakdown.water,
        flight: results.monthlyBreakdown.flight,
        food: results.monthlyBreakdown.food,
        shopping: results.monthlyBreakdown.shopping,
        lpg: results.monthlyBreakdown.lpg,
        traffic: highTraffic ? 'high' : 'medium',
        publicTransportPreference: hasTransit ? 80 : 20,
        carpool: hasCarpool,
        workFromHomeDays: 1,
        renewablePercent: INDIA_STATES.includes(form.electricity.state) ? 25 : 0,
        dietType: form.food.dietType,
        onlineOrders: form.lifestyle.onlineOrdersPerMonth,
        wasteLevel: form.lifestyle.wasteLevel,
      },
      highestCategory
    );
  }, [form, highestCategory, results]);

  const pieData = results.displayBreakdown.filter((item) => item.value > 0);
  const comparisonData = [
    { name: 'Current', footprint: Number(results.total.toFixed(1)) },
    { name: 'Target', footprint: Number((results.total * 0.72).toFixed(1)) },
    { name: 'Best', footprint: Number((results.total * 0.55).toFixed(1)) },
  ];

  const snapshotBars = useMemo(
    () =>
      results.categoryBreakdown
        .filter((item) => item.value > 0)
        .map((item) => ({ ...item, share: Math.round(item.percentage) }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5),
    [results]
  );

  const averageComparison = form.period === 'yearly' ? 4800 : 400;

  const handleDownloadReport = () => {
    const report = {
      createdAt: new Date().toISOString(),
      period: form.period,
      totals: {
        monthly: Number(results.monthlyTotal.toFixed(2)),
        yearly: Number(results.yearlyEmission.toFixed(2)),
        basicMonthly: Number(results.basicEmission.toFixed(2)),
        advancedMonthly: Number(results.advancedEmission.toFixed(2)),
        treesNeeded: Number(results.treesNeeded.toFixed(2)),
        ecoScore: results.ecoScore,
        carbonLevel: results.carbonLevel,
      },
      breakdown: results.displayBreakdown,
      highestCategory,
      smartTips: ruleSuggestions,
      aiSuggestions: aiInsights.data?.aiSuggestions || [],
      form,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'carbon-footprint-report.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setForm(INITIAL_STATE);
    setAdvancedEnabled(false);
    setAiInsights({ loading: false, error: '', data: null });
    setSnapshot(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SNAPSHOT_KEY);
  };

  const handleRecalculate = async () => {
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length) {
      const firstErrorKey = Object.keys(validationErrors)[0];
      const firstErrorNode = document.querySelector(
        `[data-error-field="${firstErrorKey}"] .calculator-control, [data-error-field="${firstErrorKey}"] input, [data-error-field="${firstErrorKey}"] select`
      );

      if (firstErrorNode) {
        firstErrorNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorNode.focus();
      }

      return;
    }

    const payload = {
      vehicle: Number(results.monthlyBreakdown.vehicle.toFixed(2)),
      electricity: Number(results.monthlyBreakdown.electricity.toFixed(2)),
      water: Number(results.monthlyBreakdown.water.toFixed(2)),
      food: Number(results.monthlyBreakdown.food.toFixed(2)),
      shopping: Number(results.monthlyBreakdown.shopping.toFixed(2)),
      flight: Number(results.monthlyBreakdown.flight.toFixed(2)),
      lpg: Number(results.monthlyBreakdown.lpg.toFixed(2)),
    };

    setSaving(true);
    setAiInsights({ loading: true, error: '', data: null });

    saveFootprintHistoryRecord(form, results);

    try {
      await addTravel({
        variables: {
          vehicleEmissions: Math.round(results.monthlyBreakdown.vehicle),
          publicTransitEmissions: Math.round(results.transportMeta.publicTransit),
          planeEmissions: Math.round(results.monthlyBreakdown.flight),
        },
      });

      await addHome({
        variables: {
          waterEmissions: Math.round(results.monthlyBreakdown.water),
          electricityEmissions: Math.round(results.monthlyBreakdown.electricity),
          heatEmissions: Math.round(results.monthlyBreakdown.lpg),
        },
      });

      await saveFootprint({
        variables: {
          electricity: Math.round(results.monthlyBreakdown.electricity),
          water: Math.round(results.monthlyBreakdown.water),
          heat: Math.round(results.monthlyBreakdown.lpg),
          vehicle: Math.round(results.monthlyBreakdown.vehicle),
          publicTransit: Math.round(results.transportMeta.publicTransit),
          flights: Math.round(results.monthlyBreakdown.flight),
          totalCarbon: Math.round(results.monthlyTotal),
        },
      });
    } catch (error) {
      console.error(error);
    }

    try {
      const nextSnapshot = {
        previousMonthlyTotal: snapshot?.currentMonthlyTotal ?? results.monthlyTotal,
        currentMonthlyTotal: results.monthlyTotal,
        updatedAt: new Date().toISOString(),
      };
      setSnapshot(nextSnapshot);
      localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(nextSnapshot));

      const aiData = await fetchAISuggestions(payload);
      setAiInsights({
        loading: false,
        error: '',
        data: { ...aiData, ruleSuggestions },
      });
    } catch (error) {
      setAiInsights({
        loading: false,
        error: error.message,
        data: {
          highestCategory,
          percentage: 0,
          aiSuggestions: [],
          ruleSuggestions,
        },
      });
    } finally {
      setSaving(false);
    }
  };

  if (!Auth.loggedIn()) {
    return (
      <div className={pageClasses}>
        <div className={containerClasses}>
          <div className={authCardClasses}>
            <h2 className="text-[2rem] font-black tracking-[-0.04em] text-[#111111] dark:text-slate-50">Log in to use the calculator</h2>
            <p className="mt-3 text-[#444444] dark:text-slate-300">
              Save your carbon summary, compare improvements, and unlock AI recommendations.
            </p>
            <Link to="/login" className={`${calculatorLinkButton} mt-6 inline-flex`}>
              Log In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={pageClasses}>
      <div className={containerClasses}>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className={shellClasses}
        >
          <header className={headerClasses}>
            <p className={eyebrowClasses}>Track - Analyze - Reduce</p>
            <div className={headingShellClasses}>
              <h1 className={headingClasses}>Carbon Footprint Calculator</h1>
              <div className={headingUnderlineClasses} aria-hidden="true" />
            </div>
            <p className="mx-auto mt-4 max-w-[700px] text-[1.04rem] font-medium leading-[1.8] text-[#444444] dark:text-slate-300">
              Build a cleaner monthly footprint with dynamic transport tracking, live preview,
              and practical AI-backed climate guidance.
            </p>
            <div className={`${ecoBadgeClasses} calculator-eco-badge-${ecoScoreTone}`}>
              <div className="calculator-eco-badge-copy grid gap-1 text-left">
                <span className="calculator-eco-badge-label text-[0.72rem] font-extrabold uppercase tracking-[0.24em] text-emerald-200">App Score Live</span>
                <div className="calculator-eco-badge-score-row flex items-end gap-2">
                  <strong className="text-4xl font-black tracking-[-0.06em]">{results.ecoScore}</strong>
                  <span className="pb-1 text-lg font-bold text-emerald-100">/100</span>
                </div>
              </div>
              <div
                className="calculator-eco-badge-ring relative inline-flex h-[92px] w-[92px] items-center justify-center rounded-full border-[6px] border-emerald-300/20 text-2xl font-black"
                style={{ '--eco-progress': `${results.ecoScore}%` }}
              >
                <span>{results.ecoScore}</span>
              </div>
              <div className="calculator-eco-badge-progress col-span-2 h-2.5 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
                <div
                  className="calculator-eco-badge-progress-fill h-full rounded-full bg-[linear-gradient(90deg,#22c55e,#22d3ee)]"
                  style={{ width: `${results.ecoScore}%` }}
                />
              </div>
            </div>
          </header>

          <section className={toolbarClasses}>
            <div className={toggleGroupClasses}>
              {['monthly', 'yearly'].map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, period }))}
                  className={`calculator-toggle-button ${
                    form.period === period ? 'calculator-toggle-button-active rounded-2xl bg-[linear-gradient(135deg,#16a34a,#34d399)] px-4 py-3 font-bold text-white shadow-[0_12px_24px_rgba(34,197,94,0.2)]' : 'rounded-2xl px-4 py-3 font-bold text-[#111111] dark:text-slate-100'
                  }`}
                >
                  <span className={`calculator-button-icon ${calculatorIconBadge} h-8 w-8 rounded-full text-[0.72rem] shadow-none`} aria-hidden="true">
                    {period === 'monthly' ? '◔' : '◎'}
                  </span>
                  <span>{period === 'monthly' ? 'Monthly' : 'Yearly'}</span>
                </button>
              ))}
            </div>
          </section>

          <div className={mainGridClasses}>
            <div className="calculator-form-column mx-auto grid w-full max-w-5xl gap-6 2xl:mx-0 2xl:max-w-none">
              <InputSection
                title="Transport Section"
                subtitle="Add one or more travel blocks and tailor fields by mode."
                icon="T"
                isOpen={form.sections.travel}
                onToggle={() => toggleSection('travel')}
                badge="Dynamic Transport"
              >
                <div className="transport-list grid gap-4">
                  {form.transports.map((entry, index) => (
                    <TransportEntry
                      key={entry.id}
                      entry={entry}
                      index={index}
                      onChange={updateTransportEntry}
                      onRemove={removeTransportEntry}
                      canRemove={form.transports.length > 1}
                      errors={errors}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className={`${calculatorSecondaryButton} transport-add-button`}
                  onClick={addTransportEntry}
                >
                  <span className={`calculator-button-icon ${calculatorIconBadge} h-8 w-8 rounded-full text-xs shadow-none`} aria-hidden="true">+</span>
                  <span>Add More Transport</span>
                </button>
              </InputSection>

              <InputSection
                title="Electricity Section"
                subtitle="Keep the input simple and focus on the energy habits that matter."
                icon="E"
                isOpen={form.sections.electricity}
                onToggle={() => toggleSection('electricity')}
                badge="Home Energy"
              >
                <div className={fieldGridTwo}>
                  <InputField
                    label="Electricity (kWh/month)"
                    icon="E"
                    required
                    error={errors.units}
                    fieldKey="units"
                  >
                    <input
                      type="number"
                      min="0"
                      value={displayNumericValue(form.electricity.units)}
                      onFocus={() => handleNumericFocus(form.electricity.units, (value) => updateField('electricity', 'units', value))}
                      onBlur={() => handleNumericBlur(form.electricity.units, (value) => updateField('electricity', 'units', value))}
                      onChange={(event) => updateField('electricity', 'units', event.target.value)}
                      className={controlInputClass}
                    />
                  </InputField>
                  <InputField
                    label="State"
                    icon="S"
                    required
                    error={errors.state}
                    helper="Search any Indian state"
                    fieldKey="state"
                  >
                    <select
                      value={form.electricity.state}
                      onChange={(event) => updateField('electricity', 'state', event.target.value)}
                      className={controlInputClass}
                    >
                      {INDIA_STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </InputField>
                </div>

                <div className={fieldGridThree}>
                  <InputField
                    label="AC Usage (hours/day)"
                    icon="AC"
                    error={errors.acHours}
                    fieldKey="acHours"
                  >
                    <input
                      type="number"
                      min="0"
                      value={displayNumericValue(form.electricity.acHours)}
                      onFocus={() => handleNumericFocus(form.electricity.acHours, (value) => updateField('electricity', 'acHours', value))}
                      onBlur={() => handleNumericBlur(form.electricity.acHours, (value) => updateField('electricity', 'acHours', value))}
                      onChange={(event) => updateField('electricity', 'acHours', event.target.value)}
                      className={controlInputClass}
                    />
                  </InputField>
                  <InputField label="AC Days / Month" icon="AD">
                    <input
                      type="number"
                      min="0"
                      max="31"
                      value={displayNumericValue(form.electricity.acDays)}
                      onFocus={() => handleNumericFocus(form.electricity.acDays, (value) => updateField('electricity', 'acDays', value))}
                      onBlur={() => handleNumericBlur(form.electricity.acDays, (value) => updateField('electricity', 'acDays', value))}
                      onChange={(event) => updateField('electricity', 'acDays', event.target.value)}
                      className={controlInputClass}
                    />
                  </InputField>
                  <InputField label="Fridge Usage (hours)" icon="F">
                    <input
                      type="number"
                      min="0"
                      max="24"
                      value={displayNumericValue(form.electricity.fridgeHours)}
                      onFocus={() => handleNumericFocus(form.electricity.fridgeHours, (value) => updateField('electricity', 'fridgeHours', value))}
                      onBlur={() => handleNumericBlur(form.electricity.fridgeHours, (value) => updateField('electricity', 'fridgeHours', value))}
                      onChange={(event) =>
                        updateField('electricity', 'fridgeHours', event.target.value)
                      }
                      className={controlInputClass}
                    />
                  </InputField>
                  <InputField label="Geyser Usage (hours/day)" icon="G">
                    <input
                      type="number"
                      min="0"
                      value={displayNumericValue(form.electricity.geyserHours)}
                      onFocus={() => handleNumericFocus(form.electricity.geyserHours, (value) => updateField('electricity', 'geyserHours', value))}
                      onBlur={() => handleNumericBlur(form.electricity.geyserHours, (value) => updateField('electricity', 'geyserHours', value))}
                      onChange={(event) =>
                        updateField('electricity', 'geyserHours', event.target.value)
                      }
                      className={controlInputClass}
                    />
                  </InputField>
                  <InputField label="Geyser Days / Month" icon="GD">
                    <input
                      type="number"
                      min="0"
                      max="31"
                      value={displayNumericValue(form.electricity.geyserDays)}
                      onFocus={() => handleNumericFocus(form.electricity.geyserDays, (value) => updateField('electricity', 'geyserDays', value))}
                      onBlur={() => handleNumericBlur(form.electricity.geyserDays, (value) => updateField('electricity', 'geyserDays', value))}
                      onChange={(event) =>
                        updateField('electricity', 'geyserDays', event.target.value)
                      }
                      className={controlInputClass}
                    />
                  </InputField>
                </div>
              </InputSection>

              <InputSection
                title="Water Section"
                subtitle="Refine water impact with source and water-type adjustments."
                icon="W"
                isOpen={form.sections.water}
                onToggle={() => toggleSection('water')}
                badge="Water Footprint"
              >
                <div className={fieldGridThree}>
                  <InputField
                    label="Water Usage (liters/day)"
                    icon="W"
                    required
                    error={errors.liters}
                    fieldKey="liters"
                  >
                    <input
                      type="number"
                      min="0"
                      value={displayNumericValue(form.water.liters)}
                      onFocus={() => handleNumericFocus(form.water.liters, (value) => updateField('water', 'liters', value))}
                      onBlur={() => handleNumericBlur(form.water.liters, (value) => updateField('water', 'liters', value))}
                      onChange={(event) => updateField('water', 'liters', event.target.value)}
                      className={controlInputClass}
                    />
                  </InputField>
                  <InputField label="Water Source" icon="WS">
                    <select
                      value={form.water.source}
                      onChange={(event) => updateField('water', 'source', event.target.value)}
                      className={controlSelectClass}
                    >
                      <option value="municipal">Municipal</option>
                      <option value="borewell">Borewell</option>
                      <option value="tanker">Tanker</option>
                      <option value="ro">RO</option>
                      <option value="other">Other</option>
                    </select>
                  </InputField>
                  <InputField label="Water Type" icon="WT">
                    <select
                      value={form.water.waterType}
                      onChange={(event) => updateField('water', 'waterType', event.target.value)}
                      className={controlSelectClass}
                    >
                      <option value="hot water">Hot Water</option>
                      <option value="cold water">Cold Water</option>
                      <option value="normal water">Normal Water</option>
                    </select>
                  </InputField>
                </div>
              </InputSection>

              <InputSection
                title="Food Section"
                subtitle="Expand diet tracking beyond basic food labels."
                icon="FD"
                isOpen={form.sections.food}
                onToggle={() => toggleSection('food')}
                badge="Nutrition Mix"
              >
                <div className={fieldGridThree}>
                  <InputField
                    label="Food Type"
                    icon="FT"
                    required
                    error={errors.dietType}
                    fieldKey="dietType"
                  >
                    <select
                      value={form.food.dietType}
                      onChange={(event) => updateField('food', 'dietType', event.target.value)}
                      className={controlSelectClass}
                    >
                      <option value="veg">Veg</option>
                      <option value="non-veg">Non-Veg</option>
                      <option value="vegan">Vegan</option>
                      <option value="eggetarian">Eggetarian</option>
                      <option value="high-protein diet">High-Protein Diet</option>
                    </select>
                  </InputField>
                  <InputField
                    label="Meals Per Day"
                    icon="MP"
                    required
                    error={errors.mealsPerDay}
                    fieldKey="mealsPerDay"
                  >
                    <input
                      type="number"
                      min="1"
                      max="8"
                      value={displayNumericValue(form.food.mealsPerDay)}
                      onFocus={() => handleNumericFocus(form.food.mealsPerDay, (value) => updateField('food', 'mealsPerDay', value))}
                      onBlur={() => handleNumericBlur(form.food.mealsPerDay, (value) => updateField('food', 'mealsPerDay', value))}
                      onChange={(event) => updateField('food', 'mealsPerDay', event.target.value)}
                      className={controlInputClass}
                    />
                  </InputField>
                  <InputField label="Dairy Consumption" icon="DC">
                    <select
                      value={form.food.dairyConsumption}
                      onChange={(event) =>
                        updateField('food', 'dairyConsumption', event.target.value)
                      }
                      className={controlSelectClass}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </InputField>
                  <InputField label="Food Waste Level" icon="FW">
                    <select
                      value={form.food.foodWasteLevel}
                      onChange={(event) =>
                        updateField('food', 'foodWasteLevel', event.target.value)
                      }
                      className={controlSelectClass}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </InputField>
                  <InputField label="LPG Cylinders / Month" icon="LPG">
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={displayNumericValue(form.food.lpgCylinders)}
                      onFocus={() => handleNumericFocus(form.food.lpgCylinders, (value) => updateField('food', 'lpgCylinders', value))}
                      onBlur={() => handleNumericBlur(form.food.lpgCylinders, (value) => updateField('food', 'lpgCylinders', value))}
                      onChange={(event) => updateField('food', 'lpgCylinders', event.target.value)}
                      className={controlInputClass}
                    />
                  </InputField>
                </div>
              </InputSection>

              <InputSection
                title="Lifestyle Section"
                subtitle="Track spending, deliveries, waste, and recycling together."
                icon="L"
                isOpen={form.sections.lifestyle}
                onToggle={() => toggleSection('lifestyle')}
                badge="Consumption Pattern"
              >
                <div className={fieldGridTwo}>
                  <InputField
                    label="Shopping ₹ / Month"
                    icon="SP"
                    error={errors.shoppingSpend}
                    fieldKey="shoppingSpend"
                  >
                    <input
                      type="number"
                      min="0"
                      value={displayNumericValue(form.lifestyle.shoppingSpend)}
                      onFocus={() => handleNumericFocus(form.lifestyle.shoppingSpend, (value) => updateField('lifestyle', 'shoppingSpend', value))}
                      onBlur={() => handleNumericBlur(form.lifestyle.shoppingSpend, (value) => updateField('lifestyle', 'shoppingSpend', value))}
                      onChange={(event) =>
                        updateField('lifestyle', 'shoppingSpend', event.target.value)
                      }
                      className={controlInputClass}
                    />
                  </InputField>
                  <InputField
                    label="Online Deliveries / Month"
                    icon="OD"
                    error={errors.onlineOrdersPerMonth}
                    fieldKey="onlineOrdersPerMonth"
                  >
                    <input
                      type="number"
                      min="0"
                      value={displayNumericValue(form.lifestyle.onlineOrdersPerMonth)}
                      onFocus={() => handleNumericFocus(form.lifestyle.onlineOrdersPerMonth, (value) => updateField('lifestyle', 'onlineOrdersPerMonth', value))}
                      onBlur={() => handleNumericBlur(form.lifestyle.onlineOrdersPerMonth, (value) => updateField('lifestyle', 'onlineOrdersPerMonth', value))}
                      onChange={(event) =>
                        updateField('lifestyle', 'onlineOrdersPerMonth', event.target.value)
                      }
                      className={controlInputClass}
                    />
                  </InputField>
                  <InputField label="Waste Level" icon="WL">
                    <select
                      value={form.lifestyle.wasteLevel}
                      onChange={(event) =>
                        updateField('lifestyle', 'wasteLevel', event.target.value)
                      }
                      className={controlSelectClass}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </InputField>
                  <InputField label="Recycling" icon="R">
                    <select
                      value={form.lifestyle.recyclingHabit}
                      onChange={(event) =>
                        updateField('lifestyle', 'recyclingHabit', event.target.value)
                      }
                      className={controlSelectClass}
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </InputField>
                </div>
              </InputSection>

              <InputSection
                title="Work / Study Environment"
                subtitle="Capture the footprint of your daily setup, device usage, and paper dependency."
                icon="W"
                isOpen={form.sections.workStudy}
                onToggle={() => toggleSection('workStudy')}
                badge="Work Pattern"
              >
                <div className={fieldGridTwo}>
                  <InputField
                    label="Work Type"
                    icon="WT"
                    helper="Choose the environment that best matches your weekly routine."
                    tooltip="Home, office, and hybrid work patterns shift device, facility, and commute load."
                  >
                    <select
                      value={form.advanced.work.type}
                      onChange={(event) => updateAdvancedField('work', 'type', event.target.value)}
                      className={controlSelectClass}
                    >
                      <option value="home">Work From Home</option>
                      <option value="office">Office</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </InputField>
                  <InputField
                    label="Laptop Usage"
                    icon="LU"
                    helper="Average daily laptop or desktop use."
                    tooltip="Longer daily computing time increases electricity and infrastructure demand."
                    error={errors.laptopHours}
                    fieldKey="laptopHours"
                  >
                    <input
                      type="number"
                      min="0"
                      max="24"
                      value={displayNumericValue(form.advanced.work.laptopHours)}
                      onFocus={() => handleNumericFocus(form.advanced.work.laptopHours, (value) => updateAdvancedField('work', 'laptopHours', value))}
                      onBlur={() => handleNumericBlur(form.advanced.work.laptopHours, (value) => updateAdvancedField('work', 'laptopHours', value))}
                      onChange={(event) => updateAdvancedField('work', 'laptopHours', event.target.value)}
                      className={controlInputClass}
                    />
                  </InputField>
                  <InputField
                    label="Printing Usage"
                    icon="PR"
                    helper="Estimated printed pages each week."
                    tooltip="Printing adds paper, ink, and equipment energy impacts."
                    error={errors.printingPages}
                    fieldKey="printingPages"
                  >
                    <input
                      type="number"
                      min="0"
                      value={displayNumericValue(form.advanced.work.printingPages)}
                      onFocus={() => handleNumericFocus(form.advanced.work.printingPages, (value) => updateAdvancedField('work', 'printingPages', value))}
                      onBlur={() => handleNumericBlur(form.advanced.work.printingPages, (value) => updateAdvancedField('work', 'printingPages', value))}
                      onChange={(event) => updateAdvancedField('work', 'printingPages', event.target.value)}
                      className={controlInputClass}
                    />
                  </InputField>
                </div>
              </InputSection>

              <section className={advancedGroupClasses}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-[#111111] dark:text-slate-50">
                    Enable Advanced Options
                  </span>
                  <button
                    type="button"
                    onClick={() => setAdvancedEnabled((current) => !current)}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                      advancedEnabled
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white'
                    }`}
                  >
                    Enable Advanced Options
                  </button>
                </div>
                {advancedEnabled ? (
                  <>
                    <button
                      type="button"
                      className={advancedToggleClasses}
                      onClick={() => toggleSection('advancedSections')}
                    >
                      <div className="calculator-advanced-heading grid gap-2">
                        <div className="calculator-advanced-heading-badge inline-flex w-fit rounded-full bg-emerald-100 px-3 py-1 text-[0.72rem] font-extrabold uppercase tracking-[0.18em] text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">Advanced Sections</div>
                        <h2 className="text-[1.35rem] font-black tracking-[-0.03em] text-[#111111] dark:text-slate-50">Advanced Sections</h2>
                        <p className="max-w-[52ch] text-sm leading-7 text-[#444444] dark:text-slate-300">Model digital habits, pets, offsets, and home infrastructure without cluttering the main flow.</p>
                      </div>
                      <span className="calculator-advanced-toggle-indicator inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-xl font-bold text-emerald-700 dark:border-white/10 dark:bg-slate-900 dark:text-emerald-300">
                        {form.sections.advancedSections ? '-' : '+'}
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {form.sections.advancedSections ? (
                        <motion.div
                          key="advanced-sections"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.28 }}
                          className="calculator-advanced-stack mt-4 grid gap-6 overflow-hidden"
                        >
              <InputSection
                title="Digital Carbon Footprint"
                subtitle="Estimate the footprint of screens, streaming, and daily communication."
                icon="D"
                isOpen={form.sections.advancedDigital}
                onToggle={() => toggleSection('advancedDigital')}
                badge="Advanced"
              >
                <div className={fieldGridTwo}>
                  <InputField
                    label="Daily Screen Time"
                    icon="DS"
                    helper="Hours spent on phones, laptops, tablets, and TVs each day."
                    tooltip="Higher device use adds energy demand from screens, charging, and cloud sync."
                    error={errors.screenTime}
                    fieldKey="screenTime"
                  >
                    <input
                      type="number"
                      min="0"
                      max="24"
                      value={displayNumericValue(form.advanced.digital.screenTime)}
                      onFocus={() => handleNumericFocus(form.advanced.digital.screenTime, (value) => updateAdvancedField('digital', 'screenTime', value))}
                      onBlur={() => handleNumericBlur(form.advanced.digital.screenTime, (value) => updateAdvancedField('digital', 'screenTime', value))}
                      onChange={(event) => updateAdvancedField('digital', 'screenTime', event.target.value)}
                      className={controlInputClass}
                    />
                  </InputField>
                  <InputField
                    label="Streaming Hours"
                    icon="ST"
                    helper="Weekly video or music streaming usage across devices."
                    tooltip="Streaming creates a cloud and network energy footprint beyond your device power."
                    error={errors.streamingHours}
                    fieldKey="streamingHours"
                  >
                    <input
                      type="number"
                      min="0"
                      value={displayNumericValue(form.advanced.digital.streamingHours)}
                      onFocus={() => handleNumericFocus(form.advanced.digital.streamingHours, (value) => updateAdvancedField('digital', 'streamingHours', value))}
                      onBlur={() => handleNumericBlur(form.advanced.digital.streamingHours, (value) => updateAdvancedField('digital', 'streamingHours', value))}
                      onChange={(event) => updateAdvancedField('digital', 'streamingHours', event.target.value)}
                      className={controlInputClass}
                    />
                  </InputField>
                  <InputField
                    label="Emails Sent"
                    icon="EM"
                    helper="Approximate number of emails or attachments sent per day."
                    tooltip="Frequent emailing adds a small but real server and storage footprint."
                    error={errors.emailsPerDay}
                    fieldKey="emailsPerDay"
                  >
                    <input
                      type="number"
                      min="0"
                      value={displayNumericValue(form.advanced.digital.emailsPerDay)}
                      onFocus={() => handleNumericFocus(form.advanced.digital.emailsPerDay, (value) => updateAdvancedField('digital', 'emailsPerDay', value))}
                      onBlur={() => handleNumericBlur(form.advanced.digital.emailsPerDay, (value) => updateAdvancedField('digital', 'emailsPerDay', value))}
                      onChange={(event) => updateAdvancedField('digital', 'emailsPerDay', event.target.value)}
                      className={controlInputClass}
                    />
                  </InputField>
                </div>
              </InputSection>

              <InputSection
                title="Pet Carbon Footprint"
                subtitle="Include food, care, and household demand linked to pets."
                icon="P"
                isOpen={form.sections.advancedPets}
                onToggle={() => toggleSection('advancedPets')}
                badge="Advanced"
              >
                <div className={fieldGridTwo}>
                  <InputField
                    label="Do You Have Pets?"
                    icon="HP"
                    helper="Toggle pet ownership to include or exclude pet emissions."
                    tooltip="Pet ownership affects food and household consumption patterns."
                  >
                    <select
                      value={form.advanced.pets.hasPets}
                      onChange={(event) => updateAdvancedField('pets', 'hasPets', event.target.value)}
                      className={controlSelectClass}
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </InputField>
                  <InputField
                    label="Number of Pets"
                    icon="NP"
                    helper="Count of pets in your household."
                    tooltip="More pets typically means a larger food and care footprint."
                    error={errors.petCount}
                    fieldKey="petCount"
                  >
                    <input
                      type="number"
                      min="1"
                      value={displayNumericValue(form.advanced.pets.count)}
                      onFocus={() => handleNumericFocus(form.advanced.pets.count, (value) => updateAdvancedField('pets', 'count', value))}
                      onBlur={() => handleNumericBlur(form.advanced.pets.count, (value) => updateAdvancedField('pets', 'count', value))}
                      onChange={(event) => updateAdvancedField('pets', 'count', event.target.value)}
                      className={controlInputClass}
                      disabled={form.advanced.pets.hasPets !== 'yes'}
                    />
                  </InputField>
                  <InputField
                    label="Type of Pet"
                    icon="PT"
                    helper="Primary pet category for a typical monthly estimate."
                    tooltip="Different pets have different food and care profiles."
                  >
                    <select
                      value={form.advanced.pets.type}
                      onChange={(event) => updateAdvancedField('pets', 'type', event.target.value)}
                      className={controlSelectClass}
                      disabled={form.advanced.pets.hasPets !== 'yes'}
                    >
                      <option value="dog">Dog</option>
                      <option value="cat">Cat</option>
                      <option value="other">Other</option>
                    </select>
                  </InputField>
                  <InputField
                    label="Pet Food Type"
                    icon="PF"
                    helper="Choose how your pets are usually fed."
                    tooltip="Packaged pet food often has a higher processing and packaging footprint."
                  >
                    <select
                      value={form.advanced.pets.foodType}
                      onChange={(event) => updateAdvancedField('pets', 'foodType', event.target.value)}
                      className={controlSelectClass}
                      disabled={form.advanced.pets.hasPets !== 'yes'}
                    >
                      <option value="packaged">Packaged</option>
                      <option value="home">Home Food</option>
                    </select>
                  </InputField>
                </div>
              </InputSection>

              <InputSection
                title="Green Actions / Offsetting"
                subtitle="Offsetting actions reduce your net monthly footprint."
                icon="G"
                isOpen={form.sections.advancedGreen}
                onToggle={() => toggleSection('advancedGreen')}
                badge="Advanced Offset"
              >
                <div className={fieldGridTwo}>
                  <InputField
                    label="Trees Planted"
                    icon="TP"
                    helper="Number of trees planted or supported per year."
                    tooltip="Tree planting is modeled as a modest annual offset spread across the year."
                    error={errors.treesPlanted}
                    fieldKey="treesPlanted"
                  >
                    <input
                      type="number"
                      min="0"
                      value={displayNumericValue(form.advanced.greenActions.treesPlanted)}
                      onFocus={() => handleNumericFocus(form.advanced.greenActions.treesPlanted, (value) => updateAdvancedField('greenActions', 'treesPlanted', value))}
                      onBlur={() => handleNumericBlur(form.advanced.greenActions.treesPlanted, (value) => updateAdvancedField('greenActions', 'treesPlanted', value))}
                      onChange={(event) => updateAdvancedField('greenActions', 'treesPlanted', event.target.value)}
                      className={controlInputClass}
                    />
                  </InputField>
                  <InputField
                    label="Climate Donations"
                    icon="CD"
                    helper="Annual support to verified climate causes."
                    tooltip="Donations are treated as a small proxy offset to reflect support for mitigation efforts."
                    error={errors.climateDonations}
                    fieldKey="climateDonations"
                  >
                    <input
                      type="number"
                      min="0"
                      value={displayNumericValue(form.advanced.greenActions.climateDonations)}
                      onFocus={() => handleNumericFocus(form.advanced.greenActions.climateDonations, (value) => updateAdvancedField('greenActions', 'climateDonations', value))}
                      onBlur={() => handleNumericBlur(form.advanced.greenActions.climateDonations, (value) => updateAdvancedField('greenActions', 'climateDonations', value))}
                      onChange={(event) => updateAdvancedField('greenActions', 'climateDonations', event.target.value)}
                      className={controlInputClass}
                    />
                  </InputField>
                  <InputField
                    label="Renewable Energy"
                    icon="RE"
                    helper="Whether you actively use renewable energy for your home or plan."
                    tooltip="Renewable use reduces a portion of the advanced footprint."
                  >
                    <select
                      value={form.advanced.greenActions.renewableEnergy}
                      onChange={(event) => updateAdvancedField('greenActions', 'renewableEnergy', event.target.value)}
                      className={controlSelectClass}
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </InputField>
                </div>
              </InputSection>

              <InputSection
                title="Home Infrastructure"
                subtitle="Capture structural home factors that influence cooling and energy demand."
                icon="H"
                isOpen={form.sections.advancedHome}
                onToggle={() => toggleSection('advancedHome')}
                badge="Advanced"
              >
                <div className={fieldGridTwo}>
                  <InputField
                    label="House Type"
                    icon="HT"
                    helper="Choose the type of home you primarily live in."
                    tooltip="Independent homes often carry a larger structural energy footprint."
                  >
                    <select
                      value={form.advanced.homeInfrastructure.houseType}
                      onChange={(event) => updateAdvancedField('homeInfrastructure', 'houseType', event.target.value)}
                      className={controlSelectClass}
                    >
                      <option value="apartment">Apartment</option>
                      <option value="independent">Independent</option>
                    </select>
                  </InputField>
                  <InputField
                    label="Solar Installed"
                    icon="SP"
                    helper="Whether rooftop or household solar is installed."
                    tooltip="Solar is modeled as reducing part of the home infrastructure load."
                  >
                    <select
                      value={form.advanced.homeInfrastructure.solarInstalled}
                      onChange={(event) => updateAdvancedField('homeInfrastructure', 'solarInstalled', event.target.value)}
                      className={controlSelectClass}
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </InputField>
                  <InputField
                    label="Number of Rooms"
                    icon="RM"
                    helper="Total rooms in the home for a simple infrastructure estimate."
                    tooltip="More rooms generally mean more built area and cooling demand."
                    error={errors.rooms}
                    fieldKey="rooms"
                  >
                    <input
                      type="number"
                      min="1"
                      value={displayNumericValue(form.advanced.homeInfrastructure.rooms)}
                      onFocus={() => handleNumericFocus(form.advanced.homeInfrastructure.rooms, (value) => updateAdvancedField('homeInfrastructure', 'rooms', value))}
                      onBlur={() => handleNumericBlur(form.advanced.homeInfrastructure.rooms, (value) => updateAdvancedField('homeInfrastructure', 'rooms', value))}
                      onChange={(event) => updateAdvancedField('homeInfrastructure', 'rooms', event.target.value)}
                      className={controlInputClass}
                    />
                  </InputField>
                  <InputField
                    label="AC Usage"
                    icon="AC"
                    helper="Daily AC usage tied specifically to overall home infrastructure."
                    tooltip="This complements the main electricity section with a structural cooling estimate."
                    error={errors.homeAcHours}
                    fieldKey="homeAcHours"
                  >
                    <input
                      type="number"
                      min="0"
                      max="24"
                      value={displayNumericValue(form.advanced.homeInfrastructure.acHours)}
                      onFocus={() => handleNumericFocus(form.advanced.homeInfrastructure.acHours, (value) => updateAdvancedField('homeInfrastructure', 'acHours', value))}
                      onBlur={() => handleNumericBlur(form.advanced.homeInfrastructure.acHours, (value) => updateAdvancedField('homeInfrastructure', 'acHours', value))}
                      onChange={(event) => updateAdvancedField('homeInfrastructure', 'acHours', event.target.value)}
                      className={controlInputClass}
                    />
                  </InputField>
                </div>
              </InputSection>

                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </>
                ) : null}
              </section>

              <div className={actionsClasses}>
                <button
                  type="button"
                  onClick={handleRecalculate}
                  className={calculatorPrimaryButton}
                >
                  <span className={`calculator-button-icon ${calculatorIconBadge} h-8 w-8 rounded-full text-[0.72rem] shadow-none`} aria-hidden="true">
                    {saving ? '...' : '↻'}
                  </span>
                  <span>{saving ? 'Calculating...' : 'Recalculate'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className={calculatorSecondaryButton}
                >
                  <span className={`calculator-button-icon ${calculatorIconBadge} h-8 w-8 rounded-full text-[0.72rem] shadow-none`} aria-hidden="true">↺</span>
                  <span>Reset</span>
                </button>
                <Link to="/myfootprint" className={`${calculatorLinkButton} calculator-nav-button`}>
                  <span className={`calculator-button-icon ${calculatorIconBadge} h-8 w-8 rounded-full text-[0.72rem] shadow-none`} aria-hidden="true">→</span>
                  <span>Go to My Footprint</span>
                </Link>
              </div>
            </div>
          </div>

          <section className={resultsDashboardClasses}>
            <div className={previewLayoutClasses}>
              <LivePreview
                results={results}
                period={form.period}
                breakdown={results.displayBreakdown}
                formatNumber={formatNumber}
              />

              <div className={previewSidecardsClasses}>
                <SnapshotCard
                  monthlyTotal={results.monthlyTotal}
                  snapshot={snapshot}
                  snapshotBars={snapshotBars}
                  formatNumber={formatNumber}
                />

                <SummaryCard
                  yearlyTotal={results.yearlyEmission}
                  averageComparison={averageComparison * 12}
                  treesNeeded={results.treesNeeded}
                  perPersonEmission={results.perPersonEmission}
                  formatNumber={formatNumber}
                  carbonLevel={results.carbonLevel}
                  basicEmission={results.basicEmission}
                  advancedEmission={results.advancedEmission}
                />

                <ChartCard
                  title="Category Share"
                  subtitle="A centered view of which categories dominate your footprint."
                  bodyClassName="h-[360px] flex items-center justify-center"
                >
                  <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      activeIndex={activePieIndex}
                      activeShape={renderActivePieShape}
                      dataKey="value"
                      nameKey="label"
                      innerRadius={82}
                      outerRadius={128}
                      paddingAngle={4}
                      isAnimationActive
                      animationBegin={80}
                      animationDuration={900}
                      animationEasing="ease-out"
                      onMouseEnter={(_, index) => setActivePieIndex(index)}
                      onMouseLeave={() => setActivePieIndex(-1)}
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={getPieColor(entry.name)}
                          stroke={activePieIndex === index ? 'rgba(236, 253, 245, 0.95)' : 'rgba(15, 23, 42, 0.72)'}
                          strokeWidth={activePieIndex === index ? 3 : 1.5}
                          fillOpacity={activePieIndex === -1 || activePieIndex === index ? 1 : 0.88}
                          style={{
                            filter:
                              activePieIndex === index
                                ? 'drop-shadow(0 0 12px rgba(74, 222, 128, 0.34))'
                                : 'drop-shadow(0 0 0 rgba(0, 0, 0, 0))',
                            transition: 'all 220ms ease',
                            cursor: 'pointer',
                          }}
                        />
                      ))}
                    </Pie>
                      <Tooltip
                        formatter={(value) => `${formatNumber(value)} kg CO2`}
                        contentStyle={{
                          borderRadius: 16,
                          border: '1px solid #e5e7eb',
                          background: '#ffffff',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            </div>

            <div className={insightsLayoutClasses}>
              <ChartCard
                title="Target Path"
                subtitle="A compact comparison against lower-carbon targets."
                className="calculator-target-card min-h-[360px]"
                bodyClassName="calculator-target-card-body h-[280px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 13 }} />
                    <YAxis stroke="#6b7280" tick={{ fontSize: 13 }} />
                    <Tooltip
                      formatter={(value) => `${formatNumber(value)} kg CO2`}
                      contentStyle={{
                        borderRadius: 16,
                        border: '1px solid #e5e7eb',
                        background: '#ffffff',
                      }}
                    />
                    <Bar dataKey="footprint" fill="#22c55e" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <AISuggestions aiInsights={aiInsights} ruleSuggestions={ruleSuggestions} />
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
};

export default Calculator;




