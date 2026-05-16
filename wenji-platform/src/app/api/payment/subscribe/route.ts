import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST /api/payment/subscribe
// 创建 Design.md 订阅订单（模拟支付 / 真实支付）
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 })
    }

    const { paymentMethod = "mock" } = await req.json()
    const userId = session.user.id
    const amount = 68

    // 检查是否已有有效订阅
    const existing = await prisma.subscription.findFirst({
      where: {
        userId,
        type: "DESIGN_MD",
        status: "ACTIVE",
        expiresAt: { gt: new Date() },
      },
    })

    if (existing) {
      return NextResponse.json({ error: "您已拥有有效订阅" }, { status: 409 })
    }

    let subscription

    if (paymentMethod === "mock" || process.env.PAYMENT_MODE === "mock") {
      // 模拟支付：直接成功
      const expiresAt = new Date()
      expiresAt.setFullYear(expiresAt.getFullYear() + 1)

      subscription = await prisma.subscription.create({
        data: {
          userId,
          type: "DESIGN_MD",
          status: "ACTIVE",
          amount,
          expiresAt,
          paymentId: `mock_${Date.now()}`,
        },
      })

      // 激活创作者资格（如果不存在则创建）
      await prisma.creator.upsert({
        where: { userId },
        update: {
          subscriptionActive: true,
          subscriptionExpiresAt: expiresAt,
        },
        create: {
          userId,
          subscriptionActive: true,
          subscriptionExpiresAt: expiresAt,
          approved: false, // 仍需人工审核
        },
      })

      return NextResponse.json({
        success: true,
        message: "模拟支付成功，订阅已激活（需等待创作者审核）",
        subscription,
      })
    }

    // 真实支付：创建待支付订单，返回支付参数
    // 此处预留微信/支付宝/Stripe接入点
    return NextResponse.json({
      success: false,
      message: "真实支付接入需配置对应密钥",
      order: {
        userId,
        amount,
        product: "DESIGN_MD_YEARLY",
        createdAt: new Date(),
      }
    })

  } catch (error) {
    console.error("Subscribe error:", error)
    return NextResponse.json({ error: "订阅失败" }, { status: 500 })
  }
}
