import { Dialog } from '@headlessui/react';
import { Fragment } from 'react';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);


type ResultModalProps = {
  show: boolean;
  result: {
    name: string;
    company: string;
    leaderType: string;
    scores: Record<string, number>;
  } | null;
  onClose: () => void;
};


export default function ResultModal({ result, onClose }: ResultModalProps) {
  if (!result || !result.scores) return null;

  const traitLabels = Object.keys(result.scores);
  const traitValues = Object.values(result.scores);

  const data = {
    labels: traitLabels,
    datasets: [
      {
        label: 'Leadership Traits',
        data: traitValues,
        fill: true,
        backgroundColor: 'rgba(10, 176, 189, 0.2)',
        borderColor: 'rgba(10, 176, 189, 1)',
        pointBackgroundColor: 'rgba(10, 176, 189, 1)',
      },
    ],
  };

  const options = {
    scale: {
      ticks: {
        beginAtZero: true,
        min: 1,
        max: 5,
        stepSize: 1,
      },
    },
  };

  return (
      <Dialog open={show} onClose={onClose} as="div" className="relative z-50">
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white p-6 rounded-xl w-full max-w-xl shadow-lg">
            <Dialog.Title className="text-xl font-bold mb-2">
              {result.name} — {result.leaderType}
            </Dialog.Title>
            <p className="text-gray-600 mb-4">{result.company}</p>
            <Radar data={chartData} />
            <div className="text-right mt-6">
              <button
                onClick={onClose}
                className="bg-teal-600 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
  );
}
