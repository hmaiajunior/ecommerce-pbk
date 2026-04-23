import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

const STEPS = ["Endereço", "Frete", "Pagamento"]

export function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  return (
    <nav className="flex items-center gap-0" aria-label="Etapas do checkout">
      {STEPS.map((label, i) => {
        const step = i + 1
        const done = step < current
        const active = step === current
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-black text-sm transition-all",
                  done   ? "bg-secondary text-white" :
                  active ? "bg-primary text-white shadow-[0_4px_14px_rgba(255,107,74,0.30)]" :
                           "bg-bg-nude text-brown-muted"
                )}
              >
                {done ? <Check size={14} /> : step}
              </div>
              <span
                className={cn(
                  "text-xs font-bold hidden sm:block",
                  active ? "text-primary" : done ? "text-secondary" : "text-brown-muted"
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-16 sm:w-24 mx-2 mb-5 rounded-full transition-all",
                  done ? "bg-secondary" : "bg-bg-nude"
                )}
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}
