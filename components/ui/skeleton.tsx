import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted", // Removed animate-pulse, added relative and overflow-hidden
        // Shimmer pseudo-element styles
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-muted-foreground/10 before:to-transparent",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
