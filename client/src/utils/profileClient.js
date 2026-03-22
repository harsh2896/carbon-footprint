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

const getAuthHeaders = () => {
  const token = localStorage.getItem('id_token');

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

export const fetchUserProfile = async () => {
  const response = await fetch('/api/user/profile', {
    method: 'GET',
    headers: {
      ...getAuthHeaders(),
    },
  });

  return parseJsonResponse(response, 'Unable to load profile right now.');
};

export const updateUserProfile = async (profile) => {
  const response = await fetch('/api/user/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(profile),
  });

  return parseJsonResponse(response, 'Unable to update profile right now.');
};
