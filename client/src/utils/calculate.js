import {
  AC_WATTAGE,
  APP_SCORE_DIVISOR,
  APP_SCORE_MAX,
  APP_SCORE_MIN,
  BUS_FACTOR,
  CNG_FACTOR,
  DEFAULT_MILEAGE,
  DIESEL_FACTOR,
  DIGITAL_EMAIL_FACTOR,
  DIGITAL_SCREEN_FACTOR,
  DIGITAL_STREAMING_FACTOR,
  ELECTRICITY_FACTOR,
  EV_EFFICIENCY_FACTOR,
  FOOD_NON_VEG_DAILY,
  FOOD_HIGH_DAIRY_MULTIPLIER,
  FOOD_HIGH_WASTE_MULTIPLIER,
  FOOD_VEGAN_DAILY,
  FOOD_VEGETARIAN_DAILY,
  FRIDGE_WATTAGE,
  GEYSER_WATTAGE,
  LAPTOP_WATTAGE,
  LONG_HAUL_DISTANCE_THRESHOLD,
  LONG_HAUL_FLIGHT_FACTOR,
  LOW_CARBON_THRESHOLD,
  LPG_CYLINDER_FACTOR,
  MEDIUM_CARBON_THRESHOLD,
  METRO_FACTOR,
  PETROL_FACTOR,
  SHORT_HAUL_FLIGHT_FACTOR,
  SHOPPING_GENERAL_FACTOR,
  TRAIN_FACTOR,
  TREE_OFFSET_PER_YEAR,
  TREE_OFFSET_PER_MONTH,
  WATER_SUPPLY_FACTOR,
} from './emissionFactors';

export const INDIA_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

const FOOD_DAILY_FACTORS = {
  veg: FOOD_VEGETARIAN_DAILY,
  vegan: FOOD_VEGAN_DAILY,
  'non-veg': FOOD_NON_VEG_DAILY,
  eggetarian: FOOD_VEGETARIAN_DAILY,
  'high-protein diet': FOOD_NON_VEG_DAILY,
};

const normalizeNumber = (value, fallback = 0) => {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
};

const getStateElectricityFactor = () => ELECTRICITY_FACTOR;

const wattsToKwh = (watts, hours, days = 1) => (watts * hours * days) / 1000;

const ADVANCED_LABELS = {
  digital: 'Digital',
  pets: 'Pets',
  work: 'Work / Study',
  greenActions: 'Green Actions',
  homeInfrastructure: 'Home Infrastructure',
};

export const calculateDigitalFootprint = (digital = {}) => {
  const screenTime = Math.max(normalizeNumber(digital?.screenTime), 0);
  const streamingHours = Math.max(normalizeNumber(digital?.streamingHours), 0);
  const emailsPerDay = Math.max(normalizeNumber(digital?.emailsPerDay), 0);

  return (
    screenTime * 30 * DIGITAL_SCREEN_FACTOR +
    streamingHours * 30 * DIGITAL_STREAMING_FACTOR +
    emailsPerDay * 30 * DIGITAL_EMAIL_FACTOR
  );
};

export const calculatePetFootprint = (pets = {}) => {
  if ((pets?.hasPets || 'no') !== 'yes') return 0;
  return 0;
};

export const calculateWorkEnvironmentFootprint = (work = {}) => {
  const laptopHours = Math.max(normalizeNumber(work?.laptopHours), 0);
  const laptopKwh = wattsToKwh(LAPTOP_WATTAGE, laptopHours, 30);

  return laptopKwh * ELECTRICITY_FACTOR;
};

export const calculateGreenActionsOffset = (greenActions = {}) => {
  const treesPlanted = Math.max(normalizeNumber(greenActions?.treesPlanted), 0);
  const treeOffset = treesPlanted * TREE_OFFSET_PER_MONTH;

  return -treeOffset;
};

