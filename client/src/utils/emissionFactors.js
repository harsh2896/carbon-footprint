const createFactor = (value, unit, source, year, notes) => ({
  value,
  unit,
  source,
  year,
  notes,
});

export const EMISSION_FACTORS = {
  transport: {
    fuel: {
      petrol: createFactor(2.31, 'kg CO2/liter', 'IPCC / India standard combustion factor', 2023),
      diesel: createFactor(2.68, 'kg CO2/liter', 'IPCC / India standard combustion factor', 2023),
      cng: createFactor(2.75, 'kg CO2/kg', 'IPCC / India standard combustion factor', 2023),
    },
    electricVehicleEfficiency: createFactor(
      0.12,
      'kWh/km',
      'Default EV efficiency for passenger vehicles in India',
      2023
    ),
    publicTransport: {
      bus: createFactor(0.05, 'kg CO2/passenger-km', 'India public transport benchmark', 2023),
      train: createFactor(0.03, 'kg CO2/passenger-km', 'India public transport benchmark', 2023),
      metro: createFactor(0.02, 'kg CO2/passenger-km', 'India public transport benchmark', 2023),
    },
    flights: {
      shortHaul: createFactor(0.115, 'kg CO2/passenger-km', 'Aviation passenger average', 2023),
      longHaul: createFactor(0.09, 'kg CO2/passenger-km', 'Aviation passenger average', 2023),
      longHaulThreshold: createFactor(1500, 'km', 'Product rule for flight categorization', 2023),
    },
  },
  electricity: {
    indiaGrid: createFactor(0.82, 'kg CO2/kWh', 'India CEA grid emission factor', 2023),
    appliances: {
      ac: createFactor(1500, 'W', 'Typical household split AC load', 2023),
      geyser: createFactor(2000, 'W', 'Typical residential storage geyser load', 2023),
      fridge: createFactor(200, 'W', 'Typical refrigerator running load', 2023),
      laptop: createFactor(50, 'W', 'Typical laptop operating load', 2023),
    },
  },
  lpg: {
    perKg: createFactor(2.98, 'kg CO2/kg LPG', 'IPCC stationary combustion factor', 2023),
    cylinderWeight: createFactor(14.2, 'kg LPG/cylinder', 'India domestic LPG cylinder size', 2023),
    perCylinder: createFactor(42, 'kg CO2/cylinder', 'India domestic LPG cylinder estimate', 2023),
  },
  water: {
    supply: createFactor(0.000344, 'kg CO2/liter', 'Water supply and treatment estimate', 2023),
  },
  food: {
    vegan: createFactor(1.5, 'kg CO2/day', 'India diet benchmark', 2023),
    vegetarian: createFactor(2.0, 'kg CO2/day', 'India diet benchmark', 2023),
    nonVegetarian: createFactor(3.3, 'kg CO2/day', 'India diet benchmark', 2023),
    highDairyMultiplier: createFactor(1.2, 'multiplier', 'Product rule for dairy-heavy diet', 2023),
    highWasteMultiplier: createFactor(1.15, 'multiplier', 'Product rule for food waste uplift', 2023),
  },
  shopping: {
    clothing: createFactor(0.0006, 'kg CO2/INR', 'Simplified EEIO spending factor', 2023),
    electronics: createFactor(0.0009, 'kg CO2/INR', 'Simplified EEIO spending factor', 2023),
    general: createFactor(0.0005, 'kg CO2/INR', 'Simplified EEIO spending factor', 2023),
  },
  digital: {
    screen: createFactor(0.04, 'kg CO2/hour', 'Digital use benchmark', 2023),
    streaming: createFactor(0.08, 'kg CO2/hour', 'Digital use benchmark', 2023),
    email: createFactor(0.004, 'kg CO2/email', 'Digital use benchmark', 2023),
  },
  offsets: {
    treePerYear: createFactor(21, 'kg CO2/tree/year', 'EPA style sequestration benchmark', 2023),
  },
  appScoring: {
    scoreDivisor: createFactor(18, 'kg CO2 per score point', 'App scoring heuristic', 2023),
    scoreMin: createFactor(8, 'score', 'App scoring heuristic', 2023),
    scoreMax: createFactor(100, 'score', 'App scoring heuristic', 2023),
    lowThreshold: createFactor(280, 'kg CO2/month', 'App carbon band threshold', 2023),
    mediumThreshold: createFactor(560, 'kg CO2/month', 'App carbon band threshold', 2023),
  },
  marketplace: {
    carbonLimit: createFactor(100, 'app credits baseline', 'Marketplace demo rule', 2023),
    pricePerCredit: createFactor(12, 'INR/app credit', 'Marketplace demo rule', 2023),
  },
};

