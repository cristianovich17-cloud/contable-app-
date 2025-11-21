'use client';
import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type Props = {
  labels: string[];
  ingresos: number[];
  egresos: number[];
};

export default function IngresoEgresoChart({ labels, ingresos, egresos }: Props) {
  const data = {
    labels,
    datasets: [
      {
        label: 'Ingresos',
        data: ingresos,
        borderColor: 'rgba(34,197,94,1)',
        backgroundColor: 'rgba(34,197,94,0.2)',
        tension: 0.2,
      },
      {
        label: 'Egresos',
        data: egresos,
        borderColor: 'rgba(239,68,68,1)',
        backgroundColor: 'rgba(239,68,68,0.2)',
        tension: 0.2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Ingresos vs Egresos (por mes)' },
    },
  };

  return <Line options={options} data={data} />;
}
