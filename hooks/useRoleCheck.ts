// hooks/useRoleCheck.ts
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { hasRole } from '@/lib/permissions';

export function useRoleCheck(allowedRoles: string[]) {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🧠 Session:', session);

      if (!session) {
        router.push('/login');
        return;
      }

    const { data: userDetails } = await supabase
      .from('users')
      .select('roles(name)')
      .eq('id', session.user.id)
      .single();

      if (hasRole(userDetails?.roles?.name, allowedRoles)) {
        setHasAccess(true);
      } else {
        router.push('/dashboard');
      }

      setLoading(false);
    };

    checkRole();
  }, [allowedRoles, router]);

  return { loading, hasAccess };
}
