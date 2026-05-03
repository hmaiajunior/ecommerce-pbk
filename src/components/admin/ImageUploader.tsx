"use client"

import { useState, useRef, useCallback } from "react"
import Image from "next/image"
import { X, Upload, ImageIcon, Loader2 } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"

type UploadedImage = { id: string; url: string; alt?: string | null }

type FileState = {
  file: File
  preview: string
  status: "pending" | "uploading" | "done" | "error"
  error?: string
}

type Props = {
  productId: string
  images: UploadedImage[]
}

export function ImageUploader({ productId, images }: Props) {
  const qc = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [queue, setQueue] = useState<FileState[]>([])
  const [dragging, setDragging] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const slots = 5 - images.length
  const busy = queue.some(f => f.status === "uploading")

  function addFiles(files: File[]) {
    const available = slots - queue.filter(f => f.status !== "error").length
    const accepted = files.slice(0, available)
    const newItems: FileState[] = accepted.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      status: "pending",
    }))
    setQueue(q => [...q, ...newItems])
    uploadAll(newItems)
  }

  async function uploadAll(items: FileState[]) {
    for (const item of items) {
      setQueue(q => q.map(f => f.preview === item.preview ? { ...f, status: "uploading" } : f))
      const fd = new FormData()
      fd.append("file", item.file)
      const res = await fetch(`/api/admin/products/${productId}/images`, { method: "POST", body: fd })
      const json = await res.json().catch(() => ({}))
      if (res.ok) {
        setQueue(q => q.map(f => f.preview === item.preview ? { ...f, status: "done" } : f))
        qc.invalidateQueries({ queryKey: ["admin-products"] })
        setTimeout(() => {
          setQueue(q => q.filter(f => f.preview !== item.preview))
          URL.revokeObjectURL(item.preview)
        }, 1500)
      } else {
        setQueue(q => q.map(f => f.preview === item.preview
          ? { ...f, status: "error", error: json.error ?? "Erro ao enviar" }
          : f
        ))
      }
    }
  }

  async function deleteImage(imageId: string) {
    setDeleting(imageId)
    await fetch(`/api/admin/products/${productId}/images/${imageId}`, { method: "DELETE" })
    qc.invalidateQueries({ queryKey: ["admin-products"] })
    setDeleting(null)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"))
    if (files.length) addFiles(files)
  }, [slots, queue]) // eslint-disable-line

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-wider text-brown-muted">
          Imagens
        </p>
        <span className="text-xs font-semibold text-brown-muted">
          {images.length}/5
        </span>
      </div>

      {/* Grid de imagens existentes + zona de upload */}
      <div className="grid grid-cols-5 gap-2">
        {/* Imagens já salvas */}
        {images.map(img => (
          <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden bg-bg-blush group">
            <Image src={img.url} alt={img.alt ?? ""} fill sizes="100px" className="object-cover" />
            <button
              onClick={() => deleteImage(img.id)}
              disabled={deleting === img.id}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              {deleting === img.id
                ? <Loader2 size={18} className="text-white animate-spin" />
                : <X size={18} className="text-white" />
              }
            </button>
          </div>
        ))}

        {/* Arquivos em upload */}
        {queue.map(f => (
          <div key={f.preview} className="relative aspect-square rounded-xl overflow-hidden bg-bg-blush">
            <Image src={f.preview} alt="" fill sizes="100px" className="object-cover" />
            <div className={cn(
              "absolute inset-0 flex items-center justify-center",
              f.status === "uploading" && "bg-black/40",
              f.status === "done" && "bg-green-500/40",
              f.status === "error" && "bg-red-500/50",
            )}>
              {f.status === "uploading" && <Loader2 size={20} className="text-white animate-spin" />}
              {f.status === "done" && <span className="text-white text-lg">✓</span>}
              {f.status === "error" && (
                <button onClick={() => {
                  setQueue(q => q.filter(x => x.preview !== f.preview))
                  URL.revokeObjectURL(f.preview)
                }}>
                  <X size={18} className="text-white" />
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Zona de drop — só aparece se há slots disponíveis */}
        {images.length + queue.filter(f => f.status !== "error").length < 5 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            disabled={busy}
            className={cn(
              "aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors",
              dragging
                ? "border-primary bg-primary/10 text-primary"
                : "border-bg-nude text-brown-muted hover:border-primary hover:text-primary",
              busy && "opacity-50 cursor-not-allowed"
            )}
          >
            <Upload size={18} />
            <span className="text-[10px] font-bold">Adicionar</span>
          </button>
        )}
      </div>

      {/* Mensagem de erro inline */}
      {queue.some(f => f.status === "error") && (
        <p className="text-xs font-bold text-red-500">
          {queue.find(f => f.status === "error")?.error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={e => {
          const files = Array.from(e.target.files ?? [])
          if (files.length) addFiles(files)
          e.target.value = ""
        }}
      />

      <p className="text-[11px] text-brown-muted font-semibold">
        Arraste imagens ou clique em "Adicionar". Máx. 5 fotos · JPG, PNG ou WebP.
      </p>
    </div>
  )
}
