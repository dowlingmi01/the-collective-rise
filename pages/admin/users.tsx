import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Company = {
  id: string;
  name: string;
};

type User = {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'superadmin';
  company_id: string;
  created_at: string;
  invite_token?: string;
};

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'user' | 'admin' | 'superadmin'>('user');
  const [companyId, setCompanyId] = useState('');

const fetchUsers = async () => {
const { data, error } = await supabase
  .from('users')
  .select(`
    id,
    name,
    email,
    role,
    created_at,
    company_id,
    invite_token,
    companies ( name ),
    self_assessments (
      id,
      created_at,
      leader_type
    )
  `);
console.log('Fetched users:', data);

  if (!error) setUsers(data || []);
  else console.error('Error loading users:', error.message);
};

  const fetchCompanies = async () => {
    const { data, error } = await supabase.from('companies').select('*');
    if (!error) setCompanies(data || []);
  };

  useEffect(() => {
    fetchUsers();
    fetchCompanies();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name || !companyId) return;

    try {
      const res = await fetch('/api/invite-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, role, company_id: companyId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to invite user');
      }

      setEmail('');
      setName('');
      setRole('user');
      setCompanyId('');
      fetchUsers();
    } catch (err) {
      console.error('Error adding user:', err);
    }
  };

  const generateInviteLink = async (userId: string) => {
    const token = crypto.randomUUID();
    const { error } = await supabase
      .from('users')
      .update({ invite_token: token })
      .eq('id', userId);

    if (!error) {
      alert(`Invite link: ${window.location.origin}/assessments/self/invite?token=${token}`);
      fetchUsers(); // Refresh users list if needed
    } else {
      console.error('Failed to generate token:', error.message);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (!error) fetchUsers();
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Manage Users</h1>

      <form onSubmit={handleAddUser} className="space-y-4 mb-8">
        <input
          type="email"
          placeholder="User Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as any)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="superadmin">Superadmin</option>
        </select>
        <select
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Select Company</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded">
          Add User
        </button>
      </form>

      <table className="w-full table-auto border-collapse text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2 text-left">Name</th>
            <th className="border px-4 py-2 text-left">Email</th>
            <th className="border px-4 py-2 text-left">Role</th>
            <th className="border px-4 py-2 text-left">Company</th>
            <th className="border px-4 py-2 text-left">Actions</th>
            <th className="border px-4 py-2 text-left">Self-Assessment</th>
            <th className="border px-4 py-2 text-left">Results</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="border px-4 py-2">{user.name}</td>
              <td className="border px-4 py-2">{user.email}</td>
              <td className="border px-4 py-2 capitalize">{user.role}</td>
              <td className="border px-4 py-2">
                {(user as any).companies?.name || '—'}
              </td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Delete
                </button>
              </td>
              <td className="px-4 py-2 border text-sm">
                {user.invite_token ? (
                  <a
                    href={`${process.env.NEXT_PUBLIC_BASE_URL}/assessments/self/invite?token=${user.invite_token}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:underline"
                  >
                    View Link
                  </a>
                ) : (
                  <span className="text-gray-400">No link</span>
                )}
              </td>
              <td className="px-4 py-2 border text-sm">
                {(user as any).self_assessments && (user as any).self_assessments.length > 0 ? (
                  (() => {
                    const sorted = [...(user as any).self_assessments]
                      .filter((a) => a.leader_type) // Ensure it has a leader_type
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

                    const latest = sorted[0];

                    return latest ? (
                      <div>
                        <span className="font-medium text-teal-700">{latest.leader_type}</span><br />
                        <span className="text-xs text-gray-500">
                          {new Date(latest.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">Not Started</span>
                    );
                  })()
                ) : (
                  <span className="text-gray-400">Not Started</span>
                )}
              </td>

            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}
