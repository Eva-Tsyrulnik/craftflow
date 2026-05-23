import Link from "next/link";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1
          className="text-5xl sm:text-6xl font-bold text-[#2D2D2D] mb-6 leading-tight"
          style={{ fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)" }}
        >
          Кастомные работы<br />
          <span className="text-[#E8855A]">от проверенных мастеров</span>
        </h1>
        <p className="text-lg text-[#6B6560] max-w-2xl mx-auto mb-10">
          Найдите мастера, оплатите безопасно через escrow и следите за
          прогрессом по этапам. Деньги переходят мастеру только после вашего одобрения.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/catalog"
            className="rounded-lg px-8 py-3 text-base font-semibold bg-[#E8855A] text-white hover:bg-[#D9714A] transition-colors"
          >
            Найти мастера
          </Link>
          <Link
            href="/onboarding"
            className="rounded-lg px-8 py-3 text-base font-semibold border border-[#E5E0D8] text-[#2D2D2D] hover:bg-[#F0EDE8] transition-colors"
          >
            Стать мастером
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#F0EDE8] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            className="text-3xl font-bold text-center text-[#2D2D2D] mb-12"
            style={{ fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)" }}
          >
            Как это работает
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Найди мастера",
                desc: "Каталог проверенных мастеров с портфолио, рейтингом и ценами. Фильтры по категории и бюджету.",
              },
              {
                step: "2",
                title: "Оформи заказ",
                desc: "Опиши ТЗ, прикрепи референсы, согласуй этапы. Оплати через escrow — деньги заморожены до вашего одобрения.",
              },
              {
                step: "3",
                title: "Одобри результат",
                desc: "Следи за прогрессом по этапам, общайся в чате. Деньги мастеру — только когда ты доволен.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-[#FAF8F5] rounded-xl p-6 border border-[#E5E0D8]"
              >
                <div className="w-10 h-10 rounded-full bg-[#E8855A] text-white flex items-center justify-center font-bold text-lg mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-[#2D2D2D] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-[#6B6560] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA bottom */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-sm text-[#6B6560] uppercase tracking-widest mb-3">
          Для мастеров
        </p>
        <h2
          className="text-3xl font-bold text-[#2D2D2D] mb-4"
          style={{ fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)" }}
        >
          Стабильный поток заказов с гарантией оплаты
        </h2>
        <p className="text-[#6B6560] mb-8">
          Комиссия 10% — вдвое ниже Kwork. Все заказы в одном месте. Без переводов без страховки.
        </p>
        <Link
          href="/onboarding"
          className="inline-block rounded-lg px-8 py-3 text-base font-semibold bg-[#2D2D2D] text-white hover:bg-[#1A1A1A] transition-colors"
        >
          Создать профиль мастера
        </Link>
      </section>
    </>
  );
}
