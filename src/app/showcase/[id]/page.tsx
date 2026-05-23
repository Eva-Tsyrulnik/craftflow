interface ShowcasePageProps {
  params: Promise<{ id: string }>;
}

export default async function ShowcasePage({ params }: ShowcasePageProps) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1
        className="text-4xl font-bold text-[#2D2D2D] mb-4"
        style={{ fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)" }}
      >
        Завершённая работа
      </h1>
      <p className="text-sm text-[#6B6560] mb-8">Заказ #{id}</p>

      <div className="bg-[#F0EDE8] rounded-2xl aspect-video flex items-center justify-center border border-[#E5E0D8] mb-8">
        <span className="text-sm text-[#6B6560]">Фото работы (Слой 3: Storage)</span>
      </div>

      <a
        href={`/catalog`}
        className="inline-block rounded-lg px-8 py-3 font-semibold bg-[#E8855A] text-white hover:bg-[#D9714A] transition-colors"
      >
        Заказать такое же у этого мастера
      </a>
    </div>
  );
}
