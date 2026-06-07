/** Инжект runtime env с сервера Vercel (не зависит от build-time NEXT_PUBLIC_*). */
export function SupabaseRuntimeScript({
  url,
  anonKey,
}: {
  url: string;
  anonKey: string;
}) {
  const payload = JSON.stringify({ u: url, k: anonKey });

  return (
    <script
      id="cf-supabase-env"
      dangerouslySetInnerHTML={{
        __html: `window.__CF_SUPABASE__=${payload};`,
      }}
    />
  );
}
