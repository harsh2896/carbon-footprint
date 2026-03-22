const normalizeNumber = (value) => Number(value) || 0;

const normalizeCategory = (highestCategory = '') => {
  const category = highestCategory.toLowerCase();

  const categoryMap = {
    vehicle: 'vehicle',
    transport: 'vehicle',
    personal: 'vehicle',
    electricity: 'electricity',
    electric: 'electricity',
    water: 'water',
    flight: 'flight',
    flights: 'flight',
    lpg: 'lpg',
    cooking: 'lpg',
    food: 'food',
    shopping: 'shopping',
    lifestyle: 'shopping',
  };

  return categoryMap[category] || 'vehicle';
};

const rule = (condition, message, impact) => ({
  condition,
  message,
  impact,
});

const RULES = {
  vehicle: [
    rule(
      (data) => normalizeNumber(data.vehicle) > 3500,
      '🚗 Replace some solo car trips with metro, bus, or shared rides.',
      'High (~25% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.vehicle) > 2500 && data.traffic === 'high',
      '🚦 Avoid peak-hour driving to cut idling fuel burn on routine routes.',
      'High (~18% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.vehicle) > 2200 && !data.carpool,
      '👥 Start carpooling for office or school commutes at least 2-3 days a week.',
      'High (~20% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.vehicle) > 1800 && normalizeNumber(data.workFromHomeDays) < 2,
      '🏠 Add more work-from-home days where possible to remove repeat commute emissions.',
      'High (~15% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.vehicle) > 1500,
      '🗺️ Combine errands into one planned trip instead of multiple short drives.',
      'Medium (~10% CO2 reduction)'
    ),
    rule(
      (data) => data.traffic === 'high',
      '⏰ Shift commute timing slightly earlier or later to avoid stop-and-go traffic.',
      'Medium (~8% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.publicTransportPreference) < 30,
      '🚌 Increase public transport use for predictable weekly travel.',
      'Medium (~12% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.vehicle) > 900,
      '🔧 Keep tyre pressure and servicing up to date to improve mileage.',
      'Medium (~5% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.vehicle) > 700,
      '🚶 Replace very short neighborhood trips with walking or cycling.',
      'Medium (~6% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.vehicle) > 500,
      '📍 Choose one or two no-car days each week to cut baseline fuel use.',
      'Medium (~7% CO2 reduction)'
    ),
    rule(
      () => true,
      '🚗 Use public transport or carpool for one regular trip each week to begin reducing vehicle emissions.',
      'Starter (~5% CO2 reduction)'
    ),
  ],
  electricity: [
    rule(
      (data) => normalizeNumber(data.electricity) > 3000,
      '⚡ Replace old ACs, refrigerators, and fans with efficient models when upgrading.',
      'High (~25% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.electricity) > 2400,
      '❄️ Raise AC temperature by 1-2°C and use fans to reduce cooling load.',
      'High (~18% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.electricity) > 2200 && normalizeNumber(data.renewablePercent) < 20,
      '🌞 Increase renewable electricity share if your building or provider allows it.',
      'High (~20% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.electricity) > 1800,
      '💡 Shift all frequently used lights to LEDs and switch off idle lighting.',
      'Medium (~10% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.electricity) > 1600,
      '🔌 Unplug idle chargers and use switchable power strips for standby-heavy devices.',
      'Medium (~6% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.electricity) > 1400,
      '🧺 Run washing and cooling appliances only with efficient settings and full loads.',
      'Medium (~8% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.renewablePercent) >= 20 && normalizeNumber(data.renewablePercent) < 50,
      '🌤️ Push renewable coverage above 50% to unlock a more noticeable electricity drop.',
      'Medium (~12% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.electricity) > 1100,
      '🏠 Improve sealing, curtains, and airflow so AC and fans run for less time.',
      'Medium (~9% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.electricity) > 900,
      '📱 Track your monthly electricity spikes and target the top one or two devices first.',
      'Medium (~5% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.electricity) > 600,
      '⏱️ Set appliance timers so cooling and entertainment devices do not run longer than needed.',
      'Medium (~5% CO2 reduction)'
    ),
    rule(
      () => true,
      '⚡ Start by reducing AC runtime and switching off idle electronics each day.',
      'Starter (~5% CO2 reduction)'
    ),
  ],
  water: [
    rule(
      (data) => normalizeNumber(data.water) > 1800,
      '🚿 Cut shower time by a few minutes and reduce heated water use first.',
      'High (~20% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.water) > 1500,
      '🧺 Wash only full laundry loads to avoid repeat water and electricity cycles.',
      'High (~15% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.water) > 1400,
      '🔧 Fix dripping taps and leaking flush systems before making other changes.',
      'High (~12% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.water) > 1200,
      '🚽 Use dual-flush or lower-volume flush habits where possible.',
      'Medium (~8% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.water) > 1100,
      '🥶 Avoid unnecessary hot-water use for cleaning tasks that work with normal water.',
      'Medium (~7% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.water) > 900,
      '💧 Install aerators or low-flow fixtures in the most-used taps and showers.',
      'Medium (~10% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.water) > 800,
      '🪣 Reuse greywater where practical for cleaning or plants instead of fresh water.',
      'Medium (~6% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.water) > 700,
      '📊 Track high-use routines like showering, laundry, and RO discard water separately.',
      'Medium (~5% CO2 reduction)'
    ),
    rule(
      () => true,
      '🚿 Start with shorter showers and full-load laundry cycles to cut water-related emissions.',
      'Starter (~5% CO2 reduction)'
    ),
  ],
  flight: [
    rule(
      (data) => normalizeNumber(data.flight) > 4000,
      '✈️ Replace one short-haul flight with train travel whenever the route is practical.',
      'High (~30% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.flight) > 3000,
      '🧳 Combine multiple flight-based trips into one longer, better-planned journey.',
      'High (~22% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.flight) > 2500,
      '📹 Shift routine meetings to video calls instead of booking extra flights.',
      'High (~20% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.flight) > 1800,
      '🛫 Prefer direct flights to reduce takeoff-heavy emissions from extra segments.',
      'Medium (~10% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.flight) > 1500,
      '🗓️ Group personal travel around fewer annual flight windows instead of frequent trips.',
      'Medium (~12% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.flight) > 1200,
      '🎒 Travel lighter when flying, especially on repeat routes, to reduce fuel demand marginally.',
      'Medium (~3% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.flight) > 900,
      '🌍 Reserve offsets only after first reducing avoidable flights in your schedule.',
      'Medium (~5% CO2 reduction)'
    ),
    rule(
      () => true,
      '✈️ Start by replacing the easiest short flight with a lower-carbon alternative this year.',
      'Starter (~8% CO2 reduction)'
    ),
  ],
  lpg: [
    rule(
      (data) => normalizeNumber(data.lpg) > 1500,
      '🔥 Batch cook and reheat efficiently so gas is not used for repeated small sessions.',
      'High (~18% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.lpg) > 1200,
      '🍲 Use lids and pressure cooking more often to shorten stove time.',
      'High (~15% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.lpg) > 1000,
      '⚙️ Service burners regularly so the flame stays efficient and fully blue.',
      'Medium (~8% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.lpg) > 900,
      '🍛 Cook multiple dishes in sequence while the stove is already hot.',
      'Medium (~7% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.lpg) > 800,
      '🍽️ Prep ingredients before turning on the stove to reduce active flame time.',
      'Medium (~6% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.lpg) > 700,
      '⚡ Shift small reheating tasks to microwave or induction where they are more efficient.',
      'Medium (~9% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.lpg) > 600,
      '🥘 Plan weekly meals to avoid repeated cooking for the same ingredients.',
      'Medium (~5% CO2 reduction)'
    ),
    rule(
      () => true,
      '🔥 Start by using lids and shorter cooking cycles to reduce LPG-related emissions.',
      'Starter (~5% CO2 reduction)'
    ),
  ],
  food: [
    rule(
      (data) => normalizeNumber(data.food) > 1800 && data.dietType === 'non-veg',
      '🥗 Replace a few meat-heavy meals each week with plant-based alternatives.',
      'High (~20% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.food) > 1500 && data.dietType === 'eggetarian',
      '🍛 Add more low-carbon vegetarian meals to reduce routine food emissions.',
      'High (~15% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.food) > 1400,
      '🧾 Plan meals and grocery lists carefully to cut food waste and duplicate buying.',
      'High (~12% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.food) > 1200,
      '🥬 Choose local and seasonal produce more often instead of highly transported items.',
      'Medium (~8% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.food) > 1100,
      '🍱 Cook at home more often if packaged or delivered meals are frequent.',
      'Medium (~9% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.food) > 900,
      '🥡 Reduce oversized portions and save leftovers to avoid hidden waste emissions.',
      'Medium (~6% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.food) > 800 && data.dietType !== 'vegan',
      '🌱 Try one fully plant-based day each week to lower your food footprint steadily.',
      'Medium (~7% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.food) > 700,
      '🛒 Buy only what will be used within the week, especially perishable foods.',
      'Medium (~5% CO2 reduction)'
    ),
    rule(
      () => true,
      '🥗 Start with one lower-carbon meal swap each week and reduce food waste at home.',
      'Starter (~5% CO2 reduction)'
    ),
  ],
  shopping: [
    rule(
      (data) => normalizeNumber(data.shopping) > 2200,
      '🛍️ Cut non-essential monthly purchases and focus on fewer, longer-lasting items.',
      'High (~20% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.shopping) > 1800,
      '👕 Slow down clothing purchases and choose durable basics over fast-fashion items.',
      'High (~18% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.shopping) > 1600,
      '🔁 Repair, reuse, or resell devices before replacing them with new products.',
      'High (~15% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.shopping) > 1400,
      '📦 Combine online orders to reduce packaging and shipping-related emissions.',
      'Medium (~8% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.shopping) > 1200,
      '📋 Add a 24-hour wait before discretionary purchases to reduce impulse buying.',
      'Medium (~7% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.shopping) > 1100,
      '♻️ Prefer second-hand, refurbished, or rental options for occasional-use products.',
      'Medium (~10% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.shopping) > 900,
      '🧵 Choose quality products with repair support instead of short-life replacements.',
      'Medium (~6% CO2 reduction)'
    ),
    rule(
      (data) => normalizeNumber(data.shopping) > 700,
      '🎯 Set a monthly purchase cap for non-essential items to keep embodied carbon in check.',
      'Medium (~5% CO2 reduction)'
    ),
    rule(
      () => true,
      '🛍️ Start by delaying one non-essential purchase and prioritizing durable items.',
      'Starter (~5% CO2 reduction)'
    ),
  ],
};

export const getRuleSuggestions = (data, highestCategory) => {
  const normalizedCategory = normalizeCategory(highestCategory);
  const categoryRules = RULES[normalizedCategory] || RULES.vehicle;

  return categoryRules
    .filter((item) => item.condition(data))
    .slice(0, 3)
    .map((item) => ({
      message: item.message,
      impact: item.impact,
    }));
};
