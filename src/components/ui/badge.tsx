import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center font-extrabold uppercase tracking-[0.04em] rounded-pill",
  {
    variants: {
      variant: {
        novo:     "bg-primary text-white text-[11px] px-3 py-1",
        promocao: "bg-accent text-brown-dark text-[11px] px-3 py-1",
        atacado:  "bg-info text-white text-[11px] px-3 py-1",
        esgotado: "bg-bg-nude text-brown-light text-[11px] px-3 py-1",
        teal:     "bg-secondary text-white text-[11px] px-3 py-1 shadow-[0_4px_18px_rgba(78,201,192,0.35)]",
        yellow:   "bg-accent text-brown-dark text-[13px] px-4 py-[5px]",
      },
      size: {
        sm: "text-[10px] px-2 py-0.5",
        md: "text-[11px] px-3 py-1",
        lg: "text-[13px] px-4 py-[5px]",
      },
    },
    defaultVariants: {
      variant: "novo",
      size: "md",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
