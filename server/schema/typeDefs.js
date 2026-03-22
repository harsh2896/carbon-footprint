const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Home {
    _id: ID
    waterEmissions: Int
    electricityEmissions: Int
    heatEmissions: Int
  }

  type Travel {
    _id: ID
    vehicleEmissions: Int
    publicTransitEmissions: Int
    planeEmissions: Int
  }

  type CarbonData {
    electricity: Int
    water: Int
    heat: Int
    vehicle: Int
    publicTransit: Int
    flights: Int
    total: Int
    createdAt: String
  }

  type Pledge {
    _id: ID
    title: String
    description: String
    createdAt: String
  }

  type User {
    _id: ID
    username: String
    email: String
    age: Int
    bio: String
    profileImage: String
    state: String
    city: String
    carbonFootprint: Int
    homeData: [Home]
    travelData: [Travel]
    carbonData: [CarbonData]
    pledges: [Pledge]
  }

  type Auth {
    token: ID!
    user: User
  }

  type Query {
    me: User
    leaderboard: [User]
  }

  type Mutation {
    login(email: String!, password: String!): Auth
    addUser(username: String!, email: String!, password: String!): Auth
    addTravel(
      vehicleEmissions: Int!
      publicTransitEmissions: Int!
      planeEmissions: Int!
    ): User
    addHome(
      waterEmissions: Int!
      electricityEmissions: Int!
      heatEmissions: Int!
    ): User
    addPledge(title: String!, description: String!): Pledge
    saveFootprint(
      electricity: Int!
      water: Int!
      heat: Int!
      vehicle: Int!
      publicTransit: Int!
      flights: Int!
      totalCarbon: Int!
    ): User
  }
`;

module.exports = typeDefs;
