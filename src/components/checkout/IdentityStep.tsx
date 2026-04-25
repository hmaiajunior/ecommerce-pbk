"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { checkEmailExists, guestSignIn } from "@/actions/guest-checkout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function IdentityStep() {
  const router = useRouter()
  const [step, setStep] = useState<"email" | "name">("email")
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleEmailSubmit() {
    setError("")
    const trimmed = email.trim().toLowerCase()
    if (!EMAIL_RE.test(trimmed)) {
      setError("Informe um e-mail válido.")
      return
    }

    startTransition(async () => {
      const exists = await checkEmailExists(trimmed)
      if (exists) {
        const result = await guestSignIn(trimmed)
        if (result.ok) {
          router.push("/checkout")
          router.refresh()
        } else {
          setError("Ops! Algo deu errado. Por favor, tente novamente em instantes.")
        }
      } else {
        setStep("name")
      }
    })
  }

  function handleNameSubmit() {
    setError("")
    if (!name.trim()) {
      setError("Informe seu nome para continuar.")
      return
    }

    startTransition(async () => {
      const result = await guestSignIn(email.trim().toLowerCase(), name.trim())
      if (result.ok) {
        router.push("/checkout")
        router.refresh()
      } else {
        setError("Ops! Algo deu errado. Por favor, tente novamente em instantes.")
      }
    })
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-black text-xl text-brown-dark">Identificação</h2>
        <p className="font-semibold text-sm text-brown-muted mt-1">
          Informe seu e-mail para continuar com a compra.
        </p>
      </div>

      {step === "email" ? (
        <div className="space-y-4">
          <Input
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isPending && handleEmailSubmit()}
            placeholder="seu@email.com"
            autoFocus
            autoComplete="email"
          />
          {error && <p className="text-xs font-bold text-red-500">{error}</p>}
          <Button
            size="lg"
            className="w-full"
            onClick={handleEmailSubmit}
            disabled={isPending || !email.trim()}
          >
            {isPending ? "Verificando..." : "Continuar →"}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-bg-blush rounded-lg px-4 py-3 border border-bg-nude">
            <p className="text-[11px] font-bold text-brown-muted uppercase tracking-wide">E-mail</p>
            <p className="font-bold text-sm text-brown-dark mt-0.5">{email}</p>
          </div>
          <Input
            label="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isPending && handleNameSubmit()}
            placeholder="Como prefere ser chamado?"
            autoFocus
            autoComplete="name"
          />
          {error && <p className="text-xs font-bold text-red-500">{error}</p>}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="lg"
              className="flex-1"
              onClick={() => { setStep("email"); setError("") }}
              disabled={isPending}
            >
              ← Voltar
            </Button>
            <Button
              size="lg"
              className="flex-1"
              onClick={handleNameSubmit}
              disabled={isPending || !name.trim()}
            >
              {isPending ? "Aguarde..." : "Continuar →"}
            </Button>
          </div>
          <p className="text-[11px] font-semibold text-brown-muted text-center leading-relaxed">
            Vamos criar uma conta gratuita para que você possa acompanhar seu pedido.
          </p>
        </div>
      )}
    </div>
  )
}
