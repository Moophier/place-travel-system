import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") || "PUBLISHED"
    const featured = searchParams.get("featured") === "true"
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50)
    const tag = searchParams.get("tag")

    const where: any = { status }
    if (featured) where.featured = true
    if (tag) {
      where.tags = { some: { name: tag } }
    }

    const cards = await prisma.card.findMany({
      where,
      take: limit,
      orderBy: featured ? { createdAt: "desc" } : { score: "desc" },
      include: {
        creator: {
          select: {
            user: { select: { name: true, email: true } },
            penName: true,
          }
        },
        locations: true,
        tags: true,
        _count: { select: { orders: { where: { status: "PAID" } } } }
      }
    })

    return NextResponse.json({ cards })
  } catch (error) {
    console.error("Cards GET error:", error)
    return NextResponse.json({ error: "获取卡片失败" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 })
    }

    const creator = await prisma.creator.findUnique({
      where: { userId: session.user.id },
    })

    if (!creator || !creator.approved || !creator.subscriptionActive) {
      return NextResponse.json(
        { error: "需要激活的创作者资格才能创作卡片" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const {
      title, subtitle, bookAuthor, bookTitle, quote,
      content, price, locations, tagNames
    } = body

    if (!title || !bookAuthor || !content) {
      return NextResponse.json(
        { error: "标题、文学作者、内容必填" },
        { status: 400 }
      )
    }

    const tagConnectOrCreate = tagNames?.map((name: string) => ({
      where: { name },
      create: { name },
    })) || []

    const card = await prisma.card.create({
      data: {
        title,
        subtitle,
        bookAuthor,
        bookTitle,
        quote,
        content,
        price: price || 18,
        status: "PENDING_REVIEW",
        creatorId: session.user.id,
        locations: {
          create: locations?.map((loc: any) => ({
            name: loc.name,
            lat: loc.lat,
            lng: loc.lng,
            description: loc.description,
          })) || []
        },
        tags: { connectOrCreate: tagConnectOrCreate },
      },
      include: {
        locations: true,
        tags: true,
      }
    })

    return NextResponse.json({ success: true, card }, { status: 201 })
  } catch (error) {
    console.error("Cards POST error:", error)
    return NextResponse.json({ error: "创建卡片失败" }, { status: 500 })
  }
}
