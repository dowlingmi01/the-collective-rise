import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useRoleCheck } from '@/hooks/useRoleCheck';

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const { hasAccess, loading } = useRoleCheck(['admin', 'superadmin']);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setLoggedIn(!!session?.user);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) router.push('/login');
    else console.error('Logout error:', error.message);
  };

  return (
    <nav className="w-full bg-gray-100 px-6 py-4 shadow flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <Link href="/">
          <Image
            src="/images/TCRlogo RGB_full color dark.png"
            alt="The Collective Rise logo"
            width={100}
            height={100}
            className="rounded"
            priority
          />
        </Link>
      </div>

      <div className="space-x-4 text-sm">
        <Link href="/" className="text-gray-800 hover:text-blue-600">Home</Link>
        <Link href="/assessment" className="text-gray-800 hover:text-blue-600">Assessment</Link>
        <Link href="/admin/nominations" className="text-gray-800 hover:text-blue-600">3rd Party Assessments</Link>
        <Link href="/admin/self-assessments" className="text-gray-800 hover:text-blue-600">Self Assessments</Link>
        
        {!loading && hasAccess && (
          <Link href="/admin/dashboard" className="text-gray-800 hover:text-blue-600">
            Admin
          </Link>
        )}

        {loggedIn ? (
          <button onClick={handleLogout} className="text-red-600 hover:underline">Logout</button>
        ) : (
          <Link href="/login" className="text-blue-600 hover:underline">Login</Link>
        )}
      </div>
    </nav>
  );
}
