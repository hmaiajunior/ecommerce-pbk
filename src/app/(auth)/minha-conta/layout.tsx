import { AccountNav } from "@/components/account/AccountNav"

export default function ContaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-4 md:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-[220px] shrink-0">
          <div className="bg-white rounded-card shadow-[var(--shadow-card)] p-3">
            <AccountNav />
          </div>
        </aside>

        {/* Conteúdo */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
