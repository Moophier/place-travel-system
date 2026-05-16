import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST /api/payment/buy-card
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 })
    }

    const { cardId, paymentMethod = "mock" } = await req.json()
    if (!cardId) {
      return NextResponse.json({ error: "卡片ID必填" }, { status: 400 })
    }

    const card = await prisma.card.findUnique({
      where: { id: cardId, status: "PUBLISHED" },
      include: { creator: true },
    })

    if (!card) {
      return NextResponse.json({ error: "卡片不存在或未上架" }, { status: 404 })
    }

    // 检查是否已购买
    const existingOrder = await prisma.cardOrder.findUnique({
      where: {
        userId_cardId: {
          userId: session.user.id,
          cardId,
        }
      }
    })

    if (existingOrder?.status === "PAID") {
      return NextResponse.json({ error: "您已购买此卡片" }, { status: 409 })
    }

    if (paymentMethod === "mock" || process.env.PAYMENT_MODE === "mock") {
      // 模拟支付成功
      const order = await prisma.cardOrder.upsert({
        where: {
          userId_cardId: {
            userId: session.user.id,
            cardId,
          }
        },
        update: {
          status: "PAID",
          amount: card.price,
          paymentId: `mock_${Date.now()}`,
        },
        create: {
          userId: session.user.id,
          cardId,
          amount: card.price,
          status: "PAID",
          paymentId: `mock_${Date.now()}`,
        },
      })

      // 增加卡片销量与积分
      await prisma.card.update({
        where: { id: cardId },
        data: {
          salesCount: { increment: 1 },
          score: { increment: 10 },
        },
      })

      // 创作者收益（平台抽佣后）
      const platformFee = parseInt(process.env.PLATFORM_FEE_PERCENT || "20")
      const creatorShare = (100 - platformFee) / 100
      const earnings = Number(card.price) * creatorShare

      if (card.creatorId) {
        await prisma.creator.update({
          where: { userId: card.creatorId },
          data: {
            totalEarnings: { increment: earnings },
          },
        })
      }

      return NextResponse.json({
        success: true,
        message: "购买成功",
        order,
      })
    }

    // 真实支付：创建待支付订单
    const pendingOrder = await prisma.cardOrder.upsert({
      where: {
        userId_cardId: {
          userId: session.user.id,
          cardId,
        }
      },
      update: {
        status: "PENDING",
        amount: card.price,
      },
      create: {
        userId: session.user.id,
        cardId,
        amount: card.price,
        status: "PENDING",
      },
    })

    return NextResponse.json({
      success: false,
      message: "真实支付接入需配置对应密钥",
      order: pendingOrder,
    })

  } catch (error) {
    console.error("Buy card error:", error)
    return NextResponse.json({ error: "购买失败" }, { status: 500 })
  }
}
