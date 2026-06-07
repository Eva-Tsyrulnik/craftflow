export {};

declare global {
  interface Window {
    __CF_SUPABASE__?: {
      u: string;
      k: string;
    };
  }
}
