"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, Store, User } from "lucide-react"
import { AuthCard } from "@/components/auth/AuthCard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Role = "RETAIL" | "WHOLESALE"

export default function CadastroPage() {
  const [role, setRole]         = useState<Role>("RETAIL")
  const [name, setName]         = useState("")
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [cnpj, setCnpj]         = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")
  const [success, setSuccess]   = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role, ...(cnpj && { cnpj }) }),
    })

    setLoading(false)
    const json = await res.json()

    if (!res.ok) {
      setError(json.error ?? "Erro ao criar conta. Tente novamente.")
      return
    }

    setSuccess(json.message)
  }

  if (success) {
    return (
      <AuthCard title="Cadastro realizado!">
        <div className="text-center space-y-5">
          <span className="text-6xl block">🎉</span>
          <p className="font-semibold text-brown-mid leading-relaxed">{success}</p>
          <Button asChild className="w-full">
            <Link href="/login">Fazer login</Link>
          </Button>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Criar conta" subtitle="Junte-se à família Playbekids!">
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Seletor de tipo de conta */}
        <div>
          <p className="text-xs font-black uppercase tracking-[0.1em] text-brown-muted mb-3">
            Tipo de conta
          </p>
          <div className="grid grid-cols-2 gap-3">
            {([
              { id: "RETAIL",    label: "Comprador",  sub: "Para minha família", icon: User  },
              { id: "WHOLESALE", label: "Revendedor", sub: "Atacado / lojista",   icon: Store },
            ] as { id: Role; label: string; sub: string; icon: typeof User }[]).map(
              ({ id, label, sub, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setRole(id)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-4 rounded-card border-2 transition-all",
                    role === id
                      ? "border-primary bg-primary/5"
                      : "border-bg-nude bg-white hover:border-brown-muted"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    role === id ? "bg-primary text-white" : "bg-bg-blush text-brown-muted"
                  )}>
                    <Icon size={18} />
                  </div>
                  <span className="font-extrabold text-sm text-brown-dark">{label}</span>
                  <span className="font-semibold text-[11px] text-brown-muted">{sub}</span>
                </button>
              )
            )}
          </div>
        </div>

        <Input
          label="Nome completo"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="João Silva"
          required
          autoComplete="name"
        />

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

        <div className="relative">
          <Input
            label="Senha"
            id="password"
            type={showPass ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            required
            minLength={8}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            className="absolute right-3 bottom-3 text-brown-muted hover:text-brown-dark transition-colors"
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {role === "WHOLESALE" && (
          <div className="space-y-3 bg-bg-blush rounded-lg p-4 border border-bg-nude">
            <p className="text-xs font-black uppercase tracking-wider text-brown-muted">
              Dados de atacado
            </p>
            <Input
              label="CNPJ (opcional)"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
              placeholder="00.000.000/0001-00"
            />
            <p className="text-xs font-semibold text-brown-muted leading-relaxed">
              ⚠️ Contas de atacado são aprovadas manualmente em até 2 dias úteis.
            </p>
          </div>
        )}

        {error && (
          <p className="text-sm font-bold text-red-500 bg-red-50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Criando conta..." : "Criar conta"}
        </Button>

        <p className="text-center text-sm font-semibold text-brown-muted">
          Já tem conta?{" "}
          <Link href="/login" className="font-extrabold text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </AuthCard>
  )
}
