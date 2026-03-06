export const mockDelay = (ms = 300) =>
  new Promise(resolve => setTimeout(resolve, ms))
