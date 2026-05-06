"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem("cookie-consent")) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem("cookie-consent", "accepted")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-brown-dark text-white px-4 py-4 shadow-[0_-4px_24px_rgba(0,0,0,0.18)]">
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-semibold text-sm text-bg-nude leading-relaxed text-center sm:text-left">
          Usamos cookies essenciais para manter sua sessão e carrinho. Ao continuar navegando, você concorda com nossa{" "}
          <Link href="/privacidade" className="underline text-white hover:text-accent transition-colors">
            Política de Privacidade
          </Link>.
        </p>
        <Button size="sm" onClick={accept} className="shrink-0">
          Entendi
        </Button>
      </div>
    </div>
  )
}
