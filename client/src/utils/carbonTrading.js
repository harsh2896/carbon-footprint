import { CARBON_LIMIT, DEFAULT_PRICE_PER_CREDIT } from './emissionFactors';

const USERS_KEY = 'carbon-trading-users';
const TRADES_KEY = 'carbon-trading-trades';
const CURRENT_USER_KEY = 'carbon-trading-current-user';

const DEFAULT_USERS = [
  { id: 'seller-1', name: 'Aarav Green', email: 'aarav@example.com', emission: 62, credits: 38 },
  { id: 'seller-2', name: 'Maya Earth', email: 'maya@example.com', emission: 84, credits: 16 },
  { id: 'seller-3', name: 'Riya Solar', email: 'riya@example.com', emission: 108, credits: 0 },
  { id: 'seller-4', name: 'Kabir Wind', email: 'kabir@example.com', emission: 73, credits: 27 },
];

// Calculate local marketplace app credits for the UI.
export const calculateCreditSummary = (carbonEmission) => {
  const emission = Number(carbonEmission || 0);
  const withinAppLimit = emission <= CARBON_LIMIT;
  const difference = Math.abs(CARBON_LIMIT - emission);

  return {
    carbonEmission: emission,
    carbonLimit: CARBON_LIMIT,
    credits: withinAppLimit ? difference : 0,
    creditsNeeded: withinAppLimit ? 0 : difference,
    status: withinAppLimit ? 'App Saver' : 'Needs App Credits',
  };
};

// Seed local marketplace data once for a beginner-friendly demo.
export const initializeTradingStorage = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
  }

  if (!localStorage.getItem(TRADES_KEY)) {
    localStorage.setItem(TRADES_KEY, JSON.stringify([]));
  }
};

// Safely read users from localStorage.
export const getStoredUsers = () => {
  initializeTradingStorage();

  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch (error) {
    return [];
  }
};

// Safely read trades from localStorage.
export const getStoredTrades = () => {
  initializeTradingStorage();

  try {
    return JSON.parse(localStorage.getItem(TRADES_KEY)) || [];
  } catch (error) {
    return [];
  }
};

// Read the active marketplace user.
export const getCurrentTradingUser = () => {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY)) || null;
  } catch (error) {
    return null;
  }
};

// Persist all marketplace users.
export const saveStoredUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Persist all local transactions.
export const saveStoredTrades = (trades) => {
  localStorage.setItem(TRADES_KEY, JSON.stringify(trades));
};

// Persist the active marketplace user.
export const saveCurrentTradingUser = (user) => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};

// Create or update the current user in the local marketplace.
export const upsertCurrentUser = (input) => {
  const users = getStoredUsers();
  const existing = getCurrentTradingUser();
  const summary = calculateCreditSummary(input.emission);
  const nextUser = {
    id: existing?.id || `buyer-${Date.now()}`,
    backendId: existing?.backendId || null,
    name: input.name,
    email: input.email,
    emission: summary.carbonEmission,
    credits: summary.credits,
    status: summary.status,
  };

  const updatedUsers = [...users.filter((user) => user.id !== nextUser.id), nextUser];

  saveStoredUsers(updatedUsers);
  saveCurrentTradingUser(nextUser);

  return {
    user: nextUser,
    users: updatedUsers,
    summary,
  };
};

// Buy app credits from a seller and persist a local transaction.
export const buyCreditsLocally = ({
  sellerId,
  buyerId,
  credits,
  pricePerCredit = DEFAULT_PRICE_PER_CREDIT,
}) => {
  const numericCredits = Number(credits);
  const users = getStoredUsers();
  const seller = users.find((user) => user.id === sellerId);
  const buyer = users.find((user) => user.id === buyerId);

  if (!Number.isFinite(numericCredits) || numericCredits <= 0) {
    throw new Error('Choose a valid number of app credits to buy.');
  }

  if (!seller || !buyer) {
    throw new Error('Buyer or seller was not found in local marketplace storage.');
  }

  if (seller.credits < numericCredits) {
    throw new Error('Seller does not have enough app credits available.');
  }

  seller.credits -= numericCredits;
  buyer.credits += numericCredits;

  const trade = {
    id: `trade-${Date.now()}`,
    sellerId,
    buyerId,
    credits: numericCredits,
    price: numericCredits * Number(pricePerCredit),
    date: new Date().toISOString(),
  };

  const trades = [trade, ...getStoredTrades()];

  saveStoredUsers(users);
  saveStoredTrades(trades);
  saveCurrentTradingUser(buyer);

  return { users: [...users], trades, trade, buyer, seller };
};

// Add more app credits to the current user to simulate listing more credits for sale.
export const sellCreditsLocally = ({ credits }) => {
  const numericCredits = Number(credits);
  const currentUser = getCurrentTradingUser();
  const users = getStoredUsers();

  if (!Number.isFinite(numericCredits) || numericCredits <= 0) {
    throw new Error('Choose a valid number of app credits to sell.');
  }

  if (!currentUser) {
    throw new Error('Create your wallet before selling app credits.');
  }

  const updatedUsers = users.map((user) =>
    user.id === currentUser.id ? { ...user, credits: user.credits + numericCredits } : user
  );
  const updatedCurrentUser = updatedUsers.find((user) => user.id === currentUser.id);

  saveStoredUsers(updatedUsers);
  saveCurrentTradingUser(updatedCurrentUser);

  return {
    users: updatedUsers,
    user: updatedCurrentUser,
  };
};

// Merge backend identifiers into the active local user record.
export const attachBackendIdToCurrentUser = (backendId) => {
  const currentUser = getCurrentTradingUser();
  if (!currentUser) return null;

  const nextUser = { ...currentUser, backendId };
  const users = getStoredUsers().map((user) =>
    user.id === currentUser.id ? nextUser : user
  );

  saveStoredUsers(users);
  saveCurrentTradingUser(nextUser);

  return nextUser;
};

// Basic REST helper for the trading backend.
export const tradingApiRequest = async (path, options = {}) => {
  const response = await fetch(`/api/trading${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Trading API request failed.');
  }

  return data;
};

export { CARBON_LIMIT, USERS_KEY, TRADES_KEY, CURRENT_USER_KEY };
