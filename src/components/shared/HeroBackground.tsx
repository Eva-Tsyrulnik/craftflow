import { cn } from "@/lib/utils";

/** Hi-res WebP (см. npm run hero:assets) */
export const HERO_BG = {
  alt: "",
  sources: [
    { media: "(min-width: 1536px)", src: "/hero/hero-bg-2560.webp" },
    { media: "(min-width: 1024px)", src: "/hero/hero-bg-1920.webp" },
    { media: "(min-width: 640px)", src: "/hero/hero-bg-1280.webp" },
  ],
  fallback: "/hero/hero-bg-768.webp",
} as const;

type HeroBackgroundProps = {
  className?: string;
  overlayClassName?: string;
  priority?: boolean;
};

export function HeroBackground({
  className,
  overlayClassName = "bg-background/20",
  priority = false,
}: HeroBackgroundProps) {
  return (
    <>
      <picture
        className={cn("absolute inset-0 block h-full w-full", className)}
        aria-hidden
      >
        {HERO_BG.sources.map((source) => (
          <source
            key={source.src}
            media={source.media}
            srcSet={source.src}
            type="image/webp"
          />
        ))}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_BG.fallback}
          alt={HERO_BG.alt}
          fetchPriority={priority ? "high" : "auto"}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-cover object-center"
        />
      </picture>
      <div
        className={cn("pointer-events-none absolute inset-0", overlayClassName)}
        aria-hidden
      />
    </>
  );
}
