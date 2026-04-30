import { ShieldCheck, RotateCcw, MessageCircle, Lock } from "lucide-react"

const BADGES = [
  {
    icon: ShieldCheck,
    title: "Compra segura",
    description: "Pagamento criptografado",
  },
  {
    icon: RotateCcw,
    title: "Troca grátis",
    description: "Em até 7 dias",
  },
  {
    icon: MessageCircle,
    title: "Atendimento",
    description: "WhatsApp humano",
  },
  {
    icon: Lock,
    title: "Dados protegidos",
    description: "Conforme a LGPD",
  },
]

export function TrustBadges() {
  return (
    <div className="bg-white rounded-card border border-bg-nude p-4">
      <div className="grid grid-cols-2 gap-3">
        {BADGES.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex items-start gap-2.5">
            <div className="w-9 h-9 rounded-full bg-bg-blush flex items-center justify-center text-primary shrink-0">
              <Icon size={16} />
            </div>
            <div className="min-w-0">
              <p className="font-extrabold text-[12px] text-brown-dark leading-tight">{title}</p>
              <p className="font-semibold text-[11px] text-brown-muted leading-tight mt-0.5">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
