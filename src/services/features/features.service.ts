export const featuresService = {
  has(featureFlags: string[], key: string) {
    return featureFlags.includes(key);
  },
};
