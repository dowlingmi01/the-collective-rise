import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function usePermissions() {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role_id')
      .eq('id', session.user.id)
      .single();

    if (userData?.role_id) {
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('name, permissions')
        .eq('id', userData.role_id)
        .single();

      if (roleData?.permissions) {
        setPermissions(roleData.permissions);
      }
    }

      setLoading(false);
    };

    fetchPermissions();
  }, []);


  const hasPermission = (perm: string) => {
    return permissions.includes(perm) || permissions.includes('*');
  };

  return { permissions, hasPermission, loading };
}
