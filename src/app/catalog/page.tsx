export default function CatalogPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1
        className="text-4xl font-bold text-[#2D2D2D] mb-2"
        style={{ fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)" }}
      >
        Каталог мастеров
      </h1>
      <p className="text-[#6B6560] mb-8">
        Найдите мастера по категории, цене и рейтингу
      </p>

      {/* Filters placeholder */}
      <div className="flex flex-wrap gap-3 mb-8">
        {["Все", "Арт", "Шитьё", "Мерч", "Скульптура"].map((cat) => (
          <button
            key={cat}
            className="rounded-full px-4 py-1.5 text-sm border border-[#E5E0D8] text-[#6B6560] hover:bg-[#F0EDE8] transition-colors"
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Masters grid placeholder */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-[#F0EDE8] rounded-xl p-6 border border-[#E5E0D8] animate-pulse"
          >
            <div className="w-14 h-14 rounded-full bg-[#E5E0D8] mb-4" />
            <div className="h-4 bg-[#E5E0D8] rounded w-2/3 mb-2" />
            <div className="h-3 bg-[#E5E0D8] rounded w-1/2" />
          </div>
        ))}
      </div>
      <p className="text-center text-sm text-[#6B6560] mt-8">
        — Слой 2: подключение Supabase —
      </p>
    </div>
  );
}
