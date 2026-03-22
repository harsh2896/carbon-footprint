import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { QUERY_ME } from '../utils/queries';
import Auth from '../utils/auth';
import {
  DEFAULT_AVATAR,
  getProfileIdentity,
  readProfilePreferences,
} from '../utils/profileStorage';

const Dashboard = () => {
  const { data } = useQuery(QUERY_ME, {
    skip: !Auth.loggedIn(),
  });
  const [profilePrefs, setProfilePrefs] = useState({
    name: '',
    bio: '',
    profileImage: '',
    state: '',
    city: '',
    carbonEmission: 0,
    credits: 0,
  });

  useEffect(() => {
    const authProfile = Auth.getProfile();
    const identity = getProfileIdentity(authProfile, data?.me || {});
    setProfilePrefs(readProfilePreferences(identity.id));
  }, [data]);

  const dashboardUser = useMemo(() => {
    const authProfile = Auth.getProfile();
    const identity = getProfileIdentity(authProfile, data?.me || {});
    const latestEmission =
      data?.me?.carbonFootprint ||
      profilePrefs.carbonEmission ||
      0;

    return {
      name: profilePrefs.name || identity.name,
      email: identity.email,
      bio:
        profilePrefs.bio ||
        'Track your footprint, maintain greener habits, and keep your climate progress visible.',
      state: profilePrefs.state || 'Uttar Pradesh',
      city: profilePrefs.city || 'Varanasi',
      carbonEmission: Number(latestEmission || 0),
      credits: Number(profilePrefs.credits || 0),
      profileImage: profilePrefs.profileImage || DEFAULT_AVATAR,
    };
  }, [data, profilePrefs]);

  return (
    <main className="min-h-[calc(100vh-70px)] bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.18),transparent_24%),radial-gradient(circle_at_top_right,rgba(8,145,178,0.16),transparent_28%),var(--bg-accent)] px-[18px] pb-[60px] pt-[34px] text-[var(--text-color)] max-sm:px-[14px] max-sm:pb-12 max-sm:pt-6">
      <section className="mx-auto grid max-w-[1180px] gap-[22px]">
        <div className="grid gap-[22px] rounded-[28px] border border-[var(--border-color)] bg-[var(--card-color)] p-5 shadow-[0_22px_50px_var(--shadow-color)] backdrop-blur-[18px] sm:p-[30px]">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <img
              src={dashboardUser.profileImage}
              alt={dashboardUser.name}
              className="h-[108px] w-[108px] rounded-full border-[3px] border-white/20 object-cover"
            />
            <div>
              <span className="inline-block text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[#99f6e4]">
                Personal Dashboard
              </span>
              <h1 className="my-[10px] mb-3 text-3xl font-bold text-[var(--text-color)]">
                Welcome, {dashboardUser.name}
              </h1>
              <p className="m-0 leading-[1.7] text-[var(--text-muted)]">{dashboardUser.bio}</p>
              <div className="mt-[14px] flex flex-wrap gap-3">
                <span className="max-w-full break-words rounded-full bg-[var(--pill-bg)] px-3 py-2 text-[0.9rem] text-[#d9f99d]">
                  {dashboardUser.email || 'Email available after login'}
                </span>
                <span className="max-w-full break-words rounded-full bg-[var(--pill-bg)] px-3 py-2 text-[0.9rem] text-[#d9f99d]">
                  {dashboardUser.state}, {dashboardUser.city}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-[14px]">
            <Link to="/profile" className="inline-flex min-h-[46px] items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#34d399,#06b6d4)] px-[18px] py-3 font-bold text-[#04111b] no-underline">
              Edit Profile
            </Link>
            <Link to="/calculator" className="inline-flex min-h-[46px] items-center justify-center rounded-2xl border border-[var(--border-color)] bg-[var(--pill-bg)] px-[18px] py-3 font-bold text-[var(--text-color)] no-underline">
              Update Footprint
            </Link>
          </div>
        </div>

        <section className="grid grid-cols-1 gap-[18px] md:grid-cols-3">
          <article className="rounded-[28px] border border-[var(--border-color)] bg-[var(--card-color)] p-6 shadow-[0_22px_50px_var(--shadow-color)] backdrop-blur-[18px] max-sm:rounded-[22px] max-sm:p-5">
            <span className="block text-[0.82rem] font-bold uppercase tracking-[0.08em] text-[#99f6e4]">Carbon Emission</span>
            <strong className="my-[14px] mb-[10px] block break-words text-[1.8rem] text-[var(--text-color)]">
              {dashboardUser.carbonEmission} kg CO2
            </strong>
            <p className="m-0 leading-[1.7] text-[var(--text-muted)]">Your latest saved footprint summary.</p>
          </article>

          <article className="rounded-[28px] border border-[var(--border-color)] bg-[var(--card-color)] p-6 shadow-[0_22px_50px_var(--shadow-color)] backdrop-blur-[18px] max-sm:rounded-[22px] max-sm:p-5">
            <span className="block text-[0.82rem] font-bold uppercase tracking-[0.08em] text-[#99f6e4]">App Credits</span>
            <strong className="my-[14px] mb-[10px] block break-words text-[1.8rem] text-[var(--text-color)]">
              {dashboardUser.credits}
            </strong>
            <p className="m-0 leading-[1.7] text-[var(--text-muted)]">Credits available in your local profile snapshot.</p>
          </article>

          <article className="rounded-[28px] border border-[var(--border-color)] bg-[var(--card-color)] p-6 shadow-[0_22px_50px_var(--shadow-color)] backdrop-blur-[18px] max-sm:rounded-[22px] max-sm:p-5">
            <span className="block text-[0.82rem] font-bold uppercase tracking-[0.08em] text-[#99f6e4]">Selected Location</span>
            <strong className="my-[14px] mb-[10px] block break-words text-[1.8rem] text-[var(--text-color)]">
              {dashboardUser.city}
            </strong>
            <p className="m-0 leading-[1.7] text-[var(--text-muted)]">{dashboardUser.state}</p>
          </article>
        </section>

        <section className="rounded-[28px] border border-[var(--border-color)] bg-[var(--card-color)] p-6 shadow-[0_22px_50px_var(--shadow-color)] backdrop-blur-[18px] max-sm:rounded-[22px] max-sm:p-5">
          <div>
            <div>
              <span className="inline-block text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[#99f6e4]">
                Quick Access
              </span>
              <h2 className="my-[10px] mb-3 text-2xl font-bold text-[var(--text-color)]">Protected account tools</h2>
            </div>
          </div>

          <div className="flex flex-wrap gap-[14px]">
            <Link to="/profile" className="inline-flex min-h-[46px] items-center justify-center rounded-2xl border border-[var(--border-color)] bg-[var(--pill-bg)] px-[18px] py-3 font-bold text-[var(--text-color)] no-underline">
              Profile
            </Link>
            <Link to="/myfootprint" className="inline-flex min-h-[46px] items-center justify-center rounded-2xl border border-[var(--border-color)] bg-[var(--pill-bg)] px-[18px] py-3 font-bold text-[var(--text-color)] no-underline">
              My Footprint
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
};

export default Dashboard;
