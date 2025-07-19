'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

const traits = [
  "Self-Awareness", "Resilience", "Empathy", "Integrity",
  "Collaboration", "Feedback", "Learning Agility", "Continuous Improvement",
  "Influence", "Motivated", "Strategic Thinking", "Executive Functioning",
  "Communication", "Networking", "Results Driven", "Presence"
];

const descriptions = [
  'I understand my own strengths and limitations, recognize my emotional triggers, and consider how my actions affect others.',
  'I stay grounded during stressful situations, bounce back quickly from setbacks, and adapt calmly when things change.',
  'I tune into other people’s emotions and perspectives, and I respond with genuine care and understanding.',
  'I make decisions that align with my values and strive to be honest, fair, and consistent in my actions.',
  'I value input from others, work toward shared goals, and contribute to a supportive team environment.',
  'I welcome constructive feedback, take time to reflect on it, and use it to grow without becoming defensive.',
  'I adjust quickly in new or unfamiliar situations and apply lessons learned to future challenges.',
  'I actively look for ways to improve my skills, thinking, and approach — both personally and professionally.',
  'I can inspire others, rally support for ideas, and create movement without needing formal authority.',
  'I am eager to grow as a leader and actively seek opportunities to take on greater responsibility.',
  'I connect today’s actions to long-term goals and try to anticipate future challenges and opportunities.',
  'I stay organized, set clear priorities, and follow through even when juggling multiple demands.',
  'I express ideas clearly, listen deeply, and adjust my message based on who I’m speaking with.',
  'I invest in building and maintaining meaningful relationships that support mutual growth and influence.',
  'I follow through on commitments, take ownership of outcomes, and consistently meet or exceed expectations.',
  'I show up with confidence and clarity, and people tend to listen when I speak — even without a formal title.'
];

const leaderTypes: Record<string, { name: string; description: string }> = {
  'low-low': { name: 'Overlooked', description: 'You may not always be seen or heard in your organization, and leadership might feel out of reach...' },
  'medium-low': { name: 'Functional Contributor', description: 'You show up reliably and contribute steadily to your team...' },
  'high-low': { name: 'Hidden Leader', description: 'You lead from within — with integrity, emotional depth, and quiet strength...' }, // FIXED
  'low-medium': { name: 'Underutilized', description: 'You bring energy, ambition, and capability to your work — but you may not fully leverage your emotional intelligence...' },
  'medium-medium': { name: 'Developing Leader', description: 'You’re finding your leadership footing. You ask thoughtful questions, contribute meaningfully...' },
  'high-medium': { name: 'Promotable Performer', description: 'You deliver consistently and are trusted to get things done...' },
  'low-high': { name: 'Polished Performer', description: 'You likely make a strong impression and come across as confident and capable...' }, // FIXED
  'medium-high': { name: 'Emerging Leader', description: 'You’re stepping into your leadership identity with curiosity, initiative, and growing confidence...' },
  'high-high': { name: 'Visible Leader', description: 'You bring both presence and principle to your work. Others recognize your consistency...' }
};

export default function SelfAssessmentPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [scores, setScores] = useState(Array(traits.length).fill(3));
  const [result, setResult] = useState<{ name: string; description: string } | null>(null);

  const updateScore = (index: number, value: number) => {
    const newScores = [...scores];
    newScores[index] = value;
    setScores(newScores);
  };

  const renderSliders = (start: number, end: number) => (
    traits.slice(start, end + 1).map((trait, i) => (
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
    ))
  );

  const getCategory = (sum: number) => {
    if (sum <= 22) return 'low';
    if (sum <= 34) return 'medium';
    return 'high';
  };

  const handleSubmit = async () => {
    const dnaSum = scores.slice(0, 8).reduce((a, b) => a + b, 0);
    const capitalSum = scores.slice(8).reduce((a, b) => a + b, 0);
    const dnaCategory = getCategory(dnaSum);
    const capitalCategory = getCategory(capitalSum);
    const quadrantKey = `${capitalCategory}-${dnaCategory}`;

    const leader = leaderTypes[quadrantKey] || {
      name: 'Undefined',
      description: 'Unable to determine leadership type.'
    };

    // Save to Supabase (self_assessment table)
    await supabase.from('self_assessments').insert([
      {
        type: 'public',
        scores: {
          "Self-Awareness": scores[0],
          "Resilience": scores[1],
          "Empathy": scores[2],
          "Integrity": scores[3],
          "Collaboration": scores[4],
          "Feedback": scores[5],
          "Learning Agility": scores[6],
          "Continuous Improvement": scores[7],
          "Influence": scores[8],
          "Motivated": scores[9],
          "Strategic Thinking": scores[10],
          "Executive Functioning": scores[11],
          "Communication": scores[12],
          "Networking": scores[13],
          "Results Driven": scores[14],
          "Presence": scores[15]
        },
        leadership_dna_sum: dnaSum,
        leadership_capital_sum: capitalSum,
        leader_type: leader.name,
        quadrant_key: quadrantKey
      }
    ]);

    setResult(leader);
    setStep(5);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-6">
      <header className="flex items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-700">Self-Assessment</h2>
      </header>

      {step >= 1 && step <= 4 && (
        <>
          {step === 1 && (
            <>
              <div className="mb-4">
                <label className="block font-semibold">Your Name</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="mb-6 text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-200">
              <p><strong>How to score:</strong></p>
              <p>Use the slider to rate each trait on a scale of <strong>one</strong> to <strong>ten</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>1</strong> = Rarely True</li>
                <li><strong>3</strong> = Sometimes True</li>
                <li><strong>5</strong> = Consistently True</li>
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
        </div>
      )}
    </div>
  );
}
