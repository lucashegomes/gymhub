export interface ApiClient {
  request: (input: string, init?: RequestInit) => Promise<unknown>;
}
