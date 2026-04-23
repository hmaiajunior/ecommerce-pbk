"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Check } from "lucide-react"
import { changePassword } from "@/actions/account"

function ProfileSection() {
  const { data: session, update } = useSession()
  const [name, setName]     = useState(session?.user.name ?? "")
  const [email, setEmail]   = useState(session?.user.email ?? "")
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]       = useState<{ type: "ok" | "err"; text: string } | null>(null)

  useEffect(() => {
    setName(session?.user.name ?? "")
    setEmail(session?.user.email ?? "")
  }, [session])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    const res = await fetch("/api/account", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    })
    setLoading(false)
    if (res.ok) {
      await update({ name, email })
      setMsg({ type: "ok", text: "Dados atualizados com sucesso!" })
    } else {
      const json = await res.json()
      setMsg({ type: "err", text: json.error ?? "Erro ao atualizar dados." })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Nome completo" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      {msg && (
        <p className={`text-sm font-bold px-3 py-2 rounded-lg ${msg.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-500"}`}>
          {msg.type === "ok" && <Check size={13} className="inline mr-1" />}
          {msg.text}
        </p>
      )}
      <Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Salvar alterações"}</Button>
    </form>
  )
}

function PasswordSection() {
  const [current, setCurrent]   = useState("")
  const [newPass, setNewPass]   = useState("")
  const [confirm, setConfirm]   = useState("")
  const [showCur, setShowCur]   = useState(false)
  const [showNew, setShowNew]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [msg, setMsg]           = useState<{ type: "ok" | "err"; text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    const result = await changePassword({ currentPassword: current, newPassword: newPass, confirmPassword: confirm })
    setLoading(false)
    if (result.success) {
      setMsg({ type: "ok", text: result.message })
      setCurrent(""); setNewPass(""); setConfirm("")
    } else {
      setMsg({ type: "err", text: result.error })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <Input label="Senha atual" type={showCur ? "text" : "password"} value={current} onChange={(e) => setCurrent(e.target.value)} required />
        <button type="button" onClick={() => setShowCur(v => !v)} className="absolute right-3 bottom-3 text-brown-muted hover:text-brown-dark">
          {showCur ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      <div className="relative">
        <Input label="Nova senha" type={showNew ? "text" : "password"} value={newPass} onChange={(e) => setNewPass(e.target.value)} required minLength={8} />
        <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 bottom-3 text-brown-muted hover:text-brown-dark">
          {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      <Input
        label="Confirmar nova senha"
        type="password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
        error={confirm && newPass !== confirm ? "As senhas não coincidem" : undefined}
      />
      {msg && (
        <p className={`text-sm font-bold px-3 py-2 rounded-lg ${msg.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-500"}`}>
          {msg.type === "ok" && <Check size={13} className="inline mr-1" />}
          {msg.text}
        </p>
      )}
      <Button type="submit" disabled={loading || !current || newPass !== confirm}>
        {loading ? "Alterando..." : "Alterar senha"}
      </Button>
    </form>
  )
}

export default function DadosPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-black text-[26px] text-brown-dark">Dados cadastrais</h1>

      <div className="bg-white rounded-card shadow-[var(--shadow-card)] p-6 space-y-2">
        <h2 className="font-black text-[15px] text-brown-dark">Informações pessoais</h2>
        <p className="text-xs font-semibold text-brown-muted mb-4">Atualize seu nome e e-mail de acesso.</p>
        <ProfileSection />
      </div>

      <div className="bg-white rounded-card shadow-[var(--shadow-card)] p-6 space-y-2">
        <h2 className="font-black text-[15px] text-brown-dark">Alterar senha</h2>
        <p className="text-xs font-semibold text-brown-muted mb-4">Crie uma senha segura com ao menos 8 caracteres.</p>
        <PasswordSection />
      </div>
    </div>
  )
}
