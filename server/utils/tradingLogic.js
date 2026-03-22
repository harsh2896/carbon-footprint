const CARBON_LIMIT = 100;

// Calculate credits and status for a carbon emission value.
const calculateCreditProfile = (carbonEmission) => {
  const numericEmission = Number(carbonEmission || 0);
  const withinLimit = numericEmission <= CARBON_LIMIT;
  const difference = Math.abs(CARBON_LIMIT - numericEmission);

  return {
    carbonLimit: CARBON_LIMIT,
    carbonEmission: numericEmission,
    credits: withinLimit ? difference : 0,
    creditsNeeded: withinLimit ? 0 : difference,
    status: withinLimit ? 'App Saver' : 'Needs App Credits',
  };
};

module.exports = {
  CARBON_LIMIT,
  calculateCreditProfile,
};
