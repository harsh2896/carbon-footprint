const { Schema, model } = require('mongoose');

const tradeSchema = new Schema(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'TradingUser',
      required: true,
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: 'TradingUser',
      required: true,
    },
    credits: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['completed', 'listed'],
      default: 'completed',
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model('Trade', tradeSchema);
