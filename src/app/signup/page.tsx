export default function SignupPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <h1
        className="text-3xl font-bold text-[#2D2D2D] mb-2 text-center"
        style={{ fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)" }}
      >
        Регистрация
      </h1>
      <p className="text-center text-[#6B6560] mb-8">Создайте аккаунт CraftFlow</p>
      <div className="bg-[#F0EDE8] rounded-xl p-6 border border-[#E5E0D8] text-center text-sm text-[#6B6560]">
        — Форма регистрации (email / Google OAuth / Telegram) —<br />
        Слой 2: Supabase Auth
      </div>
    </div>
  );
}
