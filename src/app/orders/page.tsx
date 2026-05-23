export default function OrdersPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <h1
        className="text-3xl font-bold text-[#2D2D2D] mb-2"
        style={{ fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)" }}
      >
        Мои заказы
      </h1>
      <p className="text-[#6B6560] mb-8">Активные и завершённые заказы</p>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-[#F0EDE8] rounded-xl p-5 border border-[#E5E0D8] flex items-center justify-between animate-pulse"
          >
            <div className="space-y-2">
              <div className="h-4 bg-[#E5E0D8] rounded w-48" />
              <div className="h-3 bg-[#E5E0D8] rounded w-32" />
            </div>
            <div className="h-6 w-20 bg-[#E5E0D8] rounded-full" />
          </div>
        ))}
      </div>
      <p className="text-center text-sm text-[#6B6560] mt-8">
        — Слой 2: Supabase Auth + orders query —
      </p>
    </div>
  );
}
