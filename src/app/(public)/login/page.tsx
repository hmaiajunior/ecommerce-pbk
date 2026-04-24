"use client"

import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { AuthCard } from "@/components/auth/AuthCard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Metadata } from "next"

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const callbackUrl = params.get("callbackUrl") ?? "/"

  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState("")
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError("E-mail ou senha incorretos. Tente novamente.")
      return
    }

    // Busca a sessão para saber o role e redirecionar corretamente
    const { getSession } = await import("next-auth/react")
    const session = await getSession()
    const destination = callbackUrl !== "/" ? callbackUrl
      : session?.user?.role === "ADMIN" ? "/admin"
      : "/"

    router.push(destination)
    router.refresh()
  }

  return (
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

      <div className="relative">
        <Input
          label="Senha"
          id="password"
          type={showPass ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />
        <button
          type="button"
          onClick={() => setShowPass((v) => !v)}
          className="absolute right-3 bottom-3 text-brown-muted hover:text-brown-dark transition-colors"
          aria-label={showPass ? "Esconder senha" : "Mostrar senha"}
        >
          {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      <div className="flex justify-end -mt-2">
        <Link
          href="/esqueci-senha"
          className="text-xs font-bold text-primary hover:underline"
        >
          Esqueci minha senha
        </Link>
      </div>

      {error && (
        <p className="text-sm font-bold text-red-500 bg-red-50 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </Button>

      <p className="text-center text-sm font-semibold text-brown-muted">
        Não tem conta?{" "}
        <Link href="/cadastro" className="font-extrabold text-primary hover:underline">
          Cadastre-se
        </Link>
      </p>
    </form>
  )
}

export default function LoginPage() {
  return (
    <AuthCard
      title="Entrar"
      subtitle="Bem-vindo de volta aos pequenos aventureiros!"
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthCard>
  )
}
