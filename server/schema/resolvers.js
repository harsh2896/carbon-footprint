const { User, Pledge } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    // get all data on a user
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select('-__v -password')
          .populate('homeData')
          .populate('travelData')
          .populate('pledges');

        return userData;
      }

      throw new AuthenticationError('Not logged in');
    },
    leaderboard: async () => {
      const leaderboard = await User.find({})
        .select('username carbonFootprint')
        .sort({ carbonFootprint: 1 })
        .limit(10);

      return leaderboard;
    },

  },

  Mutation: {
    // add a user
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },

    // login as a user
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }
      const token = signToken(user);
      return { token, user };
    },

    addTravel: async (
      parent,
      { vehicleEmissions, publicTransitEmissions, planeEmissions },
      context
    ) => {
      if (context.user) {
        const existingUser = await User.findById(context.user._id).select(
          'homeData'
        );
        const existingHome = existingUser?.homeData?.[0];
        const totalCarbonFootprint =
          (existingHome?.waterEmissions || 0) +
          (existingHome?.electricityEmissions || 0) +
          (existingHome?.heatEmissions || 0) +
          vehicleEmissions +
          publicTransitEmissions +
          planeEmissions;

        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          {
            $set: {
              travelData: {
                vehicleEmissions,
                publicTransitEmissions,
                planeEmissions,
              },
              carbonFootprint: totalCarbonFootprint,
            },
          },
          { new: true }
        ).populate('travelData');

        return updatedUser;
      }

      throw new AuthenticationError('Not logged in');
    },

    addHome: async (
      parent,
      { waterEmissions, electricityEmissions, heatEmissions },
      context
    ) => {
      if (context.user) {
        const existingUser = await User.findById(context.user._id).select(
          'travelData'
        );
        const existingTravel = existingUser?.travelData?.[0];
        const totalCarbonFootprint =
          waterEmissions +
          electricityEmissions +
          heatEmissions +
          (existingTravel?.vehicleEmissions || 0) +
          (existingTravel?.publicTransitEmissions || 0) +
          (existingTravel?.planeEmissions || 0);

        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          {
            $set: {
              homeData: { waterEmissions, electricityEmissions, heatEmissions },
              carbonFootprint: totalCarbonFootprint,
            },
          },
          { new: true }
        ).populate('homeData');

        return updatedUser;
      }

      throw new AuthenticationError('Not logged in');
    },

    addPledge: async (parent, { title, description }, context) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('addPledge args:', { title, description });
        console.log('User:', context.user?._id);
      }

      if (!context.user) {
        throw new AuthenticationError('Not logged in');
      }

      const pledge = await Pledge.create({ title, description });
      if (process.env.NODE_ENV !== 'production') {
        console.log('Pledge created:', pledge._id);
      }

      await User.findByIdAndUpdate(
        context.user._id,
        { $push: { pledges: pledge._id } },
        { new: true }
      );

      return pledge;
    },
    saveFootprint: async (
      parent,
      { electricity, water, heat, vehicle, publicTransit, flights, totalCarbon },
      context
    ) => {
      if (!context.user) {
        throw new AuthenticationError('Not logged in');
      }

      const updatedUser = await User.findByIdAndUpdate(
        context.user._id,
        {
          $push: {
            carbonData: {
              electricity,
              water,
              heat,
              vehicle,
              publicTransit,
              flights,
              total: totalCarbon,
              createdAt: new Date(),
            },
          },
          $set: {
            carbonFootprint: totalCarbon,
          },
        },
        { new: true }
      );

      return updatedUser;
    },
  },
};

module.exports = resolvers;
