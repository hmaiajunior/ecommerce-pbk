"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Edit2, Trash2, Image as ImageIcon, X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { cn, formatPrice } from "@/lib/utils"

type Category = { id: string; name: string; slug: string }
type AgeRange  = { id: string; name: string }
type Product   = {
  id: string; name: string; slug: string; retailPrice: number; wholesalePrice?: number
  active: boolean; featured: boolean
  category: Category; ageRange: AgeRange
  images: { id: string; url: string; alt?: string | null }[]
  sizes: { size: string; stock: number }[]
  _count: { orderItems: number }
}

const SIZE_LIST = ["RN","P","M","G","GG","1","2","4","6","8","10","12","14","16"]

const EMPTY_FORM = {
  name: "", description: "", fabric: "",
  retailPrice: "", wholesalePrice: "", wholesaleMinQty: "",
  categoryId: "", ageRangeId: "",
  featured: false, active: true,
  sizes: SIZE_LIST.map(s => ({ size: s, stock: 0 })),
}

export default function AdminProdutosPage() {
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [search, setSearch] = useState("")
  const [editing, setEditing] = useState<Product | "new" | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formErr, setFormErr] = useState("")
  const [uploadingFor, setUploadingFor] = useState<string | null>(null)

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["admin-products", search],
    queryFn: () =>
      fetch(`/api/admin/products?limit=50${search ? `&search=${encodeURIComponent(search)}` : ""}`)
        .then(r => r.json()).then(j => j.data ?? []),
  })

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => fetch("/api/categories").then(r => r.json()).then(j => j.data ?? []),
  })

  const { data: ageRanges = [] } = useQuery<AgeRange[]>({
    queryKey: ["age-ranges"],
    queryFn: () => fetch("/api/age-ranges").then(r => r.json()).then(j => j.data ?? []),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/admin/products/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] }),
  })

  const deleteImageMutation = useMutation({
    mutationFn: ({ productId, imageId }: { productId: string; imageId: string }) =>
      fetch(`/api/admin/products/${productId}/images/${imageId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] }),
  })

  function openCreate() {
    setEditing("new")
    setForm(EMPTY_FORM)
    setFormErr("")
  }

  function openEdit(p: Product) {
    setEditing(p)
    setForm({
      name: p.name, description: "", fabric: "",
      retailPrice: String(p.retailPrice),
      wholesalePrice: p.wholesalePrice ? String(p.wholesalePrice) : "",
      wholesaleMinQty: "",
      categoryId: p.category.id, ageRangeId: p.ageRange.id,
      featured: p.featured, active: p.active,
      sizes: p.sizes.length ? p.sizes : SIZE_LIST.map(s => ({ size: s, stock: 0 })),
    })
    setFormErr("")
  }

  function updateSize(size: string, stock: number) {
    setForm(f => ({
      ...f,
      sizes: f.sizes.map(s => s.size === size ? { ...s, stock } : s),
    }))
  }

  async function handleSave() {
    setSaving(true); setFormErr("")
    const isNew = editing === "new"
    const url   = isNew ? "/api/admin/products" : `/api/admin/products/${(editing as Product).id}`
    const body  = {
      name: form.name, description: form.description || undefined, fabric: form.fabric || undefined,
      retailPrice: parseFloat(form.retailPrice),
      wholesalePrice: form.wholesalePrice ? parseFloat(form.wholesalePrice) : undefined,
      wholesaleMinQty: form.wholesaleMinQty ? parseInt(form.wholesaleMinQty) : undefined,
      categoryId: form.categoryId, ageRangeId: form.ageRangeId,
      featured: form.featured, active: form.active,
      sizes: form.sizes.filter(s => s.stock >= 0),
    }
    const res = await fetch(url, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    setSaving(false)
    if (!res.ok) {
      const json = await res.json()
      setFormErr(json.error ?? "Erro ao salvar produto.")
      return
    }
    qc.invalidateQueries({ queryKey: ["admin-products"] })
    setEditing(null)
  }

  async function handleImageUpload(productId: string, file: File) {
    setUploadingFor(productId)
    const fd = new FormData()
    fd.append("file", file)
    await fetch(`/api/admin/products/${productId}/images`, { method: "POST", body: fd })
    setUploadingFor(null)
    qc.invalidateQueries({ queryKey: ["admin-products"] })
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="font-black text-[26px] text-brown-dark">Produtos</h1>
        <Button onClick={openCreate}><Plus size={14} /> Novo produto</Button>
      </div>

      {/* Busca */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-muted" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar produto..."
          className="w-full pl-9 pr-4 py-2.5 border border-bg-nude rounded-pill font-bold text-sm text-brown-dark placeholder:text-brown-muted outline-none focus:border-primary"
        />
      </div>

      {/* Formulário create/edit */}
      {editing !== null && (
        <div className="bg-white rounded-card shadow-[var(--shadow-card)] p-6 border-2 border-primary/20">
          <div className="flex items-center justify-between mb-5">
            <p className="font-black text-[17px] text-brown-dark">
              {editing === "new" ? "Novo produto" : `Editar: ${(editing as Product).name}`}
            </p>
            <button onClick={() => setEditing(null)} className="text-brown-muted hover:text-red-400"><X size={18} /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nome *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Preço varejo *" type="number" step="0.01" value={form.retailPrice} onChange={e => setForm(f => ({ ...f, retailPrice: e.target.value }))} />
              <Input label="Preço atacado" type="number" step="0.01" value={form.wholesalePrice} onChange={e => setForm(f => ({ ...f, wholesalePrice: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-[0.1em] text-brown-muted block mb-1.5">Categoria *</label>
              <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                className="w-full border border-bg-nude rounded-lg px-3 py-2.5 font-semibold text-sm text-brown-dark outline-none focus:border-primary">
                <option value="">Selecione...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-[0.1em] text-brown-muted block mb-1.5">Faixa etária *</label>
              <select value={form.ageRangeId} onChange={e => setForm(f => ({ ...f, ageRangeId: e.target.value }))}
                className="w-full border border-bg-nude rounded-lg px-3 py-2.5 font-semibold text-sm text-brown-dark outline-none focus:border-primary">
                <option value="">Selecione...</option>
                {ageRanges.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <Input label="Descrição" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <Input label="Composição do tecido" value={form.fabric} onChange={e => setForm(f => ({ ...f, fabric: e.target.value }))} />
          </div>

          {/* Tamanhos e estoque */}
          <div className="mt-5">
            <p className="text-xs font-black uppercase tracking-wider text-brown-muted mb-3">Tamanhos e estoque</p>
            <div className="flex flex-wrap gap-2">
              {form.sizes.map(({ size, stock }) => (
                <div key={size} className="flex flex-col items-center gap-1">
                  <span className="font-extrabold text-xs text-brown-muted">{size}</span>
                  <input
                    type="number" min="0" value={stock}
                    onChange={e => updateSize(size, parseInt(e.target.value) || 0)}
                    className="w-14 text-center border border-bg-nude rounded-lg py-1.5 font-bold text-sm text-brown-dark outline-none focus:border-primary"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Imagens (apenas ao editar) */}
          {editing !== "new" && (
            <div className="mt-5">
              <p className="text-xs font-black uppercase tracking-wider text-brown-muted mb-3">
                Imagens <span className="text-brown-light font-semibold normal-case tracking-normal">({(editing as Product).images.length}/5)</span>
              </p>
              <div className="flex flex-wrap gap-3">
                {(editing as Product).images.map(img => (
                  <div key={img.id} className="relative w-20 h-20 rounded-lg overflow-hidden bg-bg-blush">
                    <Image src={img.url} alt={img.alt ?? ""} fill sizes="80px" className="object-cover" />
                    <button
                      onClick={() => deleteImageMutation.mutate({ productId: (editing as Product).id, imageId: img.id })}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
                {(editing as Product).images.length < 5 && (
                  <>
                    <button
                      onClick={() => fileRef.current?.click()}
                      disabled={uploadingFor === (editing as Product).id}
                      className="w-20 h-20 rounded-lg border-2 border-dashed border-bg-nude flex flex-col items-center justify-center text-brown-muted hover:border-primary hover:text-primary transition-colors"
                    >
                      <ImageIcon size={18} />
                      <span className="text-[10px] font-bold mt-1">{uploadingFor ? "..." : "Adicionar"}</span>
                    </button>
                    <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden"
                      onChange={async e => {
                        const files = Array.from(e.target.files ?? [])
                        const product = editing as Product
                        const slots = 5 - product.images.length
                        for (const file of files.slice(0, slots)) {
                          await handleImageUpload(product.id, file)
                        }
                        e.target.value = ""
                      }}
                    />
                  </>
                )}
              </div>
            </div>
          )}

          {/* Checkboxes */}
          <div className="flex gap-6 mt-5">
            {[
              { key: "featured", label: "Destaque" },
              { key: "active",   label: "Ativo"    },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={(form as any)[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
                  className="w-4 h-4 accent-primary" />
                <span className="font-bold text-sm text-brown-mid">{label}</span>
              </label>
            ))}
          </div>

          {formErr && <p className="text-sm font-bold text-red-500 mt-3">{formErr}</p>}
          <div className="flex gap-3 mt-5">
            <Button onClick={handleSave} disabled={saving}>{saving ? "Salvando..." : "Salvar produto"}</Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button>
          </div>
        </div>
      )}

      {/* Tabela */}
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-card" />)}</div>
      ) : (
        <div className="bg-white rounded-card shadow-[var(--shadow-card)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-bg-nude bg-bg-blush">
              <tr>{["Produto","Categoria","Varejo","Atacado","Estoque","Ativo","Ações"].map(h => (
                <th key={h} className="text-left py-3 px-4 text-xs font-black uppercase tracking-wider text-brown-muted">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {(products ?? []).map(p => {
                const totalStock = p.sizes.reduce((sum: number, s: { stock: number }) => sum + s.stock, 0)
                const stockColor = totalStock === 0 ? "text-red-500" : totalStock <= 5 ? "text-amber-500" : "text-green-700"
                return (
                <tr key={p.id} className="border-b border-bg-nude hover:bg-bg-blush/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-bg-blush shrink-0">
                        {p.images[0] ? <Image src={p.images[0].url} alt={p.name} fill sizes="40px" className="object-cover" /> : <span className="w-full h-full flex items-center justify-center text-lg">👕</span>}
                      </div>
                      <div>
                        <p className="font-extrabold text-sm text-brown-dark">{p.name}</p>
                        <p className="font-semibold text-xs text-brown-muted">{p.ageRange.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-brown-muted">{p.category.name}</td>
                  <td className="py-3 px-4 font-extrabold text-primary">{formatPrice(Number(p.retailPrice))}</td>
                  <td className="py-3 px-4 font-semibold text-brown-muted">{p.wholesalePrice ? formatPrice(Number(p.wholesalePrice)) : "—"}</td>
                  <td className="py-3 px-4">
                    <span className={cn("font-extrabold text-sm", stockColor)}>
                      {totalStock}
                    </span>
                    <span className="font-semibold text-xs text-brown-muted ml-1">un</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={cn("px-2 py-0.5 rounded-pill text-[11px] font-extrabold", p.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500")}>
                      {p.active ? "Sim" : "Não"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-brown-muted hover:text-primary hover:bg-primary/10 transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => { if (confirm("Desativar/excluir produto?")) deleteMutation.mutate(p.id) }}
                        className="p-1.5 rounded-lg text-brown-muted hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
                )}
              )}
            </tbody>
          </table>
          {(products ?? []).length === 0 && (
            <p className="text-center py-10 font-semibold text-brown-muted">Nenhum produto encontrado.</p>
          )}
        </div>
      )}
    </div>
  )
}
