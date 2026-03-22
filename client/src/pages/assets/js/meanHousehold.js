import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const data = {
  labels: [
    'Low Footprint Household',
    'Medium Footprint Household',
    'High Footprint Household',
  ],
  datasets: [
    {
      label: 'Carbon Emissions in Metric Tons',
      data: [1.6, 2.1, 2.5],
      backgroundColor: [
        'rgba(162, 213, 159, 1)',
        'rgba(98, 187, 160, 1)',
        'rgba(72, 139, 118, 1)',
      ],
      borderColor: [
        'rgba(36, 59, 74, 1)',
        'rgba(36, 59, 74, 1)',
        'rgba(36, 59, 74, 1)',
      ],
      borderWidth: 1,
      hoverBackgroundColor: [
        'rgba(162, 213, 159, 0.4)',
        'rgba(98, 187, 160, 0.4)',
        'rgba(72, 139, 118, 0.4)',
      ],
    },
  ],
};

const MeanHousehold = () => {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '250px' }}>
      <Bar
        data={data}
        options={{
          maintainAspectRatio: false,
          resizeDelay: 0,
          responsive: true,
          plugins: {
            legend: {
              display: false
            }
          }
        }}
      ></Bar>
    </div>
  );
};

export default MeanHousehold;
