import { Truck } from "lucide-react"
import { FREE_SHIPPING_MIN } from "@/lib/shipping-config"
import { formatPrice } from "@/lib/utils"

export function AnnouncementBar() {
  return (
    <div className="bg-brown-dark text-bg-cream text-center text-[12px] font-extrabold py-2 px-4">
      <span className="inline-flex items-center gap-1.5">
        <Truck size={13} />
        Frete grátis em compras acima de {formatPrice(FREE_SHIPPING_MIN)}
        <span className="hidden sm:inline">· Trocas em até 7 dias · Pagamento seguro</span>
      </span>
    </div>
  )
}
