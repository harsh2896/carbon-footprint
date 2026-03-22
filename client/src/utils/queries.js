import { gql } from '@apollo/client';

export const QUERY_ME = gql`
  {
    me {
      _id
      username
      email
      age
      bio
      profileImage
      state
      city
      carbonFootprint
      homeData {
        _id
        waterEmissions
        electricityEmissions
        heatEmissions
      }
      travelData {
        _id
        vehicleEmissions
        publicTransitEmissions
        planeEmissions
      }
      carbonData {
        electricity
        water
        heat
        vehicle
        publicTransit
        flights
        total
        createdAt
      }
      pledges {
        _id
        title
        description
        createdAt
      }
    }
  }
`;

export const LEADERBOARD_QUERY = gql`
  {
    leaderboard {
      _id
      username
      carbonFootprint
    }
  }
`;
