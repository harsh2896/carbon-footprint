export const THEME_STORAGE_KEY = 'theme';

export const getStoredTheme = () => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return window.localStorage.getItem(THEME_STORAGE_KEY) === 'dark'
    ? 'dark'
    : 'light';
};

export const applyTheme = (theme) => {
  if (typeof document === 'undefined') {
    return;
  }

  const nextTheme = theme === 'dark' ? 'dark' : 'light';
  const isDark = nextTheme === 'dark';

  document.documentElement.classList.toggle('dark-theme', isDark);
  document.body.classList.toggle('dark-theme', isDark);
  document.body.setAttribute('data-theme', nextTheme);
  document.documentElement.setAttribute('data-theme', nextTheme);
  document.documentElement.style.colorScheme = nextTheme;
};

export const persistTheme = (theme) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
};

export const initializeTheme = () => {
  const theme = getStoredTheme();
  applyTheme(theme);
  return theme;
};
