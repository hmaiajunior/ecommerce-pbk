"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { ShoppingBag, User, MapPin, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

const LINKS = [
  { href: "/minha-conta/pedidos",   label: "Meus pedidos",     icon: ShoppingBag },
  { href: "/minha-conta/dados",     label: "Dados cadastrais", icon: User        },
  { href: "/minha-conta/enderecos", label: "Endereços",        icon: MapPin      },
]

export function AccountNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-row lg:flex-col gap-1">
      {LINKS.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition-colors",
            pathname.startsWith(href)
              ? "bg-primary/10 text-primary"
              : "text-brown-mid hover:bg-bg-blush hover:text-brown-dark"
          )}
        >
          <Icon size={16} className="shrink-0" />
          <span className="hidden sm:block">{label}</span>
        </Link>
      ))}
      <button
        onClick={() => signOut({ callbackUrl: window.location.origin })}
        className="flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm text-brown-muted hover:bg-bg-blush hover:text-primary transition-colors"
      >
        <LogOut size={16} className="shrink-0" />
        <span className="hidden sm:block">Sair</span>
      </button>
    </nav>
  )
}
