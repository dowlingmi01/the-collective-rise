
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(session.user);
      else router.push('/auth');
    });
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const fetchResults = async () => {
      console.log("🔍 Fetching from Supabase for:", user.id);

      const { data, error } = await supabase
        .from('self_assessment')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }) // newest first
        .limit(1)
        .maybeSingle(); // ✅ prevents crash on 0 records

      if (error) {
        console.error("❌ Supabase fetch error:", error.message);
      }

      if (data) {
        console.log("✅ Found in Supabase:", data);

        const loadedScores = [
          data.self_awareness, data.resilience, data.empathy, data.integrity,
          data.collaboration, data.feedback, data.learning_agility, data.continuous_improvement,
          data.influence, data.motivated, data.strategic_thinking, data.executive_functioning,
          data.communication, data.networking, data.results_driven, data.presence
        ];
        setScores(loadedScores);
        setLeaderType(getLeaderType(loadedScores));
      } else {
        console.log("❌ No record found in Supabase — falling back to localStorage");
        // ⏳ Not in Supabase yet — fallback to localStorage
        const raw = localStorage.getItem('assessment_scores');
        const storedName = localStorage.getItem('user_name') || '';

        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length === 16) {
            const newLeaderType = getLeaderType(parsed);
            setScores(parsed);
            setLeaderType(newLeaderType);

            const { error: insertError } = await supabase.from('self_assessment').insert({
              user_id: user.id,
              name: storedName,
              email: user.email,
              leader_type: newLeaderType.name,
              self_awareness: parsed[0], resilience: parsed[1], empathy: parsed[2], integrity: parsed[3],
              collaboration: parsed[4], feedback: parsed[5], learning_agility: parsed[6], continuous_improvement: parsed[7],
              influence: parsed[8], motivated: parsed[9], strategic_thinking: parsed[10], executive_functioning: parsed[11],
              communication: parsed[12], networking: parsed[13], results_driven: parsed[14], presence: parsed[15]
            });

            if (!insertError) {
              console.log("🧠 Inserted from localStorage");
              localStorage.removeItem('assessment_scores');
              localStorage.removeItem('user_name');
            }
          }
        } else {
          console.log("❌ No local or Supabase data found");
        }
      }
    };

    fetchResults();
  }, [user]);


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
