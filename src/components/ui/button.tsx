import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"
import { Slot } from "@radix-ui/react-slot"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-black rounded-pill transition-all duration-150 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-white shadow-[0_4px_18px_rgba(255,107,74,0.30)] hover:bg-primary-hover active:scale-[0.97]",
        secondary:
          "bg-transparent text-primary border-[2.5px] border-primary hover:bg-bg-blush active:scale-[0.97]",
        teal:
          "bg-secondary text-white shadow-[0_4px_18px_rgba(78,201,192,0.35)] hover:opacity-90 active:scale-[0.97]",
        ghost:
          "bg-bg-blush text-brown-mid hover:bg-bg-nude active:scale-[0.97]",
        danger:
          "bg-red-500 text-white hover:bg-red-600 active:scale-[0.97]",
      },
      size: {
        sm:  "text-sm px-4 py-2",
        md:  "text-base px-6 py-3",
        lg:  "text-[17px] px-8 py-[14px]",
        icon: "w-10 h-10 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
