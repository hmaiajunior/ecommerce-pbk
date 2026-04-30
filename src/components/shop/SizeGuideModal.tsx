"use client"

import { useEffect } from "react"
import { X, Ruler } from "lucide-react"

type Props = {
  open: boolean
  onClose: () => void
}

const ROWS = [
  { size: "RN",  weight: "Até 4 kg",  height: "Até 50 cm",   age: "Recém-nascido" },
  { size: "P",   weight: "4 a 6 kg",  height: "50 a 60 cm",  age: "0-3 meses" },
  { size: "M",   weight: "6 a 8 kg",  height: "60 a 68 cm",  age: "3-6 meses" },
  { size: "G",   weight: "8 a 10 kg", height: "68 a 75 cm",  age: "6-9 meses" },
  { size: "1",   weight: "9 a 11 kg", height: "74 a 80 cm",  age: "1 ano" },
  { size: "2",   weight: "11 a 13 kg", height: "82 a 88 cm", age: "2 anos" },
  { size: "3",   weight: "13 a 15 kg", height: "90 a 96 cm", age: "3 anos" },
  { size: "4",   weight: "15 a 17 kg", height: "98 a 104 cm", age: "4 anos" },
  { size: "6",   weight: "18 a 21 kg", height: "108 a 116 cm", age: "5-6 anos" },
  { size: "8",   weight: "23 a 26 kg", height: "120 a 128 cm", age: "7-8 anos" },
  { size: "10",  weight: "28 a 32 kg", height: "132 a 140 cm", age: "9-10 anos" },
  { size: "12",  weight: "34 a 38 kg", height: "144 a 152 cm", age: "11-12 anos" },
]

export function SizeGuideModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onEsc)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onEsc)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-label="Tabela de medidas"
    >
      <div
        className="absolute inset-0 bg-brown-dark/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative bg-bg-cream rounded-card shadow-[0_24px_60px_rgba(61,43,31,0.25)] w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-bg-nude bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-bg-blush flex items-center justify-center text-primary">
              <Ruler size={18} />
            </div>
            <div>
              <h2 className="font-black text-lg text-brown-dark">Tabela de medidas</h2>
              <p className="text-[11px] font-bold text-brown-muted">Encontre o tamanho ideal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-bg-blush flex items-center justify-center text-brown-mid hover:bg-bg-nude transition-colors"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Conteúdo rolável */}
        <div className="overflow-y-auto px-6 py-5">
          {/* Tabela */}
          <div className="rounded-card bg-white border border-bg-nude overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-bg-blush">
                <tr>
                  <th className="text-left py-3 px-3 text-[11px] font-black uppercase tracking-wider text-brown-muted">Tam.</th>
                  <th className="text-left py-3 px-3 text-[11px] font-black uppercase tracking-wider text-brown-muted">Peso</th>
                  <th className="text-left py-3 px-3 text-[11px] font-black uppercase tracking-wider text-brown-muted">Altura</th>
                  <th className="text-left py-3 px-3 text-[11px] font-black uppercase tracking-wider text-brown-muted">Idade</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.size} className="border-t border-bg-nude">
                    <td className="py-2.5 px-3 font-black text-primary">{row.size}</td>
                    <td className="py-2.5 px-3 font-semibold text-brown-mid">{row.weight}</td>
                    <td className="py-2.5 px-3 font-semibold text-brown-mid">{row.height}</td>
                    <td className="py-2.5 px-3 font-semibold text-brown-muted">{row.age}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Dicas */}
          <div className="mt-5 bg-white rounded-card border border-bg-nude p-5">
            <p className="text-xs font-black uppercase tracking-wider text-brown-muted mb-3">
              Como medir corretamente
            </p>
            <ul className="space-y-2 text-sm font-semibold text-brown-mid leading-relaxed">
              <li><strong>Altura:</strong> meça da cabeça aos pés, com a criança descalça e em pé contra a parede.</li>
              <li><strong>Peso:</strong> use uma balança comum, com a criança sem roupas pesadas.</li>
              <li>Se estiver entre dois tamanhos, prefira o maior — crianças crescem rápido!</li>
              <li>Para roupas de inverno (com camadas), considere também subir um tamanho.</li>
            </ul>
          </div>

          <p className="text-[11px] font-semibold text-brown-muted text-center mt-4 leading-relaxed">
            Os valores são aproximados e variam conforme o modelo. Em caso de dúvida, fale conosco no WhatsApp.
          </p>
        </div>
      </div>
    </div>
  )
}
