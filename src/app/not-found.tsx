import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center sm:py-32">
      <p className="font-display text-7xl font-bold text-accent sm:text-8xl">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-primary sm:text-3xl">
        Страница не найдена
      </h1>
      <p className="mt-3 text-muted-foreground">
        Такого маршрута нет. Проверьте адрес или вернитесь на главную.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Link href="/">На главную</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/catalog">Каталог мастеров</Link>
        </Button>
      </div>
    </div>
  );
}
