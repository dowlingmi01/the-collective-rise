// pages/reports/self-assessments.tsx

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type SelfAssessment = {
  id: string;
  leader_type: string;
  leadership_dna_sum: number;
  leadership_capital_sum: number;
  created_at: string;
  users: {
    name: string;
  } | null;
};

export default function SelfAssessmentsReport() {
  const [assessments, setAssessments] = useState<SelfAssessment[]>([]);

  useEffect(() => {
    const fetchSelfAssessments = async () => {
      const { data, error } = await supabase
        .from('self_assessments')
        .select(`
          id,
          leader_type,
          leadership_dna_sum,
          leadership_capital_sum,
          created_at,
          users (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching self assessments:', error.message);
      } else {
        setAssessments(data || []);
      }
    };

    fetchSelfAssessments();
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Self-Assessments</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-4 py-2 border">User ID</th>
              <th className="px-4 py-2 border">Leader Type</th>
              <th className="px-4 py-2 border">Leadership DNA</th>
              <th className="px-4 py-2 border">Leadership Capital</th>
              <th className="px-4 py-2 border">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {assessments.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-2 border">{a.id}</td>
                <td className="px-4 py-2 border">{a.leader_type}</td>
                <td className="px-4 py-2 border">{a.leadership_dna_sum}</td>
                <td className="px-4 py-2 border">{a.leadership_capital_sum}</td>
                <td className="px-4 py-2 border text-sm text-gray-500">
                  {new Date(a.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
