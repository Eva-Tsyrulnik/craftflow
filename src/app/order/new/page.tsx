export default function NewOrderPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1
        className="text-3xl font-bold text-[#2D2D2D] mb-2"
        style={{ fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)" }}
      >
        Оформить заказ
      </h1>
      <p className="text-[#6B6560] mb-8">
        Опишите задание — мастер получит ТЗ сразу после оплаты
      </p>
      <div className="space-y-4">
        {["Описание задания (ТЗ)", "Файлы-референсы", "Срок выполнения", "Бюджет (₽)", "Этапы работы"].map((field) => (
          <div key={field} className="bg-[#F0EDE8] rounded-lg p-4 border border-[#E5E0D8]">
            <p className="text-xs text-[#6B6560] font-medium mb-1">{field}</p>
            <div className="h-8 bg-[#E5E0D8] rounded animate-pulse" />
          </div>
        ))}
        <div className="bg-[#F0EDE8] rounded-xl p-6 border border-[#E5E0D8] text-center text-sm text-[#6B6560]">
          — Оплата через ЮKassa (escrow) —<br />Слой 4: ЮKassa integration
        </div>
        <button
          disabled
          className="w-full rounded-lg py-3 font-semibold bg-[#E8855A] text-white opacity-50 cursor-not-allowed"
        >
          Оплатить (escrow)
        </button>
      </div>
    </div>
  );
}
