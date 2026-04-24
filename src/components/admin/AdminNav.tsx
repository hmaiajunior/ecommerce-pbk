"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { LayoutDashboard, Package, ShoppingBag, Users, Tag, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

const LINKS = [
  { href: "/admin",          label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/produtos", label: "Produtos",  icon: Package                      },
  { href: "/admin/pedidos",  label: "Pedidos",   icon: ShoppingBag                  },
  { href: "/admin/clientes", label: "Clientes",  icon: Users                        },
  { href: "/admin/cupons",   label: "Cupons",    icon: Tag                          },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <aside className="w-[220px] shrink-0 bg-brown-dark min-h-screen flex flex-col py-6 px-3">
      {/* Logo */}
      <Link href="/admin" className="flex items-center gap-3 px-2 mb-8">
        <div className="w-9 h-9 rounded-full overflow-hidden bg-bg-blush shrink-0">
          <Image src="/logo.jpeg" alt="Playbekids" width={36} height={36}
            className="object-cover object-[50%_38%] w-full h-full" />
        </div>
        <div>
          <p className="font-black text-[15px] text-white leading-tight">Playbekids</p>
          <p className="font-bold text-[10px] text-brown-muted uppercase tracking-wider">Admin</p>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {LINKS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link key={href} href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold text-sm transition-colors",
                active
                  ? "bg-primary text-white shadow-[var(--shadow-coral)]"
                  : "text-brown-muted hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon size={16} className="shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-white/10 pt-4 mt-4">
        <button
          onClick={() => signOut({ callbackUrl: window.location.origin })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg font-bold text-sm text-brown-muted hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut size={16} /> Sair
        </button>
      </div>
    </aside>
  )
}
