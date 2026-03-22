import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import logo from './images/logo.png';
import Auth from '../../utils/auth';
import {
  getProfileIdentity,
  readProfilePreferences,
} from '../../utils/profileStorage';
import { applyTheme, getStoredTheme, persistTheme } from '../../utils/theme';

const drawerListClasses =
  'm-0 list-none items-center justify-end gap-3 p-0 md:flex md:flex-row md:flex-wrap md:gap-x-[22px] md:gap-y-3';
const mobileDrawerClasses =
  'fixed right-0 top-[70px] z-[10000] flex h-[calc(100vh-70px)] w-[85%] max-w-[300px] flex-col items-stretch overflow-y-auto border-l border-gray-200 bg-white/90 px-6 py-8 text-gray-800 shadow-[-8px_0_24px_rgba(31,64,55,0.24)] backdrop-blur-md transition-transform duration-300 ease-in-out dark:border-gray-700 dark:bg-gray-900/90 dark:text-gray-200 md:static md:h-auto md:w-auto md:max-w-none md:flex-row md:border-l-0 md:bg-transparent md:p-0 md:text-inherit md:shadow-none md:transition-none';
const mobileClosedClasses = 'translate-x-full pointer-events-none md:translate-x-0 md:pointer-events-auto';
const mobileOpenClasses = 'translate-x-0';
const navItemClasses =
  'relative w-full overflow-hidden rounded-xl border-b border-white/10 px-0 py-4 text-left text-base font-semibold text-green-600 transition duration-300 after:absolute after:bottom-0 after:left-1/2 after:h-[3px] after:w-0 after:-translate-x-1/2 after:bg-[var(--primary-green)] after:transition-all after:duration-300 hover:bg-[color:color-mix(in_srgb,var(--primary-green)_10%,transparent)] hover:text-green-700 hover:shadow-[0_8px_18px_rgba(46,204,113,0.12)] hover:after:w-full dark:text-green-400 dark:hover:text-green-300 md:w-auto md:border-b-0 md:px-4 md:py-2.5 md:hover:-translate-y-0.5';
const activeNavItemClasses =
  'bg-green-100 text-green-700 shadow-[0_8px_18px_rgba(46,204,113,0.12)] after:w-full dark:bg-green-900 dark:text-green-300 md:-translate-y-0.5';
const moreItemClasses =
  'flex min-h-[42px] w-full items-center rounded-xl border-none px-3 py-2.5 text-left text-green-600 transition duration-200 hover:translate-x-1 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900';

