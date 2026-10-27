import type { CSSProperties, ReactNode } from "react"
import { cn } from "@/lib/utils"

/** Five-pointed star, echoing the star in the Wensstichting Drenthe logo. */
export function StarShape({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("pointer-events-none", className)} style={style}>
      <path
        fill="currentColor"
        d="M12 1.8l2.9 6.4 7 .7-5.3 4.7 1.5 6.9L12 17l-6.1 3.5 1.5-6.9L2.1 8.9l7-.7z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  center = true,
  id,
}: {
  eyebrow?: string
  title: ReactNode
  intro?: ReactNode
  center?: boolean
  id?: string
}) {
  return (
    <div className={cn("max-w-2xl mb-10 md:mb-14", center && "mx-auto text-center")}>
      {eyebrow && (
        <p className="mb-3 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary">
          <StarShape className="size-4 text-brand-yellow" />
          {eyebrow}
        </p>
      )}
      <h2 id={id} className="text-3xl md:text-4xl lg:text-5xl font-bold text-balance">
        {title}
      </h2>
      {intro && <p className="mt-4 text-lg text-muted-foreground text-pretty">{intro}</p>}
    </div>
  )
}

/** Hero banner used at the top of every sub page. */
export function PageHero({ eyebrow, title, intro }: { eyebrow?: string; title: ReactNode; intro?: ReactNode }) {
  return (
    <section className="relative overflow-hidden -mt-16 md:-mt-20 pt-16 md:pt-20">
      <div className="absolute inset-0 bg-mesh" aria-hidden />
      <StarShape className="absolute top-24 left-[8%] size-6 text-brand-yellow animate-twinkle hidden sm:block" />
      <StarShape
        className="absolute top-36 right-[10%] size-4 text-brand-blue animate-twinkle hidden sm:block"
        style={{ animationDelay: "1s" }}
      />
      <div className="relative container mx-auto px-4 py-14 md:py-20 text-center">
        <div className="max-w-3xl mx-auto">
          {eyebrow && (
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-card/80 border border-border px-4 py-1.5 text-sm font-bold text-primary">
              <StarShape className="size-4 text-brand-yellow" />
              {eyebrow}
            </p>
          )}
          <h1 className="text-4xl md:text-6xl font-bold text-balance">{title}</h1>
          {intro && <p className="mt-5 text-lg md:text-xl text-muted-foreground text-pretty">{intro}</p>}
        </div>
      </div>
    </section>
  )
}
