export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
      <h1
        className="text-3xl font-bold text-[#2D2D2D] mb-2"
        style={{ fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)" }}
      >
        Дашборд мастера
      </h1>
      <p className="text-[#6B6560] mb-8">Заявки, заказы и статистика дохода</p>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {["Новые заявки", "В работе", "Завершено", "Доход (₽)"].map((stat) => (
          <div
            key={stat}
            className="bg-[#F0EDE8] rounded-xl p-4 border border-[#E5E0D8] text-center"
          >
            <div className="h-7 bg-[#E5E0D8] rounded w-1/2 mx-auto mb-2 animate-pulse" />
            <p className="text-xs text-[#6B6560]">{stat}</p>
          </div>
        ))}
      </div>

      {/* Active orders */}
      <h2 className="text-lg font-semibold text-[#2D2D2D] mb-4">Активные заказы</h2>
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="bg-[#F0EDE8] rounded-xl p-5 border border-[#E5E0D8] animate-pulse"
          >
            <div className="h-4 bg-[#E5E0D8] rounded w-64 mb-2" />
            <div className="h-3 bg-[#E5E0D8] rounded w-40" />
          </div>
        ))}
      </div>
      <p className="text-center text-sm text-[#6B6560] mt-8">
        — Слой 2: Supabase Auth + masters/orders query —
      </p>
    </div>
  );
}
