import React from 'react';
import donationBackdrop from './assets/images/left-green-blue.png';

const Donation = () => {
  const donations = [
    {
      title: 'Greenpeace India',
      description:
        'Independent NGO working against climate change and pollution, funded by public donations and citizen support across campaigns.',
      workPoints: ['Climate campaigns', 'Clean energy', 'Plastic control'],
      link: 'https://www.greenpeace.org/india/en/donation/',
    },
    {
      title: 'Mission Green India',
      description:
        'Focuses on tree plantation and water conservation with large-scale environmental impact and practical local sustainability work.',
      workPoints: ['Tree plantation', 'Water conservation', 'Plastic recycling'],
      link: 'https://missiongreen.org.in/',
    },
    {
      title: 'Rainmatter Foundation',
      description:
        'Supports climate startups and NGOs working on large-scale environmental solutions through funding and long-term ecosystem support.',
      workPoints: ['Climate funding', 'Forest restoration', 'Agriculture projects'],
      link: 'https://rainmatter.org/',
    },
    {
      title: 'Planet Earth NGO',
      description:
        'Promotes environmental awareness and sustainability through campaigns, youth programs, and action-oriented community initiatives.',
      workPoints: ['Cleanup drives', 'Plastic-free campaigns', 'Awareness programs'],
      link: 'https://planetearth.org.in/',
    },
    {
      title: 'GreeNation',
      description:
        'Works on nationwide environmental protection and sustainability campaigns with a focus on practical ecological outcomes.',
      workPoints: ['Tree plantation', 'Renewable energy', 'Forest protection'],
      link: 'https://greenationindia.com/',
    },
    {
      title: 'AJSA India',
      description:
        'Supports rural communities with sustainable agriculture, farmer-focused programs, and climate resilience initiatives.',
      workPoints: ['Rural sustainability', 'Farmer support', 'Climate resilience'],
      link: 'https://ajsaindia.org/',
    },
  ];
  const resources = [
    {
      link: 'http://www.globalstewards.org/reduce-carbon-footprint.htm',
      title: 'Reduce Carbon Footprint',
    },
    {
      link: 'https://www.epa.gov/climateleadership/ghg-reduction-programs-strategies',
      title: 'EPA Strategies',
    },
    {
      link: 'https://www.nps.gov/pore/learn/nature/climatechange_action_home.htm',
      title: 'Climate Change Action',
    },
    {
      link: 'https://ourworldindata.org/co2-and-other-greenhouse-gas-emissions',
      title: 'Our World In Data',
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-5 md:px-10">
      <img src={donationBackdrop} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--bg-color)_92%,white),color-mix(in_srgb,var(--bg-color)_85%,var(--card-color)))]"></div>

      <p className="relative mx-auto mb-10 max-w-[1200px] overflow-hidden rounded-2xl bg-[linear-gradient(135deg,var(--card-color),color-mix(in_srgb,var(--card-color)_78%,var(--bg-color)))] px-[25px] py-[25px] text-[15px] leading-[1.9] text-[var(--text-muted)] shadow-[0_8px_30px_rgba(44,62,80,0.15)] transition duration-300 before:absolute before:left-0 before:top-0 before:h-1.5 before:w-full before:bg-[linear-gradient(90deg,var(--primary-green),var(--dark-blue))] after:absolute after:bottom-0 after:right-0 after:h-[120px] after:w-[120px] after:rounded-full after:bg-[radial-gradient(circle,rgba(46,204,113,0.1),transparent)] hover:-translate-y-[5px] hover:shadow-[0_10px_25px_rgba(0,0,0,0.2)] md:px-[50px] md:py-10 md:text-[17px]">
        If you are looking for more impactful ways to help the environment, consider making a donation to organizations dedicated to fighting climate change. Your contribution can fund critical initiatives like reforestation projects, renewable energy development, and conservation efforts that protect vulnerable ecosystems, creating a ripple effect of positive change. Unlike individual actions, financial support scales up the impact, allowing experts to implement large-scale solutions that reduce carbon emissions and promote sustainability globally. By donating, you become part of a collective movement, turning your resources into tangible progress for a healthier planet and a more secure future for generations to come.
      </p>

      <div className="relative">
        <h1 className="mx-[25px] mb-[50px] mt-5 text-center text-[1.5rem] font-bold tracking-[0.5px] text-[var(--text-color)] after:mx-auto after:mt-[15px] after:block after:h-1 after:w-20 after:rounded-sm after:bg-[linear-gradient(90deg,var(--primary-green),var(--dark-blue))] sm:text-[2rem] lg:text-[2.5rem]">
          Looking for more ways to help the environment?
        </h1>
        <h2 className="mx-[25px] mt-2 text-[1.3rem] font-semibold text-[var(--text-color)] sm:text-[1.5rem] lg:text-[1.8rem]">
          Donate to fight climate change
        </h2>
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-[30px] md:grid-cols-2 xl:grid-cols-3">
          {donations.map(({ title, link, description, workPoints }) => (
            <div
              className="relative flex flex-col overflow-hidden rounded-2xl bg-[var(--card-color)] p-[30px] shadow-[0_8px_30px_rgba(44,62,80,0.15)] transition duration-300 before:absolute before:left-0 before:top-0 before:h-[5px] before:w-full before:bg-[linear-gradient(90deg,var(--primary-green),var(--dark-blue))] hover:-translate-y-2.5 hover:shadow-[0_10px_25px_rgba(0,0,0,0.2)]"
              key={title}
            >
              <h4 className="mb-[15px] border-b-2 border-b-[color:color-mix(in_srgb,var(--border-color)_84%,transparent)] pb-5 text-[22px] font-bold text-[var(--text-color)]">
                {title}
              </h4>
              <p className="pb-5 text-[15px] leading-[1.7] text-[var(--text-muted)]">{description}</p>
              <ul className="mb-5 list-disc pl-5 text-sm leading-[1.7] text-[var(--text-muted)]">
                {workPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <a href={link} target="_blank" rel="noreferrer">
                <button
                  className="mt-auto rounded-full bg-[linear-gradient(135deg,var(--dark-blue),var(--primary-green))] px-[30px] py-[15px] text-base font-semibold text-[var(--white)] shadow-[0_4px_15px_rgba(46,204,113,0.3)] transition duration-300 hover:-translate-y-[3px] hover:bg-[linear-gradient(135deg,var(--primary-green),var(--dark-green))] hover:shadow-[0_6px_20px_rgba(46,204,113,0.5)]"
                  type="submit"
                >
                  Donate Now
                </button>
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="relative">
        <h2 className="mx-[25px] mt-[60px] text-center text-[1.3rem] font-bold text-[var(--text-color)] sm:text-[1.5rem] lg:text-[2rem]">
          Learn more about lowering your carbon footprint
        </h2>
        <div className="mx-[25px] mt-[30px] flex flex-wrap justify-center gap-[15px] max-sm:flex-col max-sm:items-center">
          {resources.map(({ link, title }) => (
            <a
              className="text-[var(--text-color)] no-underline transition duration-300 hover:text-[var(--primary-green)] hover:underline"
              key={title}
              href={link}
              target="_blank"
              rel="noreferrer"
            >
              <button
                className="my-2 w-full max-w-[300px] rounded-full border-2 border-[color:color-mix(in_srgb,var(--text-color)_30%,var(--border-color))] bg-[var(--card-color)] px-[30px] py-[14px] text-base font-semibold text-[var(--text-color)] shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition duration-300 hover:bg-[color:color-mix(in_srgb,var(--dark-blue)_70%,var(--card-color))] hover:text-white hover:shadow-[0_10px_25px_rgba(0,0,0,0.2)]"
                type="submit"
              >
                {title}
              </button>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Donation;
