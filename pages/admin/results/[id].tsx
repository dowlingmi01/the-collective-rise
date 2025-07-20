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

export default function ResultPage() {
  const router = useRouter();
  const { id } = router.query;

  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    const fetchResult = async () => {
      const { data, error } = await supabase
        .from('self_assessments')
        .select(`
          id,
          leader_type,
          scores,
          created_at,
          users (
            name,
            companies ( name )
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching result:', error.message);
        return;
      }

      setResult(data);
    };

    fetchResult();
  }, [id]);

  if (!result) return <div className="p-6">Loading...</div>;

  const traitLabels = Object.keys(result.scores || {});
  const traitValues = Object.values(result.scores || {});

  const chartData = {
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

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-2">
        {result.users?.name} — {result.leader_type}
      </h1>
      <p className="text-gray-600 mb-4">{result.users?.companies?.name}</p>
      <Radar data={chartData} />
      <div className="text-sm text-gray-400 mt-4">
        Completed on {new Date(result.created_at).toLocaleDateString()}
      </div>
    </div>
  );
}