export const calculateHomeInfrastructureFootprint = (homeInfrastructure = {}) => {
  const acHours = Math.max(normalizeNumber(homeInfrastructure?.acHours), 0);
  const monthlyAcKwh = wattsToKwh(AC_WATTAGE, acHours, 30);

  return monthlyAcKwh * ELECTRICITY_FACTOR;
};

export const calculateFootprint = (form) => {
  const transportEntries = Array.isArray(form?.transports) && form.transports.length
    ? form.transports
    : [form?.travel || {}];

  const transportTotals = transportEntries.reduce(
    (totals, entry) => {
      const transportDistance = Math.max(normalizeNumber(entry?.distance), 0);
      const mileage = Math.max(normalizeNumber(entry?.mileage, DEFAULT_MILEAGE), 1);
      const mode = entry?.mode || 'car';
      const carpoolPeople = Math.max(normalizeNumber(entry?.carpoolPeople, 1), 1);
      const fuelType = entry?.fuelType || 'petrol';
      const flightType = entry?.flightType || 'domestic';
      const fuelUsed = transportDistance / mileage;
      const fuelFactor =
        fuelType === 'diesel'
          ? DIESEL_FACTOR
          : fuelType === 'cng'
          ? CNG_FACTOR
          : PETROL_FACTOR;
      let emission = 0;

      if (mode === 'flight') {
        const flightFactor =
          flightType === 'international' || transportDistance > LONG_HAUL_DISTANCE_THRESHOLD
            ? LONG_HAUL_FLIGHT_FACTOR
            : SHORT_HAUL_FLIGHT_FACTOR;
        emission = transportDistance * flightFactor;
      } else if (mode === 'cycle') {
        emission = 0;
      } else if (mode === 'bus' || mode === 'train' || mode === 'metro') {
        const transitFactor =
          mode === 'bus' ? BUS_FACTOR : mode === 'train' ? TRAIN_FACTOR : METRO_FACTOR;
        emission = transportDistance * transitFactor;
      } else if (fuelType === 'electric') {
        emission = transportDistance * EV_EFFICIENCY_FACTOR * ELECTRICITY_FACTOR;
      } else {
        emission = fuelUsed * fuelFactor;
      }

      if (mode !== 'flight' && mode !== 'bus' && mode !== 'train' && mode !== 'metro') {
        emission /= carpoolPeople;
      }

      if (mode === 'flight') {
        totals.flight += emission;
      } else if (mode === 'bus' || mode === 'train' || mode === 'metro') {
        totals.publicTransit += emission;
      } else {
        totals.vehicle += emission;
      }

      return totals;
    },
    { vehicle: 0, flight: 0, publicTransit: 0 }
  );

  const electricityUnits = Math.max(normalizeNumber(form?.electricity?.units), 0);
  const acDays = Math.max(normalizeNumber(form?.electricity?.acDays, 30), 0);
  const geyserDays = Math.max(normalizeNumber(form?.electricity?.geyserDays, 30), 0);
  const acHours = Math.max(normalizeNumber(form?.electricity?.acHours), 0);
  const geyserHours = Math.max(normalizeNumber(form?.electricity?.geyserHours), 0);
  const fridgeHours = Math.max(normalizeNumber(form?.electricity?.fridgeHours, 24), 0);
  const acKwh = wattsToKwh(AC_WATTAGE, acHours, acDays);
  const geyserKwh = wattsToKwh(GEYSER_WATTAGE, geyserHours, geyserDays);
  const fridgeKwh = wattsToKwh(FRIDGE_WATTAGE, fridgeHours, 30);
  const applianceUnits = acKwh + fridgeKwh;
  const electricityEmission = (electricityUnits + applianceUnits) * getStateElectricityFactor();

  const waterLiters = Math.max(normalizeNumber(form?.water?.liters), 0);
  const waterType = form?.water?.waterType || 'normal water';
  const supplyEmission = waterLiters * WATER_SUPPLY_FACTOR * 30;
  const hotWaterEmission = waterType === 'hot water' ? geyserKwh * ELECTRICITY_FACTOR : 0;
  const waterEmission = supplyEmission + hotWaterEmission;

  const foodType = form?.food?.dietType || 'veg';
  const dairyConsumption = form?.food?.dairyConsumption || 'medium';
  const foodWasteLevel = form?.food?.foodWasteLevel || 'medium';
  const dairyMultiplier = dairyConsumption === 'high' ? FOOD_HIGH_DAIRY_MULTIPLIER : 1;
  const foodWasteMultiplier = foodWasteLevel === 'high' ? FOOD_HIGH_WASTE_MULTIPLIER : 1;
  const foodEmission =
    (FOOD_DAILY_FACTORS[foodType] || FOOD_VEGETARIAN_DAILY) *
    30 *
    dairyMultiplier *
    foodWasteMultiplier;

  const shoppingSpend = Math.max(normalizeNumber(form?.lifestyle?.shoppingSpend), 0);
  const shoppingEmission = shoppingSpend * SHOPPING_GENERAL_FACTOR;

  const lpgCylinders = Math.max(normalizeNumber(form?.food?.lpgCylinders), 0);
  const lpgEmission = lpgCylinders * LPG_CYLINDER_FACTOR;

  const basicBreakdown = {
    vehicle: transportTotals.vehicle,
    flight: transportTotals.flight,
    electricity: electricityEmission,
    water: waterEmission,
    food: foodEmission,
    shopping: shoppingEmission,
    lpg: lpgEmission,
  };

  const advancedBreakdown = form?.advancedEnabled === false
    ? {
        digital: 0,
        pets: 0,
        work: 0,
        greenActions: 0,
        homeInfrastructure: 0,
      }
    : {
        digital: calculateDigitalFootprint(form?.advanced?.digital),
        pets: calculatePetFootprint(form?.advanced?.pets),
        work: calculateWorkEnvironmentFootprint(form?.advanced?.work),
        greenActions: calculateGreenActionsOffset(form?.advanced?.greenActions),
        homeInfrastructure: calculateHomeInfrastructureFootprint(form?.advanced?.homeInfrastructure),
      };

  const monthlyBreakdown = {
    ...basicBreakdown,
    ...advancedBreakdown,
  };

  const basicEmission = Object.values(basicBreakdown).reduce((sum, value) => sum + value, 0);
  const advancedEmission = Object.values(advancedBreakdown).reduce((sum, value) => sum + value, 0);
  const totalEmission = Object.values(monthlyBreakdown).reduce((sum, value) => sum + value, 0);
  const yearlyEmission = totalEmission * 12;
  const perPersonEmission = totalEmission;
  const treesNeeded = yearlyEmission / TREE_OFFSET_PER_YEAR;
  const shareBase =
    Object.values(monthlyBreakdown).reduce((sum, value) => sum + Math.abs(value), 0) || 1;
  const categoryBreakdown = Object.entries(monthlyBreakdown).map(([name, value]) => ({
    name,
    label:
      ADVANCED_LABELS[name] ||
      name.charAt(0).toUpperCase() + name.slice(1),
    value,
    percentage: (Math.abs(value) / shareBase) * 100,
    isOffset: value < 0,
  }));

  const highestCategory =
    [...categoryBreakdown]
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)[0]?.name || 'electricity';

  const carbonLevel =
    totalEmission < LOW_CARBON_THRESHOLD
      ? 'Low'
      : totalEmission < MEDIUM_CARBON_THRESHOLD
      ? 'Medium'
      : 'High';
  const appScore = Math.max(
    APP_SCORE_MIN,
    Math.min(APP_SCORE_MAX, Math.round(100 - totalEmission / APP_SCORE_DIVISOR))
  );

  return {
    totalEmission,
    yearlyEmission,
    perPersonEmission,
    treesNeeded,
    categoryBreakdown,
    monthlyBreakdown,
    basicBreakdown,
    advancedBreakdown,
    basicEmission,
    advancedEmission,
    transportMeta: transportTotals,
    highestCategory,
    appScore,
    ecoScore: appScore,
    carbonLevel,
  };
};
