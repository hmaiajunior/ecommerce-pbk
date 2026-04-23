"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react"
import { AuthCard } from "@/components/auth/AuthCard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

function ResetForm() {
  const params = useSearchParams()
  const router = useRouter()
  const token  = params.get("token") ?? ""

  const [password, setPassword]   = useState("")
  const [confirm, setConfirm]     = useState("")
  const [showPass, setShowPass]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState("")
  const [success, setSuccess]     = useState(false)

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="font-bold text-red-500">Link inválido ou expirado.</p>
        <Link href="/esqueci-senha" className="font-extrabold text-primary hover:underline text-sm">
          Solicitar novo link
        </Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto">
          <CheckCircle size={28} className="text-secondary" />
        </div>
        <p className="font-extrabold text-lg text-brown-dark">Senha redefinida!</p>
        <p className="font-semibold text-sm text-brown-muted">
          Sua nova senha foi salva com sucesso.
        </p>
        <Button className="w-full" onClick={() => router.push("/login")}>
          Fazer login
        </Button>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError("As senhas não coincidem.")
      return
    }
    setLoading(true)
    setError("")

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    })

    setLoading(false)
    const json = await res.json()

    if (!res.ok) {
      setError(json.error ?? "Erro ao redefinir senha.")
      return
    }

    setSuccess(true)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="relative">
        <Input
          label="Nova senha"
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

      <Input
        label="Confirmar senha"
        id="confirm"
        type="password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="Repita a nova senha"
        required
        autoComplete="new-password"
        error={confirm && password !== confirm ? "As senhas não coincidem" : undefined}
      />

      {error && (
        <p className="text-sm font-bold text-red-500 bg-red-50 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={loading || !password || password !== confirm}
      >
        {loading ? "Salvando..." : "Salvar nova senha"}
      </Button>

      <Link
        href="/login"
        className="flex items-center justify-center gap-2 font-bold text-sm text-brown-muted hover:text-primary transition-colors"
      >
        <ArrowLeft size={14} /> Voltar ao login
      </Link>
    </form>
  )
}

export default function ResetarSenhaPage() {
  return (
    <AuthCard
      title="Nova senha"
      subtitle="Escolha uma senha segura para sua conta."
    >
      <Suspense>
        <ResetForm />
      </Suspense>
    </AuthCard>
  )
}
