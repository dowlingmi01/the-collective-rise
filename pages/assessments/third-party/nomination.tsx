'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const traits = [
  "Self-Awareness", "Resilience", "Empathy", "Integrity",
  "Collaboration", "Feedback", "Learning Agility", "Continuous Improvement",
  "Influence", "Motivated", "Strategic Thinking", "Executive Functioning",
  "Communication", "Networking", "Results Driven", "Presence"
];

const descriptions = [
  "Recognizes their own strengths, limitations, emotional triggers, and impact on others.",
  "Stays grounded under pressure, recovers quickly from setbacks, and adapts with composure.",
  "Understands, feels, and responds to others’ emotions and perspectives with care.",
  "Acts in alignment with values; builds trust through honesty, fairness, and consistency.",
  "Encourages shared goals, values diverse input, and fosters mutual support across teams.",
  "Receptive to feedback, reflects without defensiveness, and applies it to grow.",
  "Learns quickly in unfamiliar situations, applies lessons, and thrives through change.",
  "Actively seeks opportunities to grow, improve, and evolve skills or mindsets.",
  "Inspires others, builds alignment, and moves ideas forward without relying on authority.",
  "Shows a clear desire and initiative to step into leadership opportunities.",
  "Anticipates trends, connects day-to-day actions to long-term goals, and thinks ahead.",
  "Sets priorities, follows through on goals, and stays organized amid complexity.",
  "Clearly conveys ideas, listens deeply, and adapts messages to different audiences.",
  "Builds and sustains meaningful relationships that open doors and build influence.",
  "Focuses on outcomes, meets or exceeds goals, and takes accountability for results.",
  "Commands attention through confidence, clarity, and credibility — even without a title."
];

const leaderTypes: Record<string, { name: string; description: string }> = {
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

export default function ThirdPartyAssessmentPage() {
  const [step, setStep] = useState(1);
  const [evaluator, setEvaluator] = useState('');
  const [evaluatee, setEvaluatee] = useState('');
  const [scores, setScores] = useState(Array(traits.length).fill(3));
  const [result, setResult] = useState<{ name: string; description: string } | null>(null);

  const updateScore = (index: number, value: number) => {
    const newScores = [...scores];
    newScores[index] = value;
    setScores(newScores);
  };

  const renderSliders = (start: number, end: number) => {
    return traits.slice(start, end + 1).map((trait, i) => (
      <div key={start + i} className="mb-6">
        <label className="font-semibold text-gray-800">
          {trait}: <span className="text-teal-600">{scores[start + i]}</span>
        </label>
        <div className="text-sm text-gray-500 mb-2">{descriptions[start + i]}</div>
        <input
          type="range"
          min="1"
          max="5"
          value={scores[start + i]}
          className="w-full accent-teal-500"
          onChange={(e) => updateScore(start + i, Number(e.target.value))}
        />
      </div>
    ));
  };

  const getCategory = (sum: number) => {
    if (sum <= 22) return 'low';
    if (sum <= 34) return 'medium';
    return 'high';
  };

  const handleSubmit = async () => {
    const dnaSum = scores.slice(0, 8).reduce((a, b) => a + b, 0);
    const capitalSum = scores.slice(8, 16).reduce((a, b) => a + b, 0);
    const dnaCategory = getCategory(dnaSum);
    const capitalCategory = getCategory(capitalSum);
    const quadrantKey = `${capitalCategory}-${dnaCategory}`;

    const leader = leaderTypes[quadrantKey] || {
      name: 'Undefined',
      description: 'Unable to determine leadership type.'
    };
    setResult(leader);

    // Save to Supabase
    await supabase.from('assessments').insert([
      {
        type: 'third_party_assessment',
        assessor_name: evaluator,
        subject_name: evaluatee,
        scores,
        result_label: leader.name
      }
    ]);

    setStep(5); // Show result
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-6">
      <header className="flex items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-700">Third-Party Leadership Assessment</h2>
      </header>

      {step >= 1 && step <= 4 && (
        <>
          {step === 1 && (
            <>
              <div className="mb-4">
                <label className="block font-semibold">Your Name (Evaluator)</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={evaluator}
                  onChange={(e) => setEvaluator(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block font-semibold">Name of Person You're Assessing</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={evaluatee}
                  onChange={(e) => setEvaluatee(e.target.value)}
                />
              </div>
              <div className="mb-6 text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-200">
              <p><strong>How to score:</strong></p>
              <p>Use the slider to rate each trait on a scale of <strong>one</strong> to <strong>five</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>1</strong> = Rarely demonstrates the trait</li>
                <li><strong>3</strong> = Sometimes demonstrates the trait</li>
                <li><strong>5</strong> = Consistently demonstrates the trait</li>
              </ul>
            </div>

              {renderSliders(0, 3)}
            </>
          )}
          {step === 2 && renderSliders(4, 7)}
          {step === 3 && renderSliders(8, 11)}
          {step === 4 && renderSliders(12, 15)}

          <button
            className="bg-teal-600 text-white px-6 py-2 rounded hover:bg-teal-700 mt-4"
            onClick={() => step === 4 ? handleSubmit() : setStep(step + 1)}
          >
            {step === 4 ? 'Submit' : 'Next'}
          </button>
        </>
      )}

      {step === 5 && result && (
        <div className="text-center">
          <h3 className="text-xl font-bold text-slate-800 mt-4">{result.name}</h3>
          <p className="text-sm text-gray-600 mt-2">{result.description}</p>
          {/* Radar chart and grid will go here in Step 3 */}
        </div>
      )}
    </div>
  );
}
