interface OrderPageProps {
  params: Promise<{ id: string }>;
}

const STAGES = ["ТЗ", "Эскиз", "Производство", "Финал"];

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
      <h1
        className="text-3xl font-bold text-[#2D2D2D] mb-1"
        style={{ fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)" }}
      >
        Заказ #{id}
      </h1>
      <p className="text-sm text-[#6B6560] mb-8">Трекер этапов</p>

      {/* Stages tracker */}
      <div className="flex items-center gap-0 mb-10 overflow-x-auto pb-2">
        {STAGES.map((stage, i) => (
          <div key={stage} className="flex items-center gap-0 shrink-0">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                  i === 0
                    ? "bg-[#E8855A] border-[#E8855A] text-white"
                    : "bg-[#FAF8F5] border-[#E5E0D8] text-[#6B6560]"
                }`}
              >
                {i + 1}
              </div>
              <span className="text-xs text-[#6B6560]">{stage}</span>
            </div>
            {i < STAGES.length - 1 && (
              <div className="w-12 h-px bg-[#E5E0D8] mx-1 mb-4" />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="bg-[#F0EDE8] rounded-xl p-6 border border-[#E5E0D8] text-center text-sm text-[#6B6560]">
            — Загруженные файлы этапа —<br />Слой 3: Storage
          </div>
          <div className="flex gap-3">
            <button
              disabled
              className="flex-1 rounded-lg py-2.5 text-sm font-semibold bg-[#E8855A] text-white opacity-50"
            >
              Принять этап
            </button>
            <button
              disabled
              className="flex-1 rounded-lg py-2.5 text-sm font-semibold border border-[#E5E0D8] text-[#6B6560] opacity-50"
            >
              Запросить доработку
            </button>
          </div>
        </div>
        <div className="bg-[#F0EDE8] rounded-xl p-6 border border-[#E5E0D8] min-h-[200px] text-center text-sm text-[#6B6560] flex items-center justify-center">
          — Чат мастер ↔ заказчик —<br />Слой 3: Supabase Realtime
        </div>
      </div>
    </div>
  );
}
