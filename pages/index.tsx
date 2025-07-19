import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="bg-[#F0F2EB] py-20 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-[#333] max-w-3xl mx-auto">
          Leadership Isn’t a Birthright—It’s a Mindset You Choose
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mt-6 max-w-xl mx-auto">
          The Collective Rise equips emerging leaders with the practical tools and lasting confidence they need to lead with authenticity.
        </p>
        <Link href="/assessment" className="mt-10 inline-block bg-[#0AB0BD] text-white text-lg px-6 py-3 rounded-full hover:bg-[#099ba6] transition">
          Start Your Leadership Journey
        </Link>
      </section>

      {/* What We Do */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-semibold text-[#333] mb-4">Grounded. Practical. Transformational.</h2>
          <p className="text-gray-700 text-lg">
            The Collective Rise is a 9-month leadership development program for professionals ready to lead from a place of purpose, not just position.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-12 max-w-5xl mx-auto text-center">
          <div>
            <h3 className="text-xl font-bold text-[#0AB0BD] mb-2">Self-Awareness</h3>
            <p className="text-gray-600">Know yourself to lead others. Build clarity, presence, and personal insight.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#0AB0BD] mb-2">Emotional Regulation</h3>
            <p className="text-gray-600">Respond with intention—not reaction—under pressure.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#0AB0BD] mb-2">Executive Functioning</h3>
            <p className="text-gray-600">Stay focused, prioritize wisely, and drive results with clarity.</p>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="bg-[#f9fafb] py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-semibold text-center text-[#333] mb-10">What Makes Us Different</h2>
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div>
              <h4 className="text-xl font-bold text-[#3D476B] mb-2">Whole-System Design</h4>
              <p className="text-gray-600">Rooted in the latest research and built for real-world application.</p>
            </div>
            <div>
              <h4 className="text-xl font-bold text-[#3D476B] mb-2">Blended Learning</h4>
              <p className="text-gray-600">Combines in-person training, digital journaling, and cohort-based support.</p>
            </div>
            <div>
              <h4 className="text-xl font-bold text-[#3D476B] mb-2">Supportive Cohorts</h4>
              <p className="text-gray-600">Trust-based groups that challenge and elevate each other.</p>
            </div>
            <div>
              <h4 className="text-xl font-bold text-[#3D476B] mb-2">Immediately Applicable Tools</h4>
              <p className="text-gray-600">Every session is designed to address practical leadership challenges.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Program Snapshot */}
      <section className="bg-white py-20 px-6 text-center">
        <h2 className="text-3xl font-semibold text-[#333] mb-6">9-Month Program Snapshot</h2>
        <ul className="space-y-3 text-gray-700 max-w-xl mx-auto text-left text-lg">
          <li>✔️ Pre-Program Orientation</li>
          <li>✔️ 3 In-Person Training Sessions</li>
          <li>✔️ 5 Virtual Cohort Meet-Ups</li>
          <li>✔️ Digital Learning Journal</li>
          <li>✔️ Weekly Prompts to Build Habits</li>
        </ul>
      </section>

      {/* Who It's For */}
      <section className="bg-[#96CEA0] py-20 px-6 text-white text-center">
        <h2 className="text-3xl font-semibold mb-4">Who It’s For</h2>
        <p className="text-lg mb-8 max-w-xl mx-auto">
          Professionals at small to mid-sized companies who are ready to lead with clarity and character—not just a title.
        </p>
        <div className="space-y-2 text-lg">
          <p>🚀 Nominated by their organization</p>
          <p>🔍 Seeking real-world leadership tools</p>
          <p>🌱 Ready to step into greater responsibility</p>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-[#333] text-white py-16 px-6 text-center">
        <h2 className="text-3xl font-bold">Lead With Us</h2>
        <p className="text-lg mt-4 mb-8 max-w-xl mx-auto">
          Ready to elevate your rising talent? Let’s build the future of leadership—together.
        </p>
        <a href="mailto:info@thecollectiverise.com" className="bg-[#0AB0BD] text-white px-6 py-3 rounded-full text-lg hover:bg-[#099ba6] transition">
          Contact Us
        </a>
      </section>
    </main>
  );
} 