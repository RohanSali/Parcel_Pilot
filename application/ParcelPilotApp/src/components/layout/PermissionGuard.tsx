import React, { PropsWithChildren } from 'react';
import { usePermissionStore } from '../../store/permissionStore';

interface PermissionGuardProps extends PropsWithChildren {
  requiredPermission: string;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  requiredPermission, 
  fallback = null, 
  children 
}) => {
  const hasPermission = usePermissionStore((state) => state.hasPermission(requiredPermission));
  
  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
