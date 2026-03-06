import { useAuth } from "@/contexts/AuthContext";

export function usePermission(resource: string, action: string) {
  const { hasPermission } = useAuth();
  return hasPermission(resource, action);
}
