const parseJsonResponse = async (response, fallbackMessage) => {
  let payload = {};

  try {
    payload = await response.json();
  } catch (error) {
    throw new Error(fallbackMessage);
  }

  if (!response.ok) {
    throw new Error(payload?.error || fallbackMessage);
  }

  return payload;
};

export const fetchWeatherByCoordinates = async (lat, lon, signal) => {
  const query = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
  });

  const response = await fetch(`/api/weather?${query.toString()}`, {
    method: 'GET',
    signal,
  });

  return parseJsonResponse(
    response,
    'Unable to load weather details right now.'
  );
};

export const fetchAqiByCoordinates = async (lat, lon, signal) => {
  const query = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
  });

  const response = await fetch(`/api/aqi?${query.toString()}`, {
    method: 'GET',
    signal,
  });

  return parseJsonResponse(response, 'Unable to load AQI details right now.');
};

export const searchCities = async (query, signal) => {
  const response = await fetch(
    `/api/search?${new URLSearchParams({ q: query }).toString()}`,
    {
      method: 'GET',
      signal,
    }
  );

  return parseJsonResponse(response, 'Unable to search cities right now.');
};
