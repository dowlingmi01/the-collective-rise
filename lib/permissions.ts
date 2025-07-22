type Role = 'user' | 'admin' | 'superadmin';

export const hasRole = (userRole: string | null, allowedRoles: Role[]): boolean => {
  return allowedRoles.includes(userRole as Role);
};
