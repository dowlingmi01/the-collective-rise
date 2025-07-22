import { useEffect, useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type Stat = {
  label: string;
  count: number;
  href: string;
};

export default function AdminDashboard() {
  const { hasPermission, loading } = usePermissions();
  const router = useRouter();
  const [stats, setStats] = useState<Stat[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && !hasPermission('manage_users')) {
      if (router.pathname === '/admin/dashboard') {
        router.push('/dashboard');
      } else {
        router.push('/admin/dashboard');
      }
    }
  }, [loading, hasPermission, router]);

  useEffect(() => {
    const fetchStats = async () => {
      const [companies, users, prompts, promptResponses] = await Promise.all([
        supabase.from('companies').select('id', { count: 'exact', head: true }),
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('prompts').select('id', { count: 'exact', head: true }),
        supabase.from('prompt_responses').select('id', { count: 'exact', head: true }),
      ]);

      setStats([
        { label: 'Companies', count: companies.count || 0, href: '/admin/companies' },
        { label: 'Users', count: users.count || 0, href: '/admin/users' },
        { label: 'Prompts', count: prompts.count || 0, href: '/admin/prompts' },
        { label: 'Prompt Responses', count: promptResponses.count || 0, href: '/admin/responses' },
      ]);
      setLoadingStats(false);
    };

    if (!loading && hasPermission('manage_users')) {
      fetchStats();
    }
  }, [loading, hasPermission]);

  if (loading || loadingStats) return <p>Loading admin panel...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className="border rounded-lg p-4 shadow hover:bg-gray-50 transition">
              <h2 className="text-lg font-semibold">{stat.label}</h2>
              <p className="text-2xl font-bold text-teal-600">{stat.count}</p>
              <p className="text-sm text-gray-500 mt-1">View details</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
