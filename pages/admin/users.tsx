//pages/admin/users.tsx
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import ResultModal from '@/components/ResultModal';
import { useRoleCheck } from '@/hooks/useRoleCheck';

type ResultData = {
  name: string;
  company: string;
  leaderType: string;
  scores: Record<string, number>;
};

type Company = {
  id: string;
  name: string;
};

type Role = {
  id: string;
  name: string;
};

type User = {
  id: string;
  email: string;
  name: string;
  role_id: string;
  company_id: string;
  created_at: string;
  invite_token?: string;
};

export default function AdminUsers() {
  const [roles, setRoles] = useState<Role[]>([]); 
  const [selectedResult, setSelectedResult] = useState<ResultData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [roleId, setRoleId] = useState('');
  const router = useRouter();


const fetchUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select(`
      id,
      name,
      email,
      role_id,
      created_at,
      company_id,
      invite_token,
      companies ( name ),
      roles ( name ),
      self_assessments (
        id,
        created_at,
        leader_type
      )
    `);


  if (!error) setUsers(data || []);
  else console.error('Error loading users:', error.message);
};

const fetchRoles = async () => {
  const { data, error } = await supabase.from('roles').select('id, name');
  if (!error) setRoles(data || []);
};


  const fetchCompanies = async () => {
    const { data, error } = await supabase.from('companies').select('*');
    if (!error) setCompanies(data || []);
  };

  const { loading: roleLoading, hasAccess } = useRoleCheck(['admin', 'superadmin']);

  useEffect(() => {
    if (hasAccess) {
      fetchUsers();
      fetchCompanies();
      fetchRoles();
    }
  }, [hasAccess]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name || !companyId) return;

    try {
      const res = await fetch('/api/invite-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, role_id: roleId, company_id: companyId,password: 'Test1234!'}),

      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to invite user');
      }

      setEmail('');
      setName('');
      setRoleId('');
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

  const handleRoleChange = async (userId: string, newRoleId: string) => {
    const { error } = await supabase
      .from('users')
      .update({ role_id: newRoleId })
      .eq('id', userId);

    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, role_id: newRoleId } : u));
    } else {
      console.error('Failed to update role:', error.message);
    }
  };

  if (roleLoading) return <p>Loading permissions...</p>;
  if (!hasAccess) return null;

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
        <select
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Select Role</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
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
              <td className="border px-4 py-2">{(user as any).roles?.name || '—'}</td>
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
                  <div className="space-y-1">
                    {(user as any).self_assessments.map((a: any) => (
                      <div key={a.id}>
                      <Link
                        href={`/admin/results/${a.id}`}
                        className="text-teal-600 hover:underline"
                      >
                        {a.leader_type}
                      </Link>


                        <div className="text-xs text-gray-500">
                          {new Date(a.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400">Not Started</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
            <ResultModal
              result={selectedResult}
              show={showModal}
              onClose={() => setShowModal(false)}
            />

    </div>
  );
}
