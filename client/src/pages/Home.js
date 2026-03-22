import React from 'react';
import { Link } from 'react-router-dom';
import MeanCountry from './assets/js/meanCountry';
import MeanIndividual from './assets/js/meanIndividual';
import MeanCountryAnnual from './assets/js/meanCountryAnnual';
import MeanHousehold from './assets/js/meanHousehold';
import Auth from '../utils/auth';
import earthImg from './assets/images/earth.svg';
import homeBackdrop from './assets/images/left-green-blue.png';

const primaryButtonClasses =
  'inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-green-500 to-cyan-500 px-5 py-2.5 text-[1rem] font-medium text-white no-underline shadow-md transition-all duration-200 hover:-translate-y-[2px] hover:shadow-lg md:px-6 md:py-3';

const chartCardClasses =
  'flex h-full min-w-0 w-full flex-col gap-4 overflow-visible whitespace-normal rounded-2xl border border-black/5 bg-white/85 px-7 py-7 shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-[5px] hover:shadow-xl [overflow-wrap:break-word] [word-break:break-word] dark:border-gray-700 dark:bg-gray-900/80';

const Home = () => {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--background-color)]">
      <img src={homeBackdrop} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-white/85 dark:bg-slate-950/85"></div>

      <header className="mb-10 rounded-b-[50px] bg-[linear-gradient(135deg,var(--dark-blue),var(--dark-green))] px-4 py-12 text-center text-white shadow-[0_4px_6px_rgba(0,0,0,0.1)] md:px-8 md:py-20 lg:px-16">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-3 text-3xl font-bold md:text-5xl">
            Carbon <span className="italic text-[var(--primary-green)]">Footprint</span>
          </h1>
          <p className="mb-8 text-base text-white/80 md:text-xl">
            Find your carbon footprint today.
          </p>

          <div>
            {Auth.loggedIn() ? (
              <Link to="/calculator" className={primaryButtonClasses}>
                Calculate Your Footprint
              </Link>
            ) : (
              <Link to="/login" className={primaryButtonClasses}>
                Calculate Your Footprint
              </Link>
            )}
          </div>
          <div className="mt-8 flex items-center justify-center">
            <img
              src={earthImg}
              alt="Rotating Earth"
              className="h-auto w-[220px] max-w-[70vw] animate-[spin_20s_linear_infinite] drop-shadow-[0_10px_25px_rgba(0,0,0,0.25)] md:w-[300px]"
            />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1200px] px-4 py-10 md:px-8 md:py-16 lg:px-16">
        <div className="mb-6 rounded-2xl border border-black/5 border-l-[5px] border-l-[var(--primary-green)] bg-white/70 p-6 shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-[5px] hover:shadow-2xl dark:border-gray-700 dark:bg-gray-900/70 md:p-8">
          <h3 className="mb-[15px] text-[1.4rem] font-semibold text-[var(--dark-blue)]">What is a carbon footprint?</h3>
          <p className="mb-[10px] text-base leading-relaxed text-gray-700 dark:text-gray-300">
            Your carbon footprint is a measurement of your contribution to
            carbon emissions and climate change. Our everyday activities
            produce carbon dioxide and methane through direct causes, like
            driving a gas-powered car, or indirect causes, like using
            electricity in your home. Everyone&apos;s carbon emissions add up and
            cause global climate change.
          </p>
        </div>

        <div className="mx-auto mb-6 max-w-3xl rounded-2xl border border-black/5 border-l-[5px] border-l-[var(--primary-green)] bg-white/70 px-4 py-8 shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-[5px] hover:shadow-2xl dark:border-gray-700 dark:bg-gray-900/70 md:px-8">
          <h3 className="mb-[15px] text-[1.4rem] font-semibold text-[var(--dark-blue)]">What can you do about it?</h3>
          <p className="mb-[10px] max-w-3xl text-base leading-relaxed text-gray-800 dark:text-gray-200">
            Small changes add up to a huge global impact. Change starts with
            knowing your own carbon footprint and then changing what you can
            to reduce it.
          </p>
          <p className="mt-[15px] rounded-lg bg-[#e8f8f5] p-[15px] text-center text-[1.1rem] leading-relaxed text-gray-800 dark:bg-[color:color-mix(in_srgb,var(--card-color)_82%,var(--primary-green)_18%)] dark:text-gray-100">
            <strong>Calculate</strong> your footprint. <strong>Make a pledge</strong> to
            change. <strong>Do it</strong>. Mark your pledge <strong>complete</strong>.
          </p>
        </div>

        <div className="mt-8 text-center text-[0.9rem] italic text-gray-600 dark:text-gray-300">
          If you want to say thank you for this free service, donate to the
          organizations who are driving real systemic progress in the fight
          against climate change.
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 py-10 md:px-8 md:py-16 lg:px-16">
        <h2 className="mb-10 text-center text-[2rem] font-bold text-[var(--dark-blue)]">
          Does your carbon footprint beat global averages?
        </h2>
        <p className="text-center text-[0.9rem] italic text-gray-600 dark:text-gray-300">
          Data based on Global Carbon Project, World Bank, and IEA estimates.
        </p>

        <div className="grid grid-cols-1 items-stretch gap-6 pt-8 md:grid-cols-2">
          <div className={chartCardClasses}>
            <h3 className="break-words whitespace-normal text-center text-xl font-semibold text-gray-800 dark:text-white [word-break:break-word]">
              India Total Annual CO2 Emissions
            </h3>
            <p className="mb-[15px] break-words whitespace-normal text-base leading-relaxed text-gray-700 dark:text-gray-300 [word-break:break-word]">Metric Tons CO2 per year</p>
            <p className="mb-5 break-words text-[1.1rem] font-bold text-[var(--dark-green)]">2.9 billion tonnes</p>
            <a className="mb-4 block w-full overflow-visible pb-4" href="https://ourworldindata.org/co2/" target="_blank" rel="noreferrer">
              <div className="min-h-[250px] w-full min-w-0 overflow-visible pb-4">
                <MeanCountryAnnual />
              </div>
            </a>
          </div>

          <div className={chartCardClasses}>
            <h3 className="break-words whitespace-normal text-center text-xl font-semibold text-gray-800 dark:text-white [word-break:break-word]">
              Per Capita Emissions (India)
            </h3>
            <p className="mb-[15px] break-words whitespace-normal text-base leading-relaxed text-gray-700 dark:text-gray-300 [word-break:break-word]">
              India average tonnes per person per year
            </p>
            <p className="mb-5 break-words text-[1.1rem] font-bold text-[var(--dark-green)]">1.9 tonnes</p>
            <p className="mb-[15px] break-words whitespace-normal text-base leading-relaxed text-gray-700 dark:text-gray-300 [word-break:break-word]">Lower than global average</p>
            <a className="mb-4 block w-full overflow-visible pb-4" href="https://ourworldindata.org/co2/" target="_blank" rel="noreferrer">
              <div className="min-h-[250px] w-full min-w-0 overflow-visible pb-4">
                <MeanCountry />
              </div>
            </a>
          </div>

          <div className={chartCardClasses}>
            <h3 className="break-words whitespace-normal text-center text-xl font-semibold text-gray-800 dark:text-white [word-break:break-word]">
              India Household Emissions
            </h3>
            <p className="mb-[15px] break-words whitespace-normal text-base leading-relaxed text-gray-700 dark:text-gray-300 [word-break:break-word]">Annual tonnes CO2 per household</p>
            <p className="mb-5 break-words text-[1.1rem] font-bold text-[var(--dark-green)]">1.5-2.5 tonnes</p>
            <p className="mb-[15px] break-words whitespace-normal text-base leading-relaxed text-gray-700 dark:text-gray-300 [word-break:break-word]">
              Based on average energy, transport, and food usage
            </p>
            <a className="mb-4 block w-full overflow-visible pb-4" href="https://www.zerofy.net/2022/04/04/household-co2-emissions.html" target="_blank" rel="noreferrer">
              <div className="min-h-[250px] w-full min-w-0 overflow-visible pb-4">
                <MeanHousehold />
              </div>
            </a>
          </div>

          <div className={chartCardClasses}>
            <h3 className="break-words whitespace-normal text-center text-xl font-semibold text-gray-800 dark:text-white [word-break:break-word]">
              Indian Footprint Breakdown
            </h3>
            <p className="mb-[15px] break-words whitespace-normal text-base leading-relaxed text-gray-700 dark:text-gray-300 [word-break:break-word]">
              Electricity 35% | Transport 18% | Industry 27%
            </p>
            <p className="mb-[15px] break-words whitespace-normal text-base leading-relaxed text-gray-700 dark:text-gray-300 [word-break:break-word]">Agriculture 12% | Others 8%</p>
            <a className="mb-4 block w-full overflow-visible pb-4" href="https://suncommon.com/understanding-your-carbon-footprint/" target="_blank" rel="noreferrer">
              <div className="min-h-[250px] w-full min-w-0 overflow-visible pb-4">
                <MeanIndividual />
              </div>
            </a>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link to="/learn" className={primaryButtonClasses}>
            Explore Learning
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Home;

