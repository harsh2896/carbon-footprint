const express = require('express');
const {
  getWeatherByCoordinates,
  getAirQualityByCoordinates,
  searchCities,
} = require('../utils/weatherService');

const router = express.Router();

const parseCoordinates = (req, res) => {
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    res.status(400).json({
      error: 'Valid lat and lon query parameters are required.',
    });
    return null;
  }

  return { lat, lon };
};

router.get('/search', async (req, res) => {
  const query = String(req.query.q || '').trim();

  if (query.length < 2) {
    res.json({
      results: [],
    });
    return;
  }

  try {
    const results = await searchCities(query);

    res.json({
      results,
    });
  } catch (error) {
    console.error('City search route failed:', error);
    res.status(error.statusCode || 500).json({
      error: error.message || 'Unable to search cities.',
    });
  }
});

router.get('/weather', async (req, res) => {
  const coordinates = parseCoordinates(req, res);

  if (!coordinates) {
    return;
  }

  try {
    const weather = await getWeatherByCoordinates(
      coordinates.lat,
      coordinates.lon
    );

    res.json(weather);
  } catch (error) {
    console.error('Weather route failed:', error);
    res.status(error.statusCode || 500).json({
      error: error.message || 'Unable to load weather data.',
    });
  }
});

router.get('/aqi', async (req, res) => {
  const coordinates = parseCoordinates(req, res);

  if (!coordinates) {
    return;
  }

  try {
    const airQuality = await getAirQualityByCoordinates(
      coordinates.lat,
      coordinates.lon
    );

    res.json(airQuality);
  } catch (error) {
    console.error('AQI route failed:', error);
    res.status(error.statusCode || 500).json({
      error: error.message || 'Unable to load AQI data.',
    });
  }
});

module.exports = router;
