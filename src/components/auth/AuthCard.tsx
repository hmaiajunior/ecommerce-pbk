import Image from "next/image"
import Link from "next/link"

type Props = {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export function AuthCard({ title, subtitle, children }: Props) {
  return (
    <div className="relative min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Blobs decorativos */}
      <div className="pbk-blob w-96 h-96 bg-primary opacity-[0.07] -top-24 -right-24" />
      <div className="pbk-blob w-80 h-80 bg-accent opacity-[0.10] -bottom-20 -left-20" />

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="mb-4">
            <div className="w-[68px] h-[68px] rounded-full overflow-hidden bg-bg-blush shadow-[var(--shadow-logo)] transition-transform hover:scale-105">
              <Image
                src="/logo.jpeg"
                alt="Playbekids"
                width={68}
                height={68}
                className="object-cover object-[50%_38%] w-full h-full"
                priority
              />
            </div>
          </Link>
          <h1 className="font-black text-[26px] text-brown-dark">{title}</h1>
          {subtitle && (
            <p className="font-semibold text-sm text-brown-muted mt-1 text-center leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Card */}
        <div className="bg-white rounded-card shadow-[var(--shadow-card)] border border-bg-nude p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
