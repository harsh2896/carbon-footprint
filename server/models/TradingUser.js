const { Schema, model } = require('mongoose');

const tradingUserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, 'Must be a valid email address'],
    },
    carbonEmission: {
      type: Number,
      required: true,
      min: 0,
    },
    credits: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['App Saver', 'Needs App Credits'],
      default: 'App Saver',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model('TradingUser', tradingUserSchema);
