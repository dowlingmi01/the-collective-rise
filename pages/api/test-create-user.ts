// pages/api/test-create-user.ts
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password, name, role_id, company_id } = req.body;

  try {
    // 1. Create user with email & password
    const { data: user, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email verification
    });

    if (signUpError) {
      console.error('Sign-up error:', signUpError.message);
      return res.status(500).json({ error: signUpError.message });
    }

    // 2. Insert into users table
    const { error: insertError } = await supabaseAdmin.from('users').insert({
      id: user.user.id,
      email,
      name,
      role_id,
      company_id,
    });

    if (insertError) {
      console.error('Insert error:', insertError.message);
      return res.status(500).json({ error: insertError.message });
    }

    return res.status(200).json({ message: 'Test user created successfully.' });
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Unexpected server error' });
  }
}
