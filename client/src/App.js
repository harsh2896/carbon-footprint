import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  createHttpLink,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Calculator from './pages/Calculator';
import MyFootprint from './pages/MyFootprint';
import MyPledges from './pages/MyPledges';
import Leaderboard from './pages/Leaderboard';
import NoMatch from './pages/NoMatch';
import Donation from './pages/Donation';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Profile from './pages/Profile';
import Learn from './pages/Learn';
import News from './pages/News';
import CarbonTrading from './pages/CarbonTrading';
import Weather from './pages/Weather';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

const httpLink = createHttpLink({
  uri: '/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('id_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <div>
          <Navbar />
          <div id="app-shell">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/myfootprint" element={<MyFootprint />} />
              <Route path="/my-footprint" element={<MyFootprint />} />
              <Route path="/mypledges" element={<MyPledges />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/donation" element={<Donation />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/news" element={<News />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/carbon-trading" element={<CarbonTrading />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NoMatch />} />
            </Routes>
            <Footer />
          </div>
        </div>
      </Router>
    </ApolloProvider>
  );
}

export default App;
