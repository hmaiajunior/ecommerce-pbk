"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, ArrowLeft } from "lucide-react"
import { AuthCard } from "@/components/auth/AuthCard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function EsqueciSenhaPage() {
  const [email, setEmail]     = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    setLoading(false)
    setSent(true)
  }

  if (sent) {
    return (
      <AuthCard title="E-mail enviado!">
        <div className="text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto">
            <Mail size={28} className="text-secondary" />
          </div>
          <p className="font-semibold text-brown-mid leading-relaxed">
            Se este e-mail estiver cadastrado, você receberá as instruções para redefinir a senha em breve.
          </p>
          <p className="text-xs font-semibold text-brown-muted">
            Verifique também sua caixa de spam.
          </p>
          <Link href="/login" className="flex items-center justify-center gap-2 font-extrabold text-sm text-primary hover:underline">
            <ArrowLeft size={14} /> Voltar ao login
          </Link>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Esqueci minha senha"
      subtitle="Digite seu e-mail e enviaremos um link para criar uma nova senha."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="E-mail"
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          required
          autoComplete="email"
        />

        <Button type="submit" size="lg" className="w-full" disabled={loading || !email}>
          {loading ? "Enviando..." : "Enviar link de redefinição"}
        </Button>

        <Link
          href="/login"
          className="flex items-center justify-center gap-2 font-bold text-sm text-brown-muted hover:text-primary transition-colors"
        >
          <ArrowLeft size={14} /> Voltar ao login
        </Link>
      </form>
    </AuthCard>
  )
}
