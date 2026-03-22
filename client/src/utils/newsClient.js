const requestNews = async (category = 'all', signal) => {
  const query = new URLSearchParams();

  if (category && category !== 'all') {
    query.set('category', category);
  }

  const response = await fetch(`/api/news?${query.toString()}`, {
    method: 'GET',
    signal,
  });

  let payload = {};

  try {
    payload = await response.json();
  } catch (error) {
    throw new Error('Invalid news response from server.');
  }

  if (!response.ok) {
    throw new Error(
      payload?.error || 'Unable to load news. Please try again later.'
    );
  }

  return payload;
};

export const fetchNewsByCategory = (category = 'all', signal) =>
  requestNews(category, signal);
