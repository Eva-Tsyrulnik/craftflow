import Image from "next/image";
import Link from "next/link";
import { HeroBackground } from "@/components/shared/HeroBackground";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/** Демо-портфолио (локальные файлы в public/showcase) */
const WORK_SAMPLES = [
  { src: "/showcase/sewing.jpg", alt: "Вышивка и шитьё на заказ", label: "Шитьё" },
  { src: "/showcase/art.jpg", alt: "Картина маслом по эскизу", label: "Арт" },
  { src: "/showcase/merch.jpg", alt: "Кастомный мерч и принты", label: "Мерч" },
  { src: "/showcase/sculpture.jpg", alt: "Керамика ручной работы", label: "Скульптура" },
] as const;

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
    avatar: "/testimonials/marina.jpg",
    initials: "М",
  },
  {
    quote: "Три заказа за месяц без срывов оплаты — для меня это прорыв.",
    author: "Алексей, мерч-мейкер",
    avatar: "/testimonials/alexey.jpg",
    initials: "А",
  },
] as const;

export function LandingPage() {
  return (
    <>
      <section className="relative min-h-[min(520px,75vh)] overflow-hidden bg-background">
        <HeroBackground priority />
        <div className="relative z-10 mx-auto flex max-w-7xl justify-center px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="w-full max-w-3xl rounded-2xl border border-border/60 bg-background/82 px-6 py-10 text-center shadow-sm backdrop-blur-md sm:px-10 sm:py-12">
            <h1 className="font-display text-5xl font-bold leading-tight text-primary sm:text-6xl">
              Кастомные работы
              <br />
              <span className="text-accent">с гарантией</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg font-medium text-foreground">
              Маркетплейс творческих услуг: мастера и заказчики, escrow и поэтапный
              workflow от ТЗ до приёмки.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row sm:gap-3">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/catalog">Найти мастера</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/signup">Стать мастером</Link>
              </Button>
            </div>
          </div>
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

      <section className="relative overflow-hidden py-16">
        <HeroBackground overlayClassName="bg-background/60" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center font-display text-2xl font-bold text-primary">
            Отзывы
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {TESTIMONIALS.map((t) => (
              <Card key={t.author} className="border-border/80 bg-background/90 shadow-sm backdrop-blur-sm">
              <CardContent className="pt-6">
                <p className="text-foreground">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-4 flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarImage src={t.avatar} alt={t.author} />
                    <AvatarFallback className="bg-accent/20 text-sm font-medium text-primary">
                      {t.initials}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm text-muted-foreground">{t.author}</p>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 text-center sm:px-6 lg:px-8">
        <p className="text-sm uppercase tracking-widest text-muted-foreground">
          Примеры работ
        </p>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {WORK_SAMPLES.map((sample) => (
            <div
              key={sample.src}
              className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-card"
            >
              <Image
                src={sample.src}
                alt={sample.alt}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary/80 to-transparent px-2 py-2 text-xs font-medium text-white">
                {sample.label}
              </span>
            </div>
          ))}
        </div>
        <Button asChild className="mt-10 bg-accent text-accent-foreground hover:bg-accent/90">
          <Link href="/catalog">Смотреть каталог</Link>
        </Button>
      </section>
    </>
  );
}