const Navbar = () => {
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const [isMenuClicked, setIsMenuClicked] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  const authProfile = Auth.loggedIn() ? Auth.getProfile() : {};
  const identity = getProfileIdentity(authProfile);
  const storedProfile = Auth.loggedIn()
    ? readProfilePreferences(identity.id)
    : {};
  const username =
    storedProfile?.name || identity.name || 'User';

  useEffect(() => {
    const nextTheme = getStoredTheme();
    applyTheme(nextTheme);
    setTheme(nextTheme);
  }, []);

  useEffect(() => {
    if (isNavExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isNavExpanded]);

  const handleThemeToggle = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    persistTheme(nextTheme);
    setTheme(nextTheme);
  };

  const closeMoreMenu = () => {
    setIsMoreOpen(false);
  };

  const renderNavItem = (to, label, end = false) => (
    <NavLink key={to} to={to} end={end} className="w-full md:w-auto">
      {({ isActive }) => (
        <li
          className={`${navItemClasses} ${
            isActive ? activeNavItemClasses : 'text-green-600 dark:text-green-400'
          }`}
        >
          {label}
        </li>
      )}
    </NavLink>
  );

  function showNavigation() {
    if (Auth.loggedIn()) {
      return (
        <div className="order-2 ml-auto md:ml-0">
          <div className={isMenuClicked ? 'menu-icon-close' : 'menu-icon-open'}>
            <ul
              className={`${drawerListClasses} ${
                mobileDrawerClasses
              } ${
                isNavExpanded ? mobileOpenClasses : mobileClosedClasses
              }`}
            >
              <li className="mb-1 w-full rounded-full bg-gray-100 px-4 py-2.5 text-center text-[0.92rem] font-bold text-gray-800 dark:bg-gray-800 dark:text-gray-200 md:mb-0 md:w-auto md:text-left">
                Welcome, {username}
              </li>
              {renderNavItem('/', 'Home', true)}
              {renderNavItem('/calculator', 'Footprint Calculator')}
              {renderNavItem('/myfootprint', 'My Footprint')}
              {renderNavItem('/learn', 'Learn')}
              {renderNavItem('/news', 'News')}
              {renderNavItem('/weather', 'Weather')}
            </ul>
          </div>
        </div>
      );
    }

    return (
      <div className="order-2 ml-auto md:ml-0">
        <div className={isMenuClicked ? 'menu-icon-close' : 'menu-icon-open'}>
          <ul
            className={`${drawerListClasses} ${
              mobileDrawerClasses
            } ${
              isNavExpanded ? mobileOpenClasses : mobileClosedClasses
            }`}
          >
            {renderNavItem('/', 'Home', true)}
            {renderNavItem('/donation', 'Donate')}
            {renderNavItem('/leaderboard', 'Leaderboard')}
            {renderNavItem('/carbon-trading', 'Carbon Trading')}
            {renderNavItem('/learn', 'Learn')}
            {renderNavItem('/news', 'News')}
            {renderNavItem('/weather', 'Weather')}
            {renderNavItem('/login', 'Log In/Sign Up')}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <nav className="fixed left-0 right-0 top-0 z-[9999] flex min-h-[70px] w-full items-center justify-between gap-[18px] border-b border-[var(--nav-border)] bg-[linear-gradient(0deg,color-mix(in_srgb,var(--nav-color)_90%,transparent),color-mix(in_srgb,var(--nav-color)_90%,transparent)),var(--nav-surface)] px-[15px] py-[10px] shadow-[0_6px_20px_var(--nav-shadow)] backdrop-blur-[10px] transition-[background,box-shadow] duration-200 sm:px-5 lg:px-[30px]">
      <Link to="/" className="order-1 inline-flex items-center justify-center">
        <img
          src={logo}
          alt="logo of foot outline with the earth inside of it"
          className="mt-1 h-[45px] w-auto transition duration-300 hover:scale-105 sm:h-[65px]"
        />
      </Link>
      <div className="order-3 flex items-center gap-3">
        <button
          type="button"
          className="hidden h-12 w-12 flex-col items-center justify-center gap-[5px] rounded-xl border border-gray-200 bg-gray-100 text-gray-800 transition duration-300 hover:-translate-y-px hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 md:inline-flex"
          onClick={() => {
            setIsMoreOpen((current) => !current);
            setIsNavExpanded(false);
            setIsMenuClicked(false);
          }}
          aria-label="Toggle secondary navigation menu"
        >
          <span className={`h-0.5 w-5 rounded-full bg-current transition duration-300 ${isMoreOpen ? 'translate-y-[7px] rotate-45' : ''}`}></span>
          <span className={`h-0.5 w-5 rounded-full bg-current transition duration-300 ${isMoreOpen ? 'opacity-0' : ''}`}></span>
          <span className={`h-0.5 w-5 rounded-full bg-current transition duration-300 ${isMoreOpen ? '-translate-y-[7px] -rotate-45' : ''}`}></span>
        </button>
        <button
          className="relative z-[2000] inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-gray-200 bg-gray-100 text-gray-800 transition duration-300 hover:-translate-y-px hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 md:hidden"
          onClick={() => {
            setIsNavExpanded(!isNavExpanded);
            setIsMenuClicked(!isMenuClicked);
            closeMoreMenu();
          }}
          aria-label="Toggle navigation menu"
        >
          <span className={`absolute h-0.5 w-[22px] rounded-full bg-current transition duration-300 ${isNavExpanded ? 'rotate-45' : '-translate-y-[7px]'}`}></span>
          <span className={`absolute h-0.5 w-[22px] rounded-full bg-current transition duration-300 ${isNavExpanded ? 'opacity-0' : ''}`}></span>
          <span className={`absolute h-0.5 w-[22px] rounded-full bg-current transition duration-300 ${isNavExpanded ? '-rotate-45' : 'translate-y-[7px]'}`}></span>
        </button>
        <button
          type="button"
          className="inline-flex h-10 min-h-10 w-10 min-w-10 items-center justify-center rounded-full border border-[var(--nav-button-border)] bg-[var(--nav-button-bg)] p-0 text-xl leading-none text-[var(--nav-text)] transition duration-200 hover:-translate-y-px hover:bg-[var(--nav-button-bg-hover)] sm:h-12 sm:min-h-[42px] sm:w-12 sm:min-w-[52px]"
          id="themeToggle"
          onClick={handleThemeToggle}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? '\u2600\uFE0F' : '\u{1F319}'}
        </button>
      </div>
      {isNavExpanded ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => {
            setIsNavExpanded(false);
            setIsMenuClicked(false);
          }}
          aria-label="Close navigation menu"
        ></button>
      ) : null}
      {Auth.loggedIn() && isMoreOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-[10000] border-none bg-slate-950/50 backdrop-blur-[2px]"
          onClick={closeMoreMenu}
          aria-label="Close secondary navigation menu"
        ></button>
      ) : null}
      {Auth.loggedIn() ? (
        <div className="pointer-events-none fixed inset-0 z-[10001] hidden md:block">
          <div className={`pointer-events-auto absolute right-0 top-0 flex h-screen w-[min(360px,88vw)] flex-col gap-1.5 overflow-y-auto border-l border-gray-200 bg-white/90 px-4 pb-6 pt-5 text-gray-800 shadow-[-16px_0_34px_rgba(0,0,0,0.22)] backdrop-blur-md transition duration-300 dark:border-gray-700 dark:bg-gray-900/90 dark:text-gray-200 ${isMoreOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="mb-2 flex items-center justify-between gap-3 px-1.5 pb-3 pt-2">
              <span className="text-[1.05rem] font-extrabold tracking-[0.03em] text-gray-800 dark:text-gray-200">Menu</span>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-base text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                onClick={closeMoreMenu}
                aria-label="Close menu"
              >
                &#10005;
              </button>
            </div>
            <NavLink to="/dashboard" className={moreItemClasses} onClick={closeMoreMenu}>
              Dashboard
            </NavLink>
            <NavLink to="/leaderboard" className={moreItemClasses} onClick={closeMoreMenu}>
              Leaderboard
            </NavLink>
            <NavLink to="/carbon-trading" className={moreItemClasses} onClick={closeMoreMenu}>
              Carbon Trading
            </NavLink>
            <NavLink to="/mypledges" className={moreItemClasses} onClick={closeMoreMenu}>
              My Pledges
            </NavLink>
            <NavLink to="/profile" className={moreItemClasses} onClick={closeMoreMenu}>
              Profile
            </NavLink>
            <NavLink to="/donation" className={moreItemClasses} onClick={closeMoreMenu}>
              Donate
            </NavLink>
            <button
              type="button"
              className={`${moreItemClasses} justify-start`}
              onClick={() => {
                closeMoreMenu();
                Auth.logout();
              }}
            >
              Logout
            </button>
          </div>
        </div>
      ) : null}
      {showNavigation()}
    </nav>
  );
};

export default Navbar;
