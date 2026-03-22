const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

// import apollo server
const { ApolloServer } = require('apollo-server-express');
const { authMiddleware } = require('./utils/auth');
const aiRoutes = require('./routes/aiRoutes');
const newsRoutes = require('./routes/newsRoutes');
const tradingRoutes = require('./routes/tradingRoutes');
const weatherRoutes = require('./routes/weather');
const userRoutes = require('./routes/userRoutes');
console.log('API KEY:', process.env.GEMINI_API_KEY ? 'Loaded' : 'Missing');

// import our typeDefs and resolvers
const { typeDefs, resolvers } = require('./schema');
const db = require('./config/connection');

const PORT = process.env.PORT || 3001;
// create a new Apollo server and pass in our schema
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/api', aiRoutes);
app.use('/api', newsRoutes);
app.use('/api', weatherRoutes);
app.use('/api', userRoutes);
app.use('/api/trading', tradingRoutes);

// create a new instance of an Apollo server with GraphQL schema
const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();
  // integrate our apollo server with the Exress application as middleware
  server.applyMiddleware({ app });

  // serve up static assets in production only
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/build/index.html'));
    });
  }

  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      // log where we can go to test our GQL API
      console.log(
        `Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  });
};

// call the async function to start the server
startApolloServer(typeDefs, resolvers);
