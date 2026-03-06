import type { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface PermissionGuardProps {
  resource: string;
  action: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGuard({ resource, action, children, fallback = null }: PermissionGuardProps) {
  const { hasPermission } = useAuth();

  if (!hasPermission(resource, action)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
