// pages/api/invite-user.ts
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  console.log('Received body:', req.body);

  const { email, name, role_id, company_id, password } = req.body;

  try {
    // 1. Create the user in Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: password || 'Test1234!',
      email_confirm: true,
    });

    if (authError) {
      console.error('Auth error:', authError.message);
      return res.status(500).json({ error: authError.message });
    }

    const userId = authUser.user.id;
    if (!authUser?.user?.id) {
      return res.status(500).json({ error: 'User ID not returned from auth creation' });
    }


    // 2. Insert into public.users table with same ID
    const { error: insertError } = await supabaseAdmin
      .from('users')
      .upsert(
        [{
          id: userId,
          email,
          name,
          company_id,
          role_id,
        }],
        { onConflict: 'id' } // match primary key
      );

    if (insertError) {
      console.error('Insert error:', insertError.message);
      return res.status(500).json({ error: insertError.message });
    }

    return res.status(200).json({ message: 'User created successfully.' });
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Unexpected server error' });
  }
}


