const buildOpenWeatherUrl = (basePath, endpoint, params) => {
  const searchParams = new URLSearchParams({
    appid: process.env.OPENWEATHER_API_KEY || '',
    ...params,
  });

  return `https://api.openweathermap.org/${basePath}/${endpoint}?${searchParams.toString()}`;
};

const getFetch = async () => {
  if (typeof fetch === 'function') {
    return fetch;
  }

  const nodeFetch = await import('node-fetch');
  return nodeFetch.default;
};

const requestOpenWeather = async (basePath, endpoint, params) => {
  if (!process.env.OPENWEATHER_API_KEY) {
    const error = new Error('OpenWeatherMap API key is not configured.');
    error.statusCode = 500;
    throw error;
  }

  const requestUrl = buildOpenWeatherUrl(basePath, endpoint, params);
  const fetchClient = await getFetch();
  const response = await fetchClient(requestUrl);

  let payload = {};

  try {
    payload = await response.json();
  } catch (parseError) {
    const error = new Error('Invalid response from OpenWeatherMap.');
    error.statusCode = 502;
    throw error;
  }

  if (!response.ok) {
    const error = new Error(
      payload?.message || 'Unable to fetch data from OpenWeatherMap.'
    );
    error.statusCode = response.status || 502;
    throw error;
  }

  return payload;
};

const getWeatherByCoordinates = async (lat, lon) => {
  const payload = await requestOpenWeather('data/2.5', 'weather', {
    lat,
    lon,
    units: 'metric',
  });

  return {
    city: payload?.name || 'Unknown location',
    temperature: Math.round(payload?.main?.temp ?? 0),
    condition: payload?.weather?.[0]?.main || 'Unknown',
    description: payload?.weather?.[0]?.description || '',
    icon: payload?.weather?.[0]?.icon || '',
    humidity: payload?.main?.humidity ?? null,
  };
};

const getAirQualityByCoordinates = async (lat, lon) => {
  const payload = await requestOpenWeather('data/2.5', 'air_pollution', {
    lat,
    lon,
  });

  const measurement = payload?.list?.[0];

  if (!measurement) {
    const error = new Error('AQI data is unavailable for this location.');
    error.statusCode = 404;
    throw error;
  }

  return {
    aqi: measurement.main?.aqi ?? null,
    pm25: Number((measurement.components?.pm2_5 ?? 0).toFixed(1)),
    pm10: Number((measurement.components?.pm10 ?? 0).toFixed(1)),
  };
};

const searchCities = async (query) => {
  const payload = await requestOpenWeather('geo/1.0', 'direct', {
    q: query,
    limit: 5,
  });

  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.map((item) => ({
    city: item?.name || '',
    state: item?.state || '',
    country: item?.country || '',
    lat: item?.lat ?? null,
    lon: item?.lon ?? null,
  }));
};

module.exports = {
  getWeatherByCoordinates,
  getAirQualityByCoordinates,
  searchCities,
};
