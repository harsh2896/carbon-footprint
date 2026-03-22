import { getDefaultLocation } from '../data/indianLocations';

export const PROFILE_STORAGE_KEY = 'carbon-profile-preferences-v2';

export const DEFAULT_AVATAR =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240"><rect width="240" height="240" rx="120" fill="%230f1720"/><circle cx="120" cy="90" r="42" fill="%2334d399"/><path d="M48 206c15-40 42-60 72-60s57 20 72 60" fill="%2306b6d4"/></svg>';

const getStorage = () =>
  typeof window === 'undefined' ? null : window.localStorage;

export const getProfileIdentity = (authProfile = {}, fallback = {}) => ({
  id:
    authProfile?.data?._id ||
    authProfile?._id ||
    fallback?._id ||
    fallback?.email ||
    'guest',
  name:
    authProfile?.data?.username ||
    authProfile?.username ||
    fallback?.username ||
    fallback?.name ||
    'Eco Explorer',
  email: authProfile?.data?.email || authProfile?.email || fallback?.email || '',
});

export const readStoredProfiles = () => {
  const storage = getStorage();

  if (!storage) {
    return {};
  }

  try {
    const raw = storage.getItem(PROFILE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.warn('Unable to parse stored profiles.', error);
    return {};
  }
};

export const readProfilePreferences = (profileId) => {
  const profiles = readStoredProfiles();
  const savedProfile = profiles[profileId] || {};
  const defaultLocation = getDefaultLocation();

  return {
    name: savedProfile.name || '',
    age: Number(savedProfile.age || 0),
    bio: savedProfile.bio || '',
    profileImage: savedProfile.profileImage || '',
    state: savedProfile.state || defaultLocation.state,
    city: savedProfile.city || defaultLocation.city,
    carbonEmission: Number(savedProfile.carbonEmission || 0),
    credits: Number(savedProfile.credits || 0),
  };
};

export const saveProfilePreferences = (profileId, value) => {
  const storage = getStorage();

  if (!storage) {
    return value;
  }

  const profiles = readStoredProfiles();
  const nextProfiles = {
    ...profiles,
    [profileId]: {
      ...profiles[profileId],
      ...value,
    },
  };

  storage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(nextProfiles));

  return nextProfiles[profileId];
};
