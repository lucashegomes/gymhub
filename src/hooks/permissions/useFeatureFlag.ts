import { useAuth } from "@/contexts/AuthContext";

export function useFeatureFlag(flag: string) {
  const { featureFlags } = useAuth();
  return featureFlags.includes(flag);
}