export const INDIA_GRID_FACTOR = EMISSION_FACTORS.electricity.indiaGrid.value;
export const ELECTRICITY_FACTOR = INDIA_GRID_FACTOR;

export const PETROL_FACTOR = EMISSION_FACTORS.transport.fuel.petrol.value;
export const DIESEL_FACTOR = EMISSION_FACTORS.transport.fuel.diesel.value;
export const CNG_FACTOR = EMISSION_FACTORS.transport.fuel.cng.value;
export const EV_EFFICIENCY_FACTOR = EMISSION_FACTORS.transport.electricVehicleEfficiency.value;

export const BUS_FACTOR = EMISSION_FACTORS.transport.publicTransport.bus.value;
export const TRAIN_FACTOR = EMISSION_FACTORS.transport.publicTransport.train.value;
export const METRO_FACTOR = EMISSION_FACTORS.transport.publicTransport.metro.value;
export const SHORT_HAUL_FLIGHT_FACTOR = EMISSION_FACTORS.transport.flights.shortHaul.value;
export const LONG_HAUL_FLIGHT_FACTOR = EMISSION_FACTORS.transport.flights.longHaul.value;
export const LONG_HAUL_DISTANCE_THRESHOLD =
  EMISSION_FACTORS.transport.flights.longHaulThreshold.value;

export const AC_WATTAGE = EMISSION_FACTORS.electricity.appliances.ac.value;
export const GEYSER_WATTAGE = EMISSION_FACTORS.electricity.appliances.geyser.value;
export const FRIDGE_WATTAGE = EMISSION_FACTORS.electricity.appliances.fridge.value;
export const LAPTOP_WATTAGE = EMISSION_FACTORS.electricity.appliances.laptop.value;

export const LPG_KG_FACTOR = EMISSION_FACTORS.lpg.perKg.value;
export const LPG_CYLINDER_KG = EMISSION_FACTORS.lpg.cylinderWeight.value;
export const LPG_CYLINDER_FACTOR = EMISSION_FACTORS.lpg.perCylinder.value;

export const WATER_SUPPLY_FACTOR = EMISSION_FACTORS.water.supply.value;
export const WATER_FACTOR = WATER_SUPPLY_FACTOR;

export const FOOD_VEGAN_DAILY = EMISSION_FACTORS.food.vegan.value;
export const FOOD_VEGETARIAN_DAILY = EMISSION_FACTORS.food.vegetarian.value;
export const FOOD_NON_VEG_DAILY = EMISSION_FACTORS.food.nonVegetarian.value;
export const FOOD_HIGH_DAIRY_MULTIPLIER = EMISSION_FACTORS.food.highDairyMultiplier.value;
export const FOOD_HIGH_WASTE_MULTIPLIER = EMISSION_FACTORS.food.highWasteMultiplier.value;
export const FOOD_VEG_DAILY = FOOD_VEGETARIAN_DAILY;

export const SHOPPING_GENERAL_FACTOR = EMISSION_FACTORS.shopping.general.value;
export const SHOPPING_CLOTHING_FACTOR = EMISSION_FACTORS.shopping.clothing.value;
export const SHOPPING_ELECTRONICS_FACTOR = EMISSION_FACTORS.shopping.electronics.value;
export const SHOPPING_FACTOR = SHOPPING_GENERAL_FACTOR;

export const DIGITAL_SCREEN_FACTOR = EMISSION_FACTORS.digital.screen.value;
export const DIGITAL_STREAMING_FACTOR = EMISSION_FACTORS.digital.streaming.value;
export const DIGITAL_EMAIL_FACTOR = EMISSION_FACTORS.digital.email.value;

export const TREE_OFFSET_PER_YEAR = EMISSION_FACTORS.offsets.treePerYear.value;
export const TREE_OFFSET_PER_MONTH = TREE_OFFSET_PER_YEAR / 12;

export const APP_SCORE_DIVISOR = EMISSION_FACTORS.appScoring.scoreDivisor.value;
export const APP_SCORE_MIN = EMISSION_FACTORS.appScoring.scoreMin.value;
export const APP_SCORE_MAX = EMISSION_FACTORS.appScoring.scoreMax.value;
export const LOW_CARBON_THRESHOLD = EMISSION_FACTORS.appScoring.lowThreshold.value;
export const MEDIUM_CARBON_THRESHOLD = EMISSION_FACTORS.appScoring.mediumThreshold.value;

export const CARBON_LIMIT = EMISSION_FACTORS.marketplace.carbonLimit.value;
export const DEFAULT_PRICE_PER_CREDIT = EMISSION_FACTORS.marketplace.pricePerCredit.value;

export const DEFAULT_MILEAGE = 15;
export const ELECTRIC_FUEL_FACTOR = INDIA_GRID_FACTOR;
