import * as React from "react"
import { cn } from "~/lib/utils"

type SectionProps = React.PropsWithChildren<{
  variant?: "default" | "muted"
  className?: string
  id?: string
}>

export function Section({ children, variant = "default", className, id }: SectionProps) {
  // default: transparent
  // muted: slightly darker background to separate visually
  const base = "w-full"
  // tightened spacing so sections sit closer together while keeping readable rhythm
  const padding = "py-8 sm:py-12 lg:py-16"

  const variantCls =
    variant === "muted"
      ? "bg-[rgba(255,255,255,0.02)] border-t border-b border-white/5"
      : "bg-transparent border-t border-white/3/0"

  return (
    <section
      id={id}
      className={cn(
        base,
        padding,
        "transition-colors duration-300 ease-in-out",
        variantCls,
        className
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  )
}

export default Section
