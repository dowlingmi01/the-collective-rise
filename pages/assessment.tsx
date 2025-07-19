import Link from 'next/link';

export default function AssessmentSelector() {
  return (
    <div className="text-center p-10">
      <h1 className="text-2xl font-bold mb-4">Choose Your Assessment Type</h1>
      <div className="space-y-4 flex flex-col items-center">
        <Link href="/assessments/self/leadership-dna" className="block">
          <button className="bg-teal-500 text-white px-6 py-2 rounded-xl shadow hover:bg-teal-600">
            Self-Assessment
          </button>
        </Link>
        <Link href="/assessments/third-party/nomination" className="block">
          <button className="bg-gray-700 text-white px-6 py-2 rounded-xl shadow hover:bg-gray-800">
            Assess Someone Else
          </button>
        </Link>
      </div>
    </div>
  );
}
