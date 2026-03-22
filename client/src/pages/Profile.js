import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@apollo/client';
import { QUERY_ME } from '../utils/queries';
import Auth from '../utils/auth';
import {
  DEFAULT_CITY,
  DEFAULT_STATE,
  INDIAN_STATES_AND_CITIES,
  getCitiesForState,
} from '../data/indianLocations';
import {
  DEFAULT_AVATAR,
  getProfileIdentity,
  readProfilePreferences,
  saveProfilePreferences,
} from '../utils/profileStorage';
import {
  fetchUserProfile,
  updateUserProfile,
} from '../utils/profileClient';

const BIO_CHARACTER_LIMIT = 180;
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

const surfaceClasses =
  'rounded-[28px] border border-[var(--border-color)] bg-[var(--card-color)] p-7 shadow-[0_22px_50px_var(--shadow-color)] backdrop-blur-[18px] max-sm:rounded-[22px] max-sm:p-5';

const Profile = () => {
  const { data } = useQuery(QUERY_ME, {
    skip: !Auth.loggedIn(),
  });
  const [profileId, setProfileId] = useState('guest');
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    age: 0,
    bio: '',
    profileImage: '',
    state: DEFAULT_STATE,
    city: DEFAULT_CITY,
  });
  const [draft, setDraft] = useState(profileData);
  const [isEditing, setIsEditing] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const authProfile = Auth.getProfile();
    const identity = getProfileIdentity(authProfile, data?.me || {});
    const localProfile = readProfilePreferences(identity.id);

    const initialProfile = {
      name: localProfile.name || identity.name,
      email: identity.email,
      age: localProfile.age || 0,
      bio:
        localProfile.bio ||
        'Build a lower-carbon routine with a profile that keeps your goals and location visible.',
      profileImage: localProfile.profileImage || '',
      state: localProfile.state || DEFAULT_STATE,
      city: localProfile.city || DEFAULT_CITY,
    };

    setProfileId(identity.id);
    setProfileData(initialProfile);
    setDraft(initialProfile);

    const loadServerProfile = async () => {
      try {
        const payload = await fetchUserProfile();
        const remoteUser = payload.user || {};
        const mergedProfile = {
          name: remoteUser.name || initialProfile.name,
          email: remoteUser.email || initialProfile.email,
          age: Number(remoteUser.age || initialProfile.age || 0),
          bio: remoteUser.bio || initialProfile.bio,
          profileImage: remoteUser.profileImage || initialProfile.profileImage,
          state: remoteUser.state || initialProfile.state,
          city: remoteUser.city || initialProfile.city,
        };

        setProfileData(mergedProfile);
        setDraft(mergedProfile);
        saveProfilePreferences(identity.id, mergedProfile);
      } catch (error) {
        console.warn('Profile API unavailable, using local profile data.', error);
      }
    };

    if (Auth.loggedIn()) {
      loadServerProfile();
    }
  }, [data]);

  const availableCities = useMemo(
    () => getCitiesForState(draft.state || DEFAULT_STATE),
    [draft.state]
  );

  const resolvedProfile = useMemo(
    () => ({
      ...profileData,
      profileImage: profileData.profileImage || DEFAULT_AVATAR,
      state: profileData.state || DEFAULT_STATE,
      city: profileData.city || DEFAULT_CITY,
    }),
    [profileData]
  );

  const handleDraftChange = (field, value) => {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleStateChange = (event) => {
    const nextState = event.target.value;
    const nextCities = getCitiesForState(nextState);

    setDraft((current) => ({
      ...current,
      state: nextState,
      city: nextCities[0] || DEFAULT_CITY,
    }));
  };

  const handleProfileImageChange = (event) => {
    const [file] = event.target.files || [];

    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setProfileError('Please upload a valid image file.');
      event.target.value = '';
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setProfileError('Please upload an image smaller than 2 MB.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setDraft((current) => ({
        ...current,
        profileImage: typeof reader.result === 'string' ? reader.result : current.profileImage,
      }));
      setProfileError('');
    };
    reader.onerror = () => {
      setProfileError('We could not read that image. Please try another file.');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    const trimmedName = draft.name.trim();

    if (!trimmedName) {
      setProfileError('Name cannot be empty.');
      return;
    }

    const nextProfile = {
      name: trimmedName,
      email: profileData.email,
      age: Math.max(Number(draft.age) || 0, 0),
      bio: draft.bio.trim().slice(0, BIO_CHARACTER_LIMIT),
      profileImage: draft.profileImage.trim(),
      state: draft.state || DEFAULT_STATE,
      city: draft.city || DEFAULT_CITY,
    };

    setIsSaving(true);
    setProfileError('');

    try {
      saveProfilePreferences(profileId, nextProfile);

      try {
        const payload = await updateUserProfile(nextProfile);
        const remoteUser = payload.user || {};
        setProfileData({
          ...nextProfile,
          name: remoteUser.name || nextProfile.name,
          email: remoteUser.email || nextProfile.email,
          age: Number(remoteUser.age || nextProfile.age || 0),
          bio: remoteUser.bio || nextProfile.bio,
          profileImage: remoteUser.profileImage || nextProfile.profileImage,
          state: remoteUser.state || nextProfile.state,
          city: remoteUser.city || nextProfile.city,
        });
      } catch (error) {
        setProfileData(nextProfile);
      }

      setDraft(nextProfile);
      setIsEditing(false);
    } catch (error) {
      setProfileError(error.message || 'Unable to save profile right now.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-70px)] bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.16),transparent_24%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_28%),var(--bg-accent)] px-[18px] pb-[60px] pt-[34px] text-[var(--text-color)] max-sm:px-[14px] max-sm:pb-12 max-sm:pt-6">
      <section className="mx-auto grid max-w-[1080px] gap-[22px]">
        <motion.section className={`${surfaceClasses} grid grid-cols-1 items-center gap-6 xl:grid-cols-[180px_minmax(0,1fr)_auto]`} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <div className="grid justify-items-center gap-3">
            <img src={resolvedProfile.profileImage} alt={resolvedProfile.name} className="h-[132px] w-[132px] rounded-full border-[3px] border-white/15 object-cover" />
            <span className="inline-flex items-center justify-center rounded-full bg-white/5 px-3 py-2 text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[#99f6e4]">Protected Profile</span>
          </div>

          <div>
            <span className="inline-flex items-center justify-center text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[#99f6e4]">Your account</span>
            <h1 className="my-[10px] mb-3 text-3xl">{resolvedProfile.name}</h1>
            <p className="max-w-[60ch] leading-[1.7] text-[var(--text-muted)]">{resolvedProfile.bio}</p>
            <div className="mt-[18px] grid grid-cols-1 gap-[14px] md:grid-cols-3">
              <div className="min-w-0 overflow-hidden rounded-[18px] bg-[color:color-mix(in_srgb,var(--card-solid)_88%,transparent)] p-[14px]">
                <span className="block text-[0.8rem] uppercase tracking-[0.08em] text-[#99f6e4]">Email</span>
                <strong className="mt-2 block max-w-full break-all">{resolvedProfile.email || 'No email found'}</strong>
              </div>
              <div className="min-w-0 overflow-hidden rounded-[18px] bg-[color:color-mix(in_srgb,var(--card-solid)_88%,transparent)] p-[14px]">
                <span className="block text-[0.8rem] uppercase tracking-[0.08em] text-[#99f6e4]">Age</span>
                <strong className="mt-2 block max-w-full break-all">{resolvedProfile.age || '--'}</strong>
              </div>
              <div className="min-w-0 overflow-hidden rounded-[18px] bg-[color:color-mix(in_srgb,var(--card-solid)_88%,transparent)] p-[14px]">
                <span className="block text-[0.8rem] uppercase tracking-[0.08em] text-[#99f6e4]">Location</span>
                <strong className="mt-2 block max-w-full break-all">{resolvedProfile.state}, {resolvedProfile.city}</strong>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="button" className="inline-flex min-h-[46px] items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#34d399,#38bdf8)] px-[18px] py-3 font-bold text-[#04111b]" onClick={() => setIsEditing((current) => !current)}>
              {isEditing ? 'Close Editor' : 'Edit Profile'}
            </button>
          </div>
        </motion.section>

        {isEditing ? (
          <motion.section className={surfaceClasses} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
            <div className="mb-[18px] flex justify-between gap-4">
              <div>
                <span className="inline-flex items-center justify-center text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[#99f6e4]">Edit details</span>
                <h2 className="my-[10px] mb-3 text-2xl">Update your profile</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-[22px] lg:grid-cols-[220px_minmax(0,1fr)]">
              <div className="grid justify-items-center gap-3 rounded-[22px] bg-[color:color-mix(in_srgb,var(--card-solid)_88%,transparent)] p-[18px]">
                <img src={draft.profileImage || DEFAULT_AVATAR} alt="Profile preview" className="h-32 w-32 rounded-full border-[3px] border-white/15 object-cover" />
                <label className="inline-flex min-h-[46px] w-full cursor-pointer items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#34d399,#38bdf8)] px-[18px] py-3 font-bold text-[#04111b]">
                  <input type="file" accept="image/*" className="hidden" onChange={handleProfileImageChange} />
                  Upload Photo
                </label>
                <button type="button" className="inline-flex min-h-[46px] items-center justify-center rounded-2xl border border-[var(--border-color)] bg-[var(--pill-bg)] px-[18px] py-3 font-bold text-[var(--text-color)]" onClick={() => handleDraftChange('profileImage', '')}>
                  Use Default Avatar
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="grid gap-2 font-semibold text-[var(--text-color)]">
                  <span>Name</span>
                  <input type="text" className="w-full rounded-[14px] border border-[var(--input-border)] bg-[var(--input-bg)] px-[14px] py-[13px] text-[var(--input-text)]" value={draft.name} onChange={(event) => handleDraftChange('name', event.target.value)} />
                </label>

                <label className="grid gap-2 font-semibold text-[var(--text-color)]">
                  <span>Email</span>
                  <input type="text" className="w-full cursor-not-allowed rounded-[14px] border border-[var(--input-border)] bg-[var(--input-bg)] px-[14px] py-[13px] text-[var(--input-text)] opacity-70" value={resolvedProfile.email} disabled />
                </label>

                <label className="grid gap-2 font-semibold text-[var(--text-color)]">
                  <span>Age</span>
                  <input type="number" min="0" className="w-full rounded-[14px] border border-[var(--input-border)] bg-[var(--input-bg)] px-[14px] py-[13px] text-[var(--input-text)]" value={draft.age} onChange={(event) => handleDraftChange('age', event.target.value)} />
                </label>

                <label className="grid gap-2 font-semibold text-[var(--text-color)]">
                  <span>State</span>
                  <select className="w-full rounded-[14px] border border-[var(--input-border)] bg-[var(--input-bg)] px-[14px] py-[13px] text-[var(--input-text)]" value={draft.state} onChange={handleStateChange}>
                    {Object.keys(INDIAN_STATES_AND_CITIES).map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2 font-semibold text-[var(--text-color)]">
                  <span>City</span>
                  <select className="w-full rounded-[14px] border border-[var(--input-border)] bg-[var(--input-bg)] px-[14px] py-[13px] text-[var(--input-text)]" value={draft.city} onChange={(event) => handleDraftChange('city', event.target.value)}>
                    {availableCities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2 font-semibold text-[var(--text-color)] md:col-span-2">
                  <span>Bio</span>
                  <textarea rows="5" className="min-h-[130px] w-full resize-y rounded-[14px] border border-[var(--input-border)] bg-[var(--input-bg)] px-[14px] py-[13px] text-[var(--input-text)]" value={draft.bio} onChange={(event) => handleDraftChange('bio', event.target.value.slice(0, BIO_CHARACTER_LIMIT))} />
                  <span className="justify-self-end text-[0.82rem] text-[var(--text-soft)]">{draft.bio.length}/{BIO_CHARACTER_LIMIT}</span>
                </label>
              </div>
            </div>

            {profileError ? (
              <p className="mt-4 rounded-[14px] border border-[rgba(248,113,113,0.2)] bg-[rgba(220,38,38,0.12)] px-[14px] py-3 text-[#fecaca]">
                {profileError}
              </p>
            ) : null}

            <div className="mt-[18px] flex flex-wrap gap-3">
              <button type="button" className="inline-flex min-h-[46px] items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#34d399,#38bdf8)] px-[18px] py-3 font-bold text-[#04111b] disabled:cursor-wait disabled:opacity-70" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button type="button" className="inline-flex min-h-[46px] items-center justify-center rounded-2xl border border-[var(--border-color)] bg-[var(--pill-bg)] px-[18px] py-3 font-bold text-[var(--text-color)]" onClick={() => { setDraft(profileData); setProfileError(''); setIsEditing(false); }}>
                Cancel
              </button>
            </div>
          </motion.section>
        ) : null}
      </section>
    </main>
  );
};

export default Profile;
