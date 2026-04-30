"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { ShoppingBag, Search, Menu, X, User, LogOut, Heart } from "lucide-react"
import { useWishlistStore } from "@/store/wishlist"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cart"
import { useUIStore } from "@/store/ui"
import { AnnouncementBar } from "./AnnouncementBar"

const navItems = [
  { href: "/",        label: "Início" },
  { href: "/produtos", label: "Loja" },
  { href: "/atacado",  label: "Atacado" },
]

export function Header() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const itemCount = useCartStore((s) => s.itemCount())
  const wishlistCount = useWishlistStore((s) => s.ids.size)
  const openCart = useUIStore((s) => s.openCart)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-bg-nude bg-bg-cream/90 backdrop-blur-md">
      <AnnouncementBar />
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 md:px-8">

        {/* Logo + nome */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="w-[46px] h-[46px] rounded-full overflow-hidden bg-bg-blush shadow-[0_4px_14px_rgba(0,0,0,0.11)]">
            <Image
              src="/logo.jpeg"
              alt="Playbekids"
              width={46}
              height={46}
              className="object-cover object-[50%_38%] w-full h-full"
              priority
            />
          </div>
          <span className="font-black text-[20px] text-brown-dark tracking-tight hidden sm:block">
            Playbekids
          </span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "px-4 py-2 rounded-pill font-bold text-[15px] transition-all duration-150",
                pathname === href
                  ? "bg-bg-blush text-primary"
                  : "text-brown-mid hover:bg-bg-blush hover:text-primary"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Ações direita */}
        <div className="flex items-center gap-2">
          <Link
            href="/busca"
            className="w-[38px] h-[38px] rounded-full bg-bg-blush flex items-center justify-center text-brown-mid hover:bg-bg-nude transition-colors"
            aria-label="Buscar"
          >
            <Search size={16} />
          </Link>

          {session && (
            <Link
              href="/minha-conta/favoritos"
              className="relative hidden md:flex w-[38px] h-[38px] rounded-full bg-bg-blush items-center justify-center text-brown-mid hover:bg-bg-nude transition-colors"
              aria-label="Favoritos"
            >
              <Heart size={16} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white w-[18px] h-[18px] rounded-full text-[10px] font-black flex items-center justify-center">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </Link>
          )}

          {session ? (
            <div
              className="relative hidden md:block"
              onMouseEnter={() => setMenuOpen(true)}
              onMouseLeave={() => setMenuOpen(false)}
            >
              <button className="w-[38px] h-[38px] rounded-full bg-bg-blush flex items-center justify-center text-brown-mid hover:bg-bg-nude transition-colors">
                <User size={16} />
              </button>
              {menuOpen && (
              <div className="absolute right-0 top-full w-48 bg-white rounded-card shadow-[0_4px_24px_rgba(61,43,31,0.12)] border border-bg-nude z-50">
                <Link
                  href="/minha-conta"
                  className="block px-4 py-3 text-sm font-bold text-brown-mid hover:text-primary hover:bg-bg-blush rounded-t-card transition-colors"
                >
                  Minha conta
                </Link>
                <Link
                  href="/minha-conta/pedidos"
                  className="block px-4 py-3 text-sm font-bold text-brown-mid hover:text-primary hover:bg-bg-blush transition-colors"
                >
                  Meus pedidos
                </Link>
                {session.user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="block px-4 py-3 text-sm font-bold text-info hover:bg-bg-blush transition-colors"
                  >
                    Painel admin
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: window.location.origin })}
                  className="w-full text-left px-4 py-3 text-sm font-bold text-brown-muted hover:text-primary hover:bg-bg-blush rounded-b-card transition-colors flex items-center gap-2"
                >
                  <LogOut size={14} /> Sair
                </button>
              </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="hidden md:block">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
          )}

          <Button
            variant="primary"
            size="sm"
            className="relative"
            onClick={openCart}
            aria-label="Carrinho"
          >
            <ShoppingBag size={15} />
            <span className="hidden sm:inline">Carrinho</span>
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-accent text-brown-dark w-[18px] h-[18px] rounded-full text-[10px] font-black flex items-center justify-center">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Button>

          {/* Menu mobile */}
          <button
            className="md:hidden w-[38px] h-[38px] rounded-full bg-bg-blush flex items-center justify-center text-brown-mid"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Drawer mobile */}
      {mobileOpen && (
        <div className="md:hidden border-t border-bg-nude bg-bg-cream px-4 py-4 flex flex-col gap-2">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "px-4 py-3 rounded-lg font-bold text-[15px]",
                pathname === href
                  ? "bg-bg-blush text-primary"
                  : "text-brown-mid hover:bg-bg-blush"
              )}
            >
              {label}
            </Link>
          ))}
          {session ? (
            <>
              <Link href="/minha-conta" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-lg font-bold text-brown-mid hover:bg-bg-blush">Minha conta</Link>
              <button onClick={() => signOut({ callbackUrl: window.location.origin })} className="text-left px-4 py-3 rounded-lg font-bold text-brown-muted hover:bg-bg-blush flex items-center gap-2"><LogOut size={14} /> Sair</button>
            </>
          ) : (
            <Link href="/login" onClick={() => setMobileOpen(false)}>
              <Button variant="primary" className="w-full mt-2">Entrar</Button>
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
