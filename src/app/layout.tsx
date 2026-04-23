import type { Metadata } from "next"
import { Nunito } from "next/font/google"
import { Providers } from "@/components/providers"
import "./globals.css"

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Playbekids — Moda Infantil Masculina",
    template: "%s | Playbekids",
  },
  description:
    "Roupas infantis masculinas com estilo e qualidade. Atacado e varejo para todo o Brasil.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={nunito.variable}>
      <body className="bg-bg-cream text-brown-mid font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
