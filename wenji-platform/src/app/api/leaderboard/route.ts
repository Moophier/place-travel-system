import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50)
    const period = searchParams.get("period") || "all"

    let dateFilter = {}
    if (period === "month") {
      const d = new Date()
      d.setMonth(d.getMonth() - 1)
      dateFilter = { createdAt: { gte: d } }
    } else if (period === "week") {
      const d = new Date()
      d.setDate(d.getDate() - 7)
      dateFilter = { createdAt: { gte: d } }
    }

    const cards = await prisma.card.findMany({
      where: {
        status: "PUBLISHED",
        ...dateFilter,
      },
      take: limit,
      orderBy: [{ score: "desc" }, { salesCount: "desc" }, { createdAt: "desc" }],
      include: {
        creator: {
          select: {
            penName: true,
            user: { select: { name: true } }
          }
        },
        tags: true,
        _count: { select: { orders: { where: { status: "PAID" } } } }
      }
    })

    const formatted = cards.map((card, index) => ({
      rank: index + 1,
      id: card.id,
      title: card.title,
      subtitle: card.subtitle,
      bookAuthor: card.bookAuthor,
      creatorName: card.creator?.penName || card.creator?.user?.name || "匿名",
      createdAt: card.createdAt,
      tag: card.tags[0]?.name || card.bookAuthor,
      score: card.score + (card._count?.orders || 0) * 10,
      salesCount: card._count?.orders || 0,
    }))

    return NextResponse.json({ leaderboard: formatted })
  } catch (error) {
    console.error("Leaderboard error:", error)
    return NextResponse.json({ error: "获取榜单失败" }, { status: 500 })
  }
}
