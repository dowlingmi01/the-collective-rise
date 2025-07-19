// pages/nominations/[id].tsx

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const traits = [
  "Self-Awareness", "Resilience", "Empathy", "Integrity",
  "Collaboration", "Feedback", "Learning Agility", "Continuous Improvement",
  "Influence", "Motivated", "Strategic Thinking", "Executive Functioning",
  "Communication", "Networking", "Results Driven", "Presence"
];

export default function NominationDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (id) {
      supabase
        .from('assessments')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error('Fetch error:', error.message);
          } else {
            setData(data);
          }
        });
    }
  }, [id]);

  if (!data) return <p className="p-4">Loading...</p>;

  const chartData = {
    labels: traits,
    datasets: [
      {
        label: `${data.subject_name}'s Assessment`,
        data: data.scores,
        backgroundColor: 'rgba(13, 148, 136, 0.2)',
        borderColor: 'rgba(13, 148, 136, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(13, 148, 136, 1)',
      }
    ]
  };

  const options = {
    scales: {
      r: {
        min: 0,
        max: 5,
        ticks: { stepSize: 1 },
        pointLabels: { font: { size: 10 } }
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">{data.subject_name}</h1>
      <p className="text-sm text-gray-600 mb-6">Assessed by {data.assessor_name}</p>

      <Radar data={chartData} options={options} />

      <p className="mt-6 text-sm text-gray-500">Submitted: {new Date(data.created_at).toLocaleString()}</p>
    </div>
  );
}
