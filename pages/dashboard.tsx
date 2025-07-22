
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { Chart, Radar } from 'react-chartjs-2';
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
  'Self-Awareness', 'Resilience', 'Empathy', 'Integrity',
  'Collaboration', 'Feedback', 'Learning Agility', 'Continuous Improvement',
  'Influence', 'Motivated', 'Strategic Thinking', 'Executive Functioning',
  'Communication', 'Networking', 'Results Driven', 'Presence'
];

const leaderTypes: Record<string, { name: string; description: string }> = {
  'low-low': { name: 'Overlooked', description: 'You may not always be seen or heard in your organization, and leadership might feel out of reach...' },
  'medium-low': { name: 'Underutilized', description: 'You bring energy, ambition, and capability to your work — but you may not fully leverage your emotional intelligence...' },
  'high-low': { name: 'Hidden Leader', description: 'You lead from within — with integrity, emotional depth, and quiet strength...' },
  'medium-medium': { name: 'Developing Leader', description: 'You’re finding your leadership footing. You ask thoughtful questions, contribute meaningfully...' },
  'high-medium': { name: 'Emerging Leader', description: 'You’re stepping into your leadership identity with curiosity, initiative, and growing confidence...' },
  'low-high': { name: 'Polished Performer', description: 'You likely make a strong impression and come across as confident and capable...' },
  'low-medium': { name: 'Functional Contributor', description: 'You show up reliably and contribute steadily to your team...' },
  'medium-high': { name: 'Promotable Performer', description: 'You deliver consistently and are trusted to get things done...' },
  'high-high': { name: 'Visible Leader', description: 'You bring both presence and principle to your work. Others recognize your consistency...' }
};

function getCategory(score: number): 'low' | 'medium' | 'high' {
  if (score <= 24) return 'low';
  if (score <= 33) return 'medium';
  return 'high';
}

function getLeaderType(scores: number[]): { name: string; description: string } {
  const dnaSum = scores.slice(0, 8).reduce((a, b) => a + b, 0);
  const capitalSum = scores.slice(8, 16).reduce((a, b) => a + b, 0);
  const key = `${getCategory(dnaSum)}-${getCategory(capitalSum)}`;
  return leaderTypes[key] ?? { name: 'Unknown', description: 'Could not determine your leadership type.' };
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [scores, setScores] = useState<number[] | null>(null);
  const [leaderType, setLeaderType] = useState<{ name: string; description: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true); // 🟢 Add this line
  const router = useRouter();

  useEffect(() => {
    const loadDashboard = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/auth');
        return;
      }

      setUser(session.user);

      const { data: userData } = await supabase
        .from('users')
        .select('role_id')
        .eq('id', session.user.id)
        .single();

      const { data: roleData } = await supabase
        .from('roles')
        .select('name')
        .eq('id', userData?.role_id)
        .single();

      const roleName = roleData?.name;

      if (roleName === 'admin' || roleName === 'superadmin') {
        console.log('✅ Admin detected, skipping assessment fetch.');
        return;
      }

      const { data: assessment } = await supabase
        .from('self_assessments')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!assessment) {
        console.warn('No assessment found — skipping display');
        return;
      }

      const loadedScores = [
        assessment.self_awareness, assessment.resilience, assessment.empathy, assessment.integrity,
        assessment.collaboration, assessment.feedback, assessment.learning_agility, assessment.continuous_improvement,
        assessment.influence, assessment.motivated, assessment.strategic_thinking, assessment.executive_functioning,
        assessment.communication, assessment.networking, assessment.results_driven, assessment.presence
      ];

      setScores(loadedScores);
      setLeaderType(getLeaderType(loadedScores));
    };

    loadDashboard();
  }, [router]);



  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (!user) return <p className="p-8 text-center">Loading...</p>;

  if (!scores) {
    return (
      <div className="p-8 text-center">
        <p className="mb-4">No assessment data found.</p>
        <a href="/" className="text-blue-600 underline">Take the assessment</a>
      </div>
    );
  }

  const chartData = {
    labels: traits,
    datasets: [
      {
        label: 'Leadership Profile',
        data: scores,
        backgroundColor: 'rgba(10, 176, 189, 0.2)',
        borderColor: 'rgba(10, 176, 189, 1)',
        pointBackgroundColor: 'rgba(10, 176, 189, 1)'
      }
    ]
  };

  return (
    <div className="max-w-xl mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
      {leaderType && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold text-blue-700">Your Leadership Type: {leaderType.name}</h2>
          <p className="text-gray-700 mt-2">{leaderType.description}</p>
        </div>
      )}
      <Radar data={chartData} />
    </div>
  );
}
