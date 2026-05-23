export default function OnboardingPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1
        className="text-4xl font-bold text-[#2D2D2D] mb-2"
        style={{ fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)" }}
      >
        Стать мастером
      </h1>
      <p className="text-[#6B6560] mb-8">
        Заполните профиль, чтобы начать получать заказы
      </p>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-10">
        {["Категории", "Портфолио", "Условия", "Цены"].map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-[#E8855A] text-white">
                {i + 1}
              </div>
              <span className="text-xs text-[#6B6560] hidden sm:inline">{step}</span>
            </div>
            {i < 3 && <div className="w-6 h-px bg-[#E5E0D8]" />}
          </div>
        ))}
      </div>

      <div className="bg-[#F0EDE8] rounded-xl p-8 border border-[#E5E0D8] text-center text-sm text-[#6B6560]">
        — Онбординг мастера (пошаговая форма) —<br />
        Слой 3: форма + Supabase Storage
      </div>
    </div>
  );
}
