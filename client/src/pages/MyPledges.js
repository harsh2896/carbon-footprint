import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { jsPDF } from 'jspdf';

import { QUERY_ME } from '../utils/queries';
import Auth from '../utils/auth';

const MyPledges = () => {
  const { data, loading } = useQuery(QUERY_ME, {
    skip: !Auth.loggedIn(),
  });
  const { username, homeData = [], travelData = [] } = data?.me || {};
  const myPledges = data?.me?.pledges || [];

  const hasFootprintData = homeData.length && travelData.length;
  const totalCarbonFootprint = hasFootprintData
    ? homeData[0].heatEmissions +
      homeData[0].electricityEmissions +
      homeData[0].waterEmissions +
      travelData[0].vehicleEmissions +
      travelData[0].publicTransitEmissions +
      travelData[0].planeEmissions
    : null;

  const emissionDetails = hasFootprintData
    ? {
        waterEmissions: homeData[0].waterEmissions,
        electricityEmissions: homeData[0].electricityEmissions,
        heatEmissions: homeData[0].heatEmissions,
        vehicleEmissions: travelData[0].vehicleEmissions,
        publicTransitEmissions: travelData[0].publicTransitEmissions,
        planeEmissions: travelData[0].planeEmissions,
      }
    : null;

  const downloadReport = () => {
    const doc = new jsPDF();
    let yPosition = 20;
    const reportDateTime = new Date().toLocaleString();

    doc.text('Carbon Footprint Report', 20, yPosition);
    yPosition += 10;
    doc.text(`User: ${username || 'Unknown'}`, 20, yPosition);
    yPosition += 10;
    doc.text(
      `Total Carbon Footprint: ${
        totalCarbonFootprint !== null ? totalCarbonFootprint : 'Not calculated'
      } kg CO2`,
      20,
      yPosition
    );
    yPosition += 10;
    doc.text('Report Generated:', 20, yPosition);
    yPosition += 10;
    doc.text(reportDateTime, 20, yPosition);
    yPosition += 10;
    doc.text('Emission Breakdown:', 20, yPosition);
    yPosition += 10;
    if (emissionDetails) {
      doc.text(
        `Water emissions: ${emissionDetails.waterEmissions} kg CO2`,
        20,
        yPosition
      );
      yPosition += 8;
      doc.text(
        `Electricity emissions: ${emissionDetails.electricityEmissions} kg CO2`,
        20,
        yPosition
      );
      yPosition += 8;
      doc.text(
        `Heat emissions: ${emissionDetails.heatEmissions} kg CO2`,
        20,
        yPosition
      );
      yPosition += 8;
      doc.text(
        `Vehicle emissions: ${emissionDetails.vehicleEmissions} kg CO2`,
        20,
        yPosition
      );
      yPosition += 8;
      doc.text(
        `Public Transit emissions: ${emissionDetails.publicTransitEmissions} kg CO2`,
        20,
        yPosition
      );
      yPosition += 8;
      doc.text(
        `Plane emissions: ${emissionDetails.planeEmissions} kg CO2`,
        20,
        yPosition
      );
      yPosition += 10;
    } else {
      doc.text('No emission data yet.', 20, yPosition);
      yPosition += 10;
    }
    doc.text('Pledges:', 20, yPosition);
    yPosition += 10;

    if (myPledges.length) {
      myPledges.forEach((pledge) => {
        if (yPosition > 280) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(`* ${pledge.title} - ${pledge.description}`, 20, yPosition);
        yPosition += 8;
      });
    } else {
      doc.text('No pledges yet.', 20, yPosition);
    }

    doc.save('carbon-report.pdf');
  };

  if (loading) {
    return <h2>LOADING...</h2>;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,color-mix(in_srgb,var(--bg-color)_72%,#dcfce7)_0%,color-mix(in_srgb,var(--bg-color)_86%,#dbeafe)_60%)] px-[6vw] pb-[70px] pt-10 before:pointer-events-none before:absolute before:-left-[60px] before:-top-20 before:h-[280px] before:w-[280px] before:animate-float before:rounded-full before:bg-[radial-gradient(circle,rgba(34,197,94,0.2),transparent_70%)] before:blur-xl after:pointer-events-none after:absolute after:-bottom-[110px] after:-right-[70px] after:h-[280px] after:w-[280px] after:animate-float after:rounded-full after:bg-[radial-gradient(circle,rgba(34,197,94,0.2),transparent_70%)] after:blur-xl max-sm:px-5">
      {Auth.loggedIn() ? (
        <div className="relative z-10 grid gap-7">
          <section className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <div>
              <p className="text-[0.75rem] font-bold uppercase tracking-[2px] text-emerald-500">My Pledges</p>
              <h1 className="my-2.5 text-[clamp(2rem,3vw,3rem)] font-bold text-[var(--text-color)]">
                {myPledges.length ? 'Your Sustainability Commitments' : 'Start a New Pledge'}
              </h1>
              <p className="text-[var(--text-muted)]">
                Track your pledges, export reports, and keep your footprint top of mind.
              </p>
            </div>
            <div>
              <button className="rounded-full bg-[linear-gradient(120deg,#22c55e,#3b82f6)] px-6 py-3 font-semibold text-white shadow-[0_18px_40px_rgba(15,23,42,0.12)]" type="button" onClick={downloadReport}>
                Download PDF Report
              </button>
            </div>
          </section>

          <section className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-[18px]">
            <div className="grid gap-2.5 rounded-[22px] border border-[var(--border-color)] bg-[color:color-mix(in_srgb,var(--card-color)_90%,transparent)] p-[18px] shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
              <h3>Total Carbon Footprint</h3>
              <p>
                {totalCarbonFootprint !== null
                  ? `${totalCarbonFootprint} kg CO2`
                  : 'Not calculated'}
              </p>
            </div>
            <div className="grid gap-2.5 rounded-[22px] border border-[var(--border-color)] bg-[color:color-mix(in_srgb,var(--card-color)_90%,transparent)] p-[18px] shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
              <h3>Emission Highlights</h3>
              {emissionDetails ? (
                <ul className="grid gap-1.5">
                  <li>Electricity: {emissionDetails.electricityEmissions} kg CO2</li>
                  <li>Water: {emissionDetails.waterEmissions} kg CO2</li>
                  <li>Heat: {emissionDetails.heatEmissions} kg CO2</li>
                </ul>
              ) : (
                <p>No emission data yet.</p>
              )}
            </div>
          </section>

          <section className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-[18px]">
            {myPledges.length ? (
              myPledges.map((pledge) => (
                <div className="grid gap-3 rounded-[22px] border border-[var(--border-color)] bg-[color:color-mix(in_srgb,var(--card-color)_90%,transparent)] p-[18px] shadow-[0_18px_40px_rgba(15,23,42,0.12)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_22px_38px_rgba(15,23,42,0.18)]" key={pledge._id}>
                  <div className="flex items-center gap-3">
                    <div className="grid h-[46px] w-[46px] place-items-center rounded-[14px] bg-[color:color-mix(in_srgb,var(--card-color)_76%,transparent)] font-bold text-[color:color-mix(in_srgb,#3b82f6_80%,var(--text-color))]">
                      PG
                    </div>
                    <div>
                      <h3>{pledge.title}</h3>
                      <p className="text-[var(--text-muted)]">
                        {new Date(pledge.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p>{pledge.description}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[22px] border border-dashed border-[var(--border-color)] bg-[color:color-mix(in_srgb,var(--card-color)_90%,transparent)] p-6 text-center text-[var(--text-muted)]">
                <h2>You haven&apos;t saved any pledges yet!</h2>
                <p>Create one from the calculator flow to get started.</p>
              </div>
            )}
          </section>

          <div className="flex justify-center">
            <Link to="/myfootprint">
              <button className="rounded-full bg-[linear-gradient(120deg,#22c55e,#3b82f6)] px-6 py-3 font-semibold text-white shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
                {myPledges.length ? 'Add More Pledges' : 'Add Pledges'}
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="relative z-10 px-5 py-[60px] text-center">
          <h2 className="mb-3 text-[1.6rem] font-bold">Log in to see your saved pledges!</h2>
          <Link to="/login">
            <button className="rounded-full bg-[linear-gradient(120deg,#22c55e,#3b82f6)] px-6 py-3 font-semibold text-white shadow-[0_18px_40px_rgba(15,23,42,0.12)]" type="submit">
              Log In
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyPledges;
