import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-guard"

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfWeek = new Date(startOfToday.getTime() - now.getDay() * 86_400_000)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    revenueToday,
    revenueWeek,
    revenueMonth,
    ordersByStatus,
    recentOrders,
    customerCounts,
    lowStockSizes,
  ] = await Promise.all([
    // Receita do dia
    prisma.order.aggregate({
      where: { paymentStatus: "APPROVED", createdAt: { gte: startOfToday } },
      _sum: { total: true },
      _count: true,
    }),
    // Receita da semana
    prisma.order.aggregate({
      where: { paymentStatus: "APPROVED", createdAt: { gte: startOfWeek } },
      _sum: { total: true },
      _count: true,
    }),
    // Receita do mês
    prisma.order.aggregate({
      where: { paymentStatus: "APPROVED", createdAt: { gte: startOfMonth } },
      _sum: { total: true },
      _count: true,
    }),
    // Pedidos agrupados por status
    prisma.order.groupBy({
      by: ["status"],
      _count: true,
    }),
    // Últimos 5 pedidos
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        total: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
        _count: { select: { items: true } },
      },
    }),
    // Clientes por role
    prisma.user.groupBy({
      by: ["role"],
      _count: true,
      where: { role: { in: ["RETAIL", "WHOLESALE"] } },
    }),
    // Tamanhos com estoque baixo (≤ 3 unidades)
    prisma.productSize.findMany({
      where: { stock: { lte: 3, gt: 0 } },
      select: {
        size: true,
        stock: true,
        product: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { stock: "asc" },
      take: 10,
    }),
  ])

  return NextResponse.json({
    data: {
      revenue: {
        today: Number(revenueToday._sum.total ?? 0),
        todayOrders: revenueToday._count,
        week: Number(revenueWeek._sum.total ?? 0),
        weekOrders: revenueWeek._count,
        month: Number(revenueMonth._sum.total ?? 0),
        monthOrders: revenueMonth._count,
      },
      ordersByStatus: Object.fromEntries(
        ordersByStatus.map((o) => [o.status, o._count])
      ),
      recentOrders,
      customers: Object.fromEntries(
        customerCounts.map((c) => [c.role, c._count])
      ),
      lowStock: lowStockSizes,
    },
  })
}
