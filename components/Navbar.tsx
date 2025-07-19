import Image from 'next/image'; // Make sure this is at the top of your file
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoggedIn(!!session?.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

    const handleLogout = async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error.message);
      } else {
        router.push('/login');
      }
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
          className="rounded" // optional: make circular or square
        />
      </Link>
{/*      <Link href="/" className="text-xl font-semibold text-blue-700 hover:text-blue-800">
        The Collective Rise
      </Link>
*/}    </div>

    <div className="space-x-4 text-sm">
      <Link href="/" className="text-gray-800 hover:text-blue-600">Home</Link>
      <Link href="/assessment" className="text-gray-800 hover:text-blue-600">Assessment</Link>
      <Link href="/admin/nominations" className="text-gray-800 hover:text-blue-600">Nominations</Link>
      {loggedIn ? (
        <button onClick={handleLogout} className="text-red-600 hover:underline">Logout</button>
      ) : (
        <Link href="/login" className="text-blue-600 hover:underline">Login</Link>
      )}
    </div>
  </nav>
);
}
