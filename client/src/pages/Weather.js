import React, { useEffect, useMemo, useState } from 'react';
import {
  fetchAqiByCoordinates,
  fetchWeatherByCoordinates,
  searchCities,
} from '../utils/weatherClient';

const RECENT_SEARCHES_KEY = 'weather-recent-searches-v1';

const AQI_META = {
  1: { label: 'Good', emoji: '\u{1F60A}', cardClass: 'border-[rgba(96,255,133,0.22)] bg-[linear-gradient(145deg,rgba(20,71,41,0.75),rgba(18,31,20,0.58))]' },
  2: { label: 'Fair', emoji: '\u{1F642}', cardClass: 'border-[rgba(181,255,112,0.24)] bg-[linear-gradient(145deg,rgba(73,108,27,0.72),rgba(20,31,17,0.56))]' },
  3: { label: 'Moderate', emoji: '\u{1F610}', cardClass: 'border-[rgba(255,214,92,0.24)] bg-[linear-gradient(145deg,rgba(112,89,22,0.72),rgba(32,25,12,0.56))]' },
  4: { label: 'Poor', emoji: '\u{1F637}', cardClass: 'border-[rgba(255,166,82,0.24)] bg-[linear-gradient(145deg,rgba(133,69,23,0.72),rgba(36,19,12,0.56))]' },
  5: { label: 'Very Poor', emoji: '\u2620\uFE0F', cardClass: 'border-[rgba(255,81,81,0.24)] bg-[linear-gradient(145deg,rgba(127,24,24,0.74),rgba(31,13,13,0.56))]' },
};

const readRecentSearches = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(RECENT_SEARCHES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Unable to parse recent weather searches.', error);
    return [];
  }
};

const saveRecentSearches = (items) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(items));
};

