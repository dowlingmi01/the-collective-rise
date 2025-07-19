import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

type Assessment = {
  id: string;
  assessor_name: string;
  subject_name: string;
  scores: number[];
  created_at: string;
};

type Result = {
  name: string;
  description: string;
};

export default function AdminNominations() {
  const [assessments, setAssessments] = useState<(Assessment & { result: Result })[]>([]);

  useEffect(() => {
    const fetchNominations = async () => {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('type', 'third_party_assessment')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching nominations:', error.message);
        return;
      }
      console.log('Fetched data:', data); // ✅ log this

      const processed = (data || []).map((a) => {
        const dnaSum = a.scores.slice(0, 8).reduce((sum, s) => sum + s, 0);
        const capSum = a.scores.slice(8, 16).reduce((sum, s) => sum + s, 0);
        const getCategory = (sum: number) => (sum <= 22 ? 'low' : sum <= 34 ? 'medium' : 'high');
        const key = `${getCategory(capSum)}-${getCategory(dnaSum)}`;

        const leaderTypes: Record<string, Result> = {
          "low-low": { name: "Overlooked", description: "Low visibility, not yet grounded in leadership behaviors..." },
          "medium-low": { name: "Functional Contributor", description: "Some presence, but not yet leader-ready..." },
          "high-low": { name: "Polished Performer", description: "Charismatic and outwardly confident, but lacks depth..." },
          "low-medium": { name: "Underutilized", description: "Leadership capital, but needs growth in leadership traits..." },
          "medium-medium": { name: "Developing Leader", description: "Good balance of skills and substance..." },
          "high-medium": { name: "Promotable Performer", description: "High-value contributor with potential..." },
          "low-high": { name: "Hidden Leader", description: "Strong intrinsic leadership, but flies under the radar..." },
          "medium-high": { name: "Emerging Leader", description: "Showing initiative and curiosity..." },
          "high-high": { name: "Visible Leader", description: "Recognized, values-aligned, ready for more..." }
        };

        return {
          ...a,
          result: leaderTypes[key] || { name: 'Undefined', description: 'Could not calculate result.' }
        };
      });

      setAssessments(processed);
    };

    fetchNominations();
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Third-Party Nominations</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-4 py-2 border">Evaluator</th>
              <th className="px-4 py-2 border">Evaluatee</th>
              <th className="px-4 py-2 border">Result</th>
              <th className="px-4 py-2 border">Date</th>
            </tr>
          </thead>
          <tbody>
            {assessments.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-2 border">{a.assessor_name}</td>
                <td className="px-4 py-2 border">{a.subject_name}</td>
                <td className="px-4 py-2 border font-medium text-teal-700">{a.result?.name}</td>
                <td className="px-4 py-2 border text-sm text-gray-500">
                  {new Date(a.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 border">
                  <Link href={`/nominations/${a.id}`} className="text-teal-600 hover:underline">
                    View Results
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
