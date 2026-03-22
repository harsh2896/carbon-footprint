const TradingUser = require('../models/TradingUser');
const Trade = require('../models/Trade');
const { calculateCreditProfile, CARBON_LIMIT } = require('../utils/tradingLogic');

// Return a stable API shape for a trading user.
const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  carbonEmission: user.carbonEmission,
  credits: user.credits,
  status: user.status,
});

// Create a new marketplace user and pre-calculate their credits.
const createUser = async (req, res) => {
  try {
    const { name, email, carbonEmission } = req.body;
    const profile = calculateCreditProfile(carbonEmission);
    const user = await TradingUser.findOneAndUpdate(
      { email },
      {
        $set: {
          name,
          email,
          carbonEmission: profile.carbonEmission,
          credits: profile.credits,
          status: profile.status,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(201).json({
      message: 'Trading user saved successfully',
      user: serializeUser(user),
      calculation: profile,
    });
  } catch (error) {
    return res.status(400).json({
      message: 'Unable to create trading user',
      error: error.message,
    });
  }
};

// Fetch all trading users ordered by the strongest credit balance first.
const getUsers = async (req, res) => {
  try {
    const users = await TradingUser.find({}).sort({ credits: -1, carbonEmission: 1 });

    return res.json({
      carbonLimit: CARBON_LIMIT,
      users: users.map(serializeUser),
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to load trading users',
      error: error.message,
    });
  }
};

// Calculate trading credits without persisting a record.
const calculateCredits = async (req, res) => {
  try {
    const { carbonEmission } = req.body;
    const profile = calculateCreditProfile(carbonEmission);

    return res.json(profile);
  } catch (error) {
    return res.status(400).json({
      message: 'Unable to calculate app credits',
      error: error.message,
    });
  }
};

// Transfer credits from a seller to a buyer and persist the transaction.
const buyCredits = async (req, res) => {
  try {
    const { sellerId, buyerId, credits, price } = req.body;
    const numericCredits = Number(credits);
    const numericPrice = Number(price);

    if (!sellerId || !buyerId) {
      return res.status(400).json({ message: 'sellerId and buyerId are required' });
    }

    if (sellerId === buyerId) {
      return res.status(400).json({ message: 'Buyer and seller must be different users' });
    }

    if (!Number.isFinite(numericCredits) || numericCredits <= 0) {
      return res.status(400).json({ message: 'credits must be greater than zero' });
    }

    const [seller, buyer] = await Promise.all([
      TradingUser.findById(sellerId),
      TradingUser.findById(buyerId),
    ]);

    if (!seller || !buyer) {
      return res.status(404).json({ message: 'Buyer or seller not found' });
    }

    if (seller.credits < numericCredits) {
      return res.status(400).json({ message: 'Seller does not have enough credits available' });
    }

    seller.credits -= numericCredits;
    buyer.credits += numericCredits;

    await Promise.all([seller.save(), buyer.save()]);

    const trade = await Trade.create({
      sellerId,
      buyerId,
      credits: numericCredits,
      price: Number.isFinite(numericPrice) ? numericPrice : numericCredits * 12,
      status: 'completed',
      date: new Date(),
    });

    return res.json({
      message: 'App credits purchased successfully',
      trade,
      seller: serializeUser(seller),
      buyer: serializeUser(buyer),
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to complete credit purchase',
      error: error.message,
    });
  }
};

// Recalculate a user after they add more credits for sale.
const sellCredits = async (req, res) => {
  try {
    const { userId, credits, carbonEmission } = req.body;
    const numericCredits = Number(credits);

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    if (!Number.isFinite(numericCredits) || numericCredits <= 0) {
      return res.status(400).json({ message: 'credits must be greater than zero' });
    }

    const user = await TradingUser.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Trading user not found' });
    }

    const nextEmission =
      carbonEmission === undefined ? user.carbonEmission : Number(carbonEmission);
    const profile = calculateCreditProfile(nextEmission);

    user.carbonEmission = profile.carbonEmission;
    user.status = profile.status;
    user.credits = Math.max(user.credits, profile.credits) + numericCredits;

    await user.save();

    return res.json({
      message: 'App credits added to marketplace successfully',
      user: serializeUser(user),
      calculation: profile,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to add credits to marketplace',
      error: error.message,
    });
  }
};

// Fetch full transaction history with buyer and seller details.
const getTrades = async (req, res) => {
  try {
    const trades = await Trade.find({})
      .populate('sellerId', 'name email')
      .populate('buyerId', 'name email')
      .sort({ date: -1 });

    return res.json({ trades });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to load transaction history',
      error: error.message,
    });
  }
};

module.exports = {
  createUser,
  getUsers,
  calculateCredits,
  buyCredits,
  sellCredits,
  getTrades,
};
