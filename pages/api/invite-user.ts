// pages/api/invite-user.ts

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ✅ Server-side only
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, name, role, company_id } = req.body;

  try {
    // 🔧 Instead of calling inviteUserByEmail, just create the user manually
    const userId = crypto.randomUUID();

    const { error } = await supabaseAdmin.from('users').insert([
      {
        id: userId,
        email,
        name,
        role,
        company_id,
      },
    ]);

    if (error) {
      console.error('Insert error:', error.message);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: 'User added successfully.' });
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Unexpected server error' });
  }
}

