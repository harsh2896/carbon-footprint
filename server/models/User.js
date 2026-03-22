const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');
const homeSchema = require('./Home');
const travelSchema = require('./Travel');
const carbonDataSchema = new Schema(
  {
    electricity: { type: Number, min: 0, default: 0 },
    water: { type: Number, min: 0, default: 0 },
    heat: { type: Number, min: 0, default: 0 },
    vehicle: { type: Number, min: 0, default: 0 },
    publicTransit: { type: Number, min: 0, default: 0 },
    flights: { type: Number, min: 0, default: 0 },
    total: { type: Number, min: 0, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+@.+\..+/, 'Must be a valid email address!'],
  },
  age: {
    type: Number,
    min: 0,
    default: 0,
  },
  bio: {
    type: String,
    trim: true,
    default: '',
  },
  profileImage: {
    type: String,
    default: '',
  },
  state: {
    type: String,
    trim: true,
    default: '',
  },
  city: {
    type: String,
    trim: true,
    default: '',
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
  },
  homeData: [homeSchema],
  travelData: [travelSchema],
  carbonFootprint: {
    type: Number,
    min: 0,
    default: 0,
  },
  carbonData: [carbonDataSchema],
  pledges: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Pledge',
    },
  ],
});

// set up pre-save middleware to create password
userSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('password')) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  next();
});

// compare the incoming password with the hashed password
userSchema.methods.isCorrectPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};


const User = model('User', userSchema);
module.exports = User;
