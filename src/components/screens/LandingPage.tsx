import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const STEPS = [
  {
    step: "1",
    title: "Найди мастера",
    desc: "Каталог с портфолио, рейтингом и ценами. Фильтры по категории и бюджету.",
  },
  {
    step: "2",
    title: "Оформи заказ",
    desc: "ТЗ, референсы, этапы. Оплата через escrow — деньги заморожены до вашего одобрения.",
  },
  {
    step: "3",
    title: "Одобри результат",
    desc: "Трекер этапов и чат. Мастер получает оплату только когда вы довольны.",
  },
];

const TESTIMONIALS = [
  {
    quote: "Наконец не боюсь переводить аванс незнакомому мастеру.",
    author: "Марина, заказчик",
  },
  {
    quote: "Три заказа за месяц без срывов оплаты — для меня это прорыв.",
    author: "Алексей, мерч-мейкер",
  },
];

export function LandingPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="font-display text-5xl font-bold leading-tight text-primary sm:text-6xl">
          Кастомные работы
          <br />
          <span className="text-accent">с гарантией</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Маркетплейс творческих услуг: мастера и заказчики, escrow и поэтапный
          workflow от ТЗ до приёмки.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/catalog">Найти мастера</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/signup">Стать мастером</Link>
          </Button>
        </div>
      </section>

      <section className="bg-card py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center font-display text-3xl font-bold text-primary">
            Как это работает
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {STEPS.map((item) => (
              <Card key={item.step} className="border-border bg-background">
                <CardContent className="pt-6">
                  <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-primary">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center font-display text-2xl font-bold text-primary">
          Отзывы
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {TESTIMONIALS.map((t) => (
            <Card key={t.author}>
              <CardContent className="pt-6">
                <p className="text-foreground">&ldquo;{t.quote}&rdquo;</p>
                <p className="mt-3 text-sm text-muted-foreground">{t.author}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 text-center sm:px-6 lg:px-8">
        <p className="text-sm uppercase tracking-widest text-muted-foreground">
          Примеры работ
        </p>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="aspect-square rounded-xl bg-card border border-border"
            />
          ))}
        </div>
        <Button asChild className="mt-10 bg-accent text-accent-foreground hover:bg-accent/90">
          <Link href="/catalog">Смотреть каталог</Link>
        </Button>
      </section>
    </>
  );
}
