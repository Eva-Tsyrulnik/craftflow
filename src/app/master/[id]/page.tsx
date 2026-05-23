interface MasterPageProps {
  params: Promise<{ id: string }>;
}

export default async function MasterPage({ params }: MasterPageProps) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-start gap-6 mb-8">
        <div className="w-20 h-20 rounded-full bg-[#E5E0D8] shrink-0" />
        <div>
          <h1
            className="text-3xl font-bold text-[#2D2D2D] mb-1"
            style={{ fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)" }}
          >
            Профиль мастера
          </h1>
          <p className="text-sm text-[#6B6560]">ID: {id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#F0EDE8] rounded-xl p-6 border border-[#E5E0D8] text-center text-sm text-[#6B6560]">
            — Портфолио (галерея) —<br />Слой 3: Supabase Storage
          </div>
          <div className="bg-[#F0EDE8] rounded-xl p-6 border border-[#E5E0D8] text-center text-sm text-[#6B6560]">
            — Отзывы и рейтинг —<br />Слой 3: reviews table
          </div>
        </div>
        <aside className="space-y-4">
          <div className="bg-[#F0EDE8] rounded-xl p-6 border border-[#E5E0D8] text-center text-sm text-[#6B6560]">
            — Условия и цены —
          </div>
          <a
            href={`/order/new?master=${id}`}
            className="block w-full text-center rounded-lg px-4 py-3 font-semibold bg-[#E8855A] text-white hover:bg-[#D9714A] transition-colors"
          >
            Оформить заказ
          </a>
        </aside>
      </div>
    </div>
  );
}
