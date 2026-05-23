export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1
        className="text-3xl font-bold text-[#2D2D2D] mb-2"
        style={{ fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)" }}
      >
        Профиль и настройки
      </h1>
      <p className="text-[#6B6560] mb-8">
        Данные аккаунта, способы оплаты, уведомления
      </p>
      <div className="space-y-4">
        {["Имя и фото", "Email / Telegram", "Реквизиты мастера", "Уведомления"].map((section) => (
          <div
            key={section}
            className="bg-[#F0EDE8] rounded-xl p-5 border border-[#E5E0D8] flex items-center justify-between"
          >
            <span className="text-sm font-medium text-[#2D2D2D]">{section}</span>
            <span className="text-xs text-[#6B6560]">Слой 2 →</span>
          </div>
        ))}
      </div>
    </div>
  );
}