const Weather = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [aqiData, setAqiData] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [weatherError, setWeatherError] = useState('');
  const [locationNotice, setLocationNotice] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(true);
  const [isSelectionLocked, setIsSelectionLocked] = useState(false);

  useEffect(() => {
    setRecentSearches(readRecentSearches());
  }, []);

  useEffect(() => {
    const trimmedQuery = searchTerm.trim();
    if (isSelectionLocked) {
      setSuggestions([]);
      setSearchError('');
      setIsSearching(false);
      return undefined;
    }
    if (trimmedQuery.length < 2) {
      setSuggestions([]);
      setSearchError('');
      setIsSearching(false);
      return undefined;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsSearching(true);
      setSearchError('');
      try {
        const payload = await searchCities(trimmedQuery, controller.signal);
        setSuggestions(payload.results || []);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setSearchError(error.message || 'Unable to fetch city suggestions right now.');
          setSuggestions([]);
        }
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [isSelectionLocked, searchTerm]);

  const persistRecentLocation = (location) => {
    const normalized = { city: location.city, state: location.state || '', country: location.country || '', lat: Number(location.lat), lon: Number(location.lon) };
    const deduped = [normalized, ...recentSearches.filter((item) => !(item.city === normalized.city && item.state === normalized.state && item.country === normalized.country))].slice(0, 5);
    setRecentSearches(deduped);
    saveRecentSearches(deduped);
  };

  const loadWeatherBundle = async (location, notice = '') => {
    setIsLoadingWeather(true);
    setWeatherError('');
    setLocationNotice(notice);
    try {
      const [weather, aqi] = await Promise.all([
        fetchWeatherByCoordinates(location.lat, location.lon),
        fetchAqiByCoordinates(location.lat, location.lon),
      ]);

      const resolvedLocation = { city: weather.city || location.city, state: location.state || '', country: location.country || '', lat: location.lat, lon: location.lon };
      setSelectedLocation(resolvedLocation);
      setWeatherData(weather);
      setAqiData(aqi);
      persistRecentLocation(resolvedLocation);
      setSuggestions([]);
      setSearchError('');
      setIsSearchOpen(false);
      setIsSelectionLocked(true);
      setSearchTerm([resolvedLocation.city, resolvedLocation.state, resolvedLocation.country].filter(Boolean).join(', '));
    } catch (error) {
      setWeatherError(error.message || 'Unable to load weather and AQI details right now.');
    } finally {
      setIsLoadingWeather(false);
    }
  };

  const handleSearchInputChange = (event) => {
    setSearchTerm(event.target.value);
    setIsSearchOpen(true);
    setIsSelectionLocked(false);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setWeatherError('Geolocation is not supported in this browser.');
      return;
    }
    setIsLoadingWeather(true);
    setWeatherError('');
    setLocationNotice('');
    setIsSearchOpen(false);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        loadWeatherBundle({ city: 'Current location', state: '', country: '', lat: position.coords.latitude, lon: position.coords.longitude }, 'Using your live browser location.');
      },
      () => {
        setIsLoadingWeather(false);
        setWeatherError('Unable to access your location. Please search manually.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const aqiMeta = useMemo(() => AQI_META[aqiData?.aqi] || AQI_META[3], [aqiData?.aqi]);

  const helperSuggestions = useMemo(() => {
    const items = ["Today's weather may impact your carbon footprint."];
    if ((aqiData?.aqi ?? 0) >= 4) items.push('Avoid outdoor activities');
    if ((weatherData?.temperature ?? 0) > 30) items.push('Reduce AC usage to lower carbon footprint');
    return items;
  }, [aqiData?.aqi, weatherData?.temperature]);

  const showRecentSearches = isSearchOpen && !isSelectionLocked && searchTerm.trim().length < 2 && recentSearches.length > 0;
  const showSuggestions = isSearchOpen && !isSelectionLocked && searchTerm.trim().length >= 2;
  const weatherIconUrl = weatherData?.icon ? `https://openweathermap.org/img/wn/${weatherData.icon}@2x.png` : '';

  return (
    <main className="min-h-[calc(100vh-70px)] bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.16),transparent_26%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_28%),var(--bg-accent)] px-[18px] pb-[70px] pt-[42px] text-[var(--text-color)] max-sm:px-[14px] max-sm:pb-[52px] max-sm:pt-7">
      <section className="mx-auto max-w-[1120px]">
        <div className="relative overflow-visible rounded-[32px] border border-[var(--border-color)] bg-[var(--card-color)] p-9 shadow-[0_24px_60px_var(--shadow-color)] backdrop-blur-[20px] max-sm:rounded-3xl max-sm:px-4 max-sm:py-[22px]">
          <div className="pointer-events-none absolute -left-[50px] -top-[70px] h-[220px] w-[220px] rounded-full bg-[rgba(52,211,153,0.22)] opacity-40 blur-[18px]"></div>
          <div className="pointer-events-none absolute -bottom-20 -right-[70px] h-[220px] w-[220px] rounded-full bg-[rgba(56,189,248,0.2)] opacity-40 blur-[18px]"></div>

          <header className="relative z-[1] mb-7 text-center">
            <span className="inline-flex items-center justify-center rounded-full border border-[rgba(52,211,153,0.2)] bg-[rgba(52,211,153,0.14)] px-[14px] py-2 text-[0.82rem] uppercase tracking-[0.08em] text-[#c8fff2]">Weather + AQI</span>
            <h1 className="my-[18px] text-[clamp(2rem,4vw,3.3rem)] leading-[1.08]">Search any city and view live weather insights</h1>
            <p className="mx-auto max-w-[700px] leading-[1.75] text-[var(--text-muted)]">Search by city or state, pick a result, and see real-time weather, AQI, humidity, and air-quality details without exposing your API key.</p>
          </header>

          <section className="relative z-[1] mb-[22px] rounded-[26px] border border-[var(--border-color)] bg-[color:color-mix(in_srgb,var(--card-color)_88%,transparent)] p-[22px] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] max-sm:p-[18px]">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-[14px] max-[760px]:grid-cols-1">
              <div className="relative">
                <input type="text" value={searchTerm} onChange={handleSearchInputChange} placeholder="Search city or state..." className="min-h-[54px] w-full rounded-[18px] border border-[var(--input-border)] bg-[var(--input-bg)] px-[18px] text-[var(--input-text)] outline-none" />
                {(showSuggestions || showRecentSearches) ? (
                  <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-[5] rounded-[20px] border border-[var(--border-color)] bg-[color:color-mix(in_srgb,var(--card-solid)_92%,transparent)] p-2.5 shadow-[0_20px_40px_rgba(0,0,0,0.35)] backdrop-blur-[18px]">
                    {isSearching ? <div className="px-3 py-2.5 text-[var(--text-muted)]">Searching cities...</div> : null}
                    {!isSearching && searchError ? <div className="px-3 py-2.5 text-[#fecaca]">{searchError}</div> : null}
                    {!isSearching && showSuggestions && !searchError && !suggestions.length ? <div className="px-3 py-2.5 text-[var(--text-muted)]">No matching cities found.</div> : null}
                    {!isSearching && showSuggestions && suggestions.length ? suggestions.map((item) => (
                      <button type="button" key={`${item.city}-${item.state}-${item.country}-${item.lat}`} className="grid w-full gap-1 rounded-[14px] bg-transparent px-[14px] py-[13px] text-left text-[var(--text-color)] transition duration-200 hover:translate-x-1 hover:bg-white/5" onClick={() => loadWeatherBundle(item)}>
                        <strong className="text-base">{item.city}</strong>
                        <span className="text-[0.92rem] text-[var(--text-muted)]">{[item.state, item.country].filter(Boolean).join(', ')}</span>
                      </button>
                    )) : null}
                    {!isSearching && showRecentSearches ? (
                      <>
                        <div className="px-3 py-2.5 text-[0.78rem] uppercase tracking-[0.08em] text-[#99f6e4]">Recent searches</div>
                        {recentSearches.map((item) => (
                          <button type="button" key={`${item.city}-${item.state}-${item.country}-${item.lat}`} className="grid w-full gap-1 rounded-[14px] bg-transparent px-[14px] py-[13px] text-left text-[var(--text-color)] transition duration-200 hover:translate-x-1 hover:bg-white/5" onClick={() => loadWeatherBundle(item)}>
                            <strong className="text-base text-[#a7f3d0]">{item.city}</strong>
                            <span className="text-[0.92rem] text-[var(--text-muted)]">{[item.state, item.country].filter(Boolean).join(', ')}</span>
                          </button>
                        ))}
                      </>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-[14px]">
                <button type="button" className="min-h-[54px] rounded-[18px] bg-[linear-gradient(135deg,#34d399,#38bdf8)] px-5 font-bold text-[#04111b]" onClick={handleUseMyLocation}>Use My Location</button>
                {!isSearchOpen && selectedLocation ? (
                  <button
                    type="button"
                    className="min-h-[54px] rounded-[18px] border border-[var(--border-color)] bg-[var(--pill-bg)] px-5 font-bold text-[var(--text-color)]"
                    onClick={() => {
                      setIsSearchOpen(true);
                      setIsSelectionLocked(false);
                      setSuggestions([]);
                      setSearchError('');
                      setSearchTerm('');
                    }}
                  >
                    Change City
                  </button>
                ) : null}
              </div>
            </div>
            {locationNotice ? <div className="mt-[14px] rounded-2xl bg-[rgba(52,211,153,0.1)] px-[14px] py-3 text-[#baf7e8]">{locationNotice}</div> : null}
          </section>

          {isLoadingWeather ? (
            <div className="relative z-[1] grid min-h-[260px] place-items-center rounded-[26px] border border-[var(--border-color)] bg-[color:color-mix(in_srgb,var(--card-color)_88%,transparent)] p-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div>
                <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-white/10 border-t-[#34d399]"></div>
                <p>Loading live weather and AQI data...</p>
              </div>
            </div>
          ) : null}

          {!isLoadingWeather && weatherError ? (
            <div className="relative z-[1] grid min-h-[260px] place-items-center rounded-[26px] border border-[var(--border-color)] bg-[color:color-mix(in_srgb,var(--card-color)_88%,transparent)] p-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]" role="alert">
              <div>
                <h2 className="mb-2.5">Unable to load weather details</h2>
                <p className="max-w-[480px] leading-[1.7] text-[rgba(236,243,251,0.78)]">{weatherError}</p>
              </div>
            </div>
          ) : null}

          {!isLoadingWeather && !weatherError && weatherData && aqiData ? (
            <div className="relative z-[1] grid gap-[22px]">
              <section className="grid grid-cols-[minmax(0,1.2fr)_minmax(240px,0.8fr)] items-center gap-[22px] rounded-[28px] border border-[var(--border-color)] bg-[color:color-mix(in_srgb,var(--card-color)_88%,transparent)] p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] max-[760px]:grid-cols-1 max-sm:p-[18px]">
                <div className="flex min-w-0 items-center justify-between gap-5 max-[760px]:flex-col max-[760px]:items-start">
                  <div>
                    <p className="text-[0.78rem] uppercase tracking-[0.1em] text-[rgba(226,236,244,0.66)]">Selected city</p>
                    <h2 className="my-3 text-[clamp(1.7rem,3vw,2.5rem)]">{selectedLocation?.city || weatherData.city}</h2>
                    <p className="break-words text-[var(--text-muted)]">{[selectedLocation?.state, selectedLocation?.country].filter(Boolean).join(', ')}</p>
                    <p className="break-words text-[var(--text-muted)]">{weatherData.condition}</p>
                  </div>
                  {weatherIconUrl ? <img src={weatherIconUrl} alt={weatherData.condition} className="h-[110px] w-[110px] drop-shadow-[0_14px_22px_rgba(0,0,0,0.25)]" /> : null}
                </div>
                <div className="rounded-3xl bg-[color:color-mix(in_srgb,var(--card-solid)_78%,transparent)] p-6 text-center">
                  <span className="block text-[clamp(2.7rem,5vw,4.2rem)] font-bold leading-none">{weatherData.temperature}{'\u00B0'}C</span>
                  <span className="mt-3 block text-[var(--text-muted)]">Temperature now</span>
                </div>
              </section>

              <section className="grid grid-cols-1 gap-4 min-[760px]:grid-cols-2 min-[980px]:grid-cols-5">
                <article className="flex min-w-0 flex-col justify-between overflow-hidden rounded-[22px] border border-[var(--border-color)] bg-[color:color-mix(in_srgb,var(--card-color)_88%,transparent)] p-[22px] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition duration-200 hover:-translate-y-1 max-sm:p-[18px]">
                  <span className="block text-[0.8rem] uppercase tracking-[0.08em] text-[var(--text-soft)]">Condition</span>
                  <strong className="my-4 block break-words text-[clamp(1.55rem,3vw,2.2rem)]">{weatherData.condition}</strong>
                  <p className="break-words text-[var(--text-muted)]">Current weather status</p>
                </article>
                <article className="flex min-w-0 flex-col justify-between overflow-hidden rounded-[22px] border border-[var(--border-color)] bg-[color:color-mix(in_srgb,var(--card-color)_88%,transparent)] p-[22px] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition duration-200 hover:-translate-y-1 max-sm:p-[18px]">
                  <span className="block text-[0.8rem] uppercase tracking-[0.08em] text-[var(--text-soft)]">Humidity</span>
                  <strong className="my-4 block break-words text-[clamp(1.55rem,3vw,2.2rem)]">{weatherData.humidity}%</strong>
                  <p className="break-words text-[var(--text-muted)]">Relative humidity</p>
                </article>
                <article className={`flex min-w-0 flex-col justify-between overflow-hidden rounded-[22px] border p-[22px] transition duration-200 hover:-translate-y-1 max-sm:p-[18px] ${aqiMeta.cardClass}`}>
                  <span className="block text-[0.8rem] uppercase tracking-[0.08em] text-[var(--text-soft)]">AQI</span>
                  <strong className="my-4 block break-words text-[clamp(1.55rem,3vw,2.2rem)]">{aqiData.aqi}</strong>
                  <p className="break-words text-[var(--text-muted)]">{aqiMeta.label} {aqiMeta.emoji}</p>
                </article>
                <article className="flex min-w-0 flex-col justify-between overflow-hidden rounded-[22px] border border-[var(--border-color)] bg-[color:color-mix(in_srgb,var(--card-color)_88%,transparent)] p-[22px] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition duration-200 hover:-translate-y-1 max-sm:p-[18px]">
                  <span className="block text-[0.8rem] uppercase tracking-[0.08em] text-[var(--text-soft)]">PM2.5</span>
                  <strong className="my-4 block break-words text-[clamp(1.55rem,3vw,2.2rem)]">{aqiData.pm25}</strong>
                  <p className="break-words text-[var(--text-muted)]">ug/m3 concentration</p>
                </article>
                <article className="flex min-w-0 flex-col justify-between overflow-hidden rounded-[22px] border border-[var(--border-color)] bg-[color:color-mix(in_srgb,var(--card-color)_88%,transparent)] p-[22px] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition duration-200 hover:-translate-y-1 min-[760px]:col-span-2 min-[980px]:col-span-1 max-sm:p-[18px]">
                  <span className="block text-[0.8rem] uppercase tracking-[0.08em] text-[var(--text-soft)]">PM10</span>
                  <strong className="my-4 block break-words text-[clamp(1.55rem,3vw,2.2rem)]">{aqiData.pm10}</strong>
                  <p className="break-words text-[var(--text-muted)]">ug/m3 concentration</p>
                </article>
              </section>

              <section className="rounded-3xl border border-[var(--border-color)] bg-[color:color-mix(in_srgb,var(--card-color)_88%,transparent)] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] max-sm:p-[18px]">
                <div className="mb-[18px] flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start">
                  <h3>Smart suggestions</h3>
                  <span className="text-[var(--text-muted)]">Live response from your backend</span>
                </div>
                <div className="grid gap-[14px]">
                  {helperSuggestions.map((item) => (
                    <div className="rounded-2xl border border-[var(--border-color)] bg-[color:color-mix(in_srgb,var(--card-solid)_88%,transparent)] px-4 py-[15px]" key={item}>{item}</div>
                  ))}
                </div>
              </section>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
};

export default Weather;
