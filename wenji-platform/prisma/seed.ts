import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('demo123', 12)

  const creatorUser = await prisma.user.create({
    data: {
      email: 'chunyuan@wenji.literary',
      name: 'Chunyuan',
      password: hashedPassword,
      role: 'CREATOR',
      creator: {
        create: {
          penName: 'Chunyuan',
          bio: '村上春树研究者，东京文学巡礼向导',
          approved: true,
          subscriptionActive: true,
          subscriptionExpiresAt: new Date('2027-05-15'),
        }
      }
    }
  })

  const creator2 = await prisma.user.create({
    data: {
      email: 'miyazaki@wenji.literary',
      name: 'Miyazaki',
      password: hashedPassword,
      role: 'CREATOR',
      creator: {
        create: {
          penName: 'Miyazaki',
          bio: '太宰治与津轻半岛的守望者',
          approved: true,
          subscriptionActive: true,
          subscriptionExpiresAt: new Date('2027-05-15'),
        }
      }
    }
  })

  const creator3 = await prisma.user.create({
    data: {
      email: 'lemon@wenji.literary',
      name: 'Lemon',
      password: hashedPassword,
      role: 'CREATOR',
      creator: {
        create: {
          penName: 'Lemon',
          bio: '加缪的异乡人',
          approved: true,
          subscriptionActive: true,
          subscriptionExpiresAt: new Date('2027-05-15'),
        }
      }
    }
  })

  const tags = await prisma.$transaction([
    prisma.tag.create({ data: { name: '村上春树' } }),
    prisma.tag.create({ data: { name: '太宰治' } }),
    prisma.tag.create({ data: { name: '加缪' } }),
    prisma.tag.create({ data: { name: '波伏娃' } }),
    prisma.tag.create({ data: { name: '鲁迅' } }),
    prisma.tag.create({ data: { name: '日本' } }),
    prisma.tag.create({ data: { name: '法国' } }),
    prisma.tag.create({ data: { name: '中国' } }),
  ])

  const card1 = await prisma.card.create({
    data: {
      title: '《挪威的森林》东京文学巡礼',
      bookAuthor: '村上春树',
      bookTitle: '挪威的森林',
      quote: '死并不是生的对立面，而是作为生的一部分永存。',
      content: `## 路线概述

这是一条关于失去与记忆的东京散步路线。从井之头公园的黄昏开始，经过早稻田大学的旧书摊，最后在青山霊園的银杏树下结束。

## 文学坐标

1. **井之头公园** — 渡边与直子散步的湖畔
2. **早稻田大学** — 村上春树的母校，旧书摊与咖啡馆
3. **青山霊園** — 小说中的记忆之地
4. **三鹰** — 吉卜力美术馆附近的独立书店
5. **京都** — 绿子老家的原型地带

## 情感叙事

这条路线适合在深秋的黄昏出发，携带一本《挪威的森林》，在井之头公园的湖畔长椅上读第一章...`,
      price: 18,
      status: 'PUBLISHED',
      featured: true,
      score: 9847,
      salesCount: 342,
      creatorId: creatorUser.id,
      locations: {
        create: [
          { name: '井之头公园', lat: 35.7005, lng: 139.5736, description: '渡边与直子散步的湖畔' },
          { name: '早稻田大学', lat: 35.7089, lng: 139.7210, description: '村上春树的母校' },
          { name: '青山霊園', lat: 35.6575, lng: 139.7241, description: '小说中的记忆之地' },
          { name: '三鹰', lat: 35.7023, lng: 139.5595, description: '独立书店聚集地' },
          { name: '京都', lat: 35.0116, lng: 135.7681, description: '绿子老家的原型地带' },
        ]
      },
      tags: { connect: [{ id: tags[0].id }, { id: tags[5].id }] }
    }
  })

  const card2 = await prisma.card.create({
    data: {
      title: '太宰治的津轻 · 生与死的地理',
      bookAuthor: '太宰治',
      bookTitle: '人间失格',
      quote: '生而为人，我很抱歉。',
      content: `## 路线概述

津轻半岛是太宰治的精神原乡。从金木町的斜阳馆到五所川原的祭典，这条路线追踪太宰治从生到死的地理线索。

## 文学坐标

1. **津轻半岛** — 太宰治的故乡，苹果园与雪国
2. **三鹰太宰治馆** — 东京的文学纪念馆
3. **玉川上水** — 最后的河流

## 情感叙事

建议在冬季前往津轻，乘坐津轻铁道，看着窗外飘雪，阅读《津轻》...`,
      price: 18,
      status: 'PUBLISHED',
      featured: true,
      score: 7203,
      salesCount: 251,
      creatorId: creator2.id,
      locations: {
        create: [
          { name: '津轻半岛', lat: 40.8031, lng: 140.4544, description: '太宰治的故乡' },
          { name: '三鹰太宰治馆', lat: 35.7010, lng: 139.5610, description: '文学纪念馆' },
          { name: '玉川上水', lat: 35.6780, lng: 139.5400, description: '最后的河流' },
        ]
      },
      tags: { connect: [{ id: tags[1].id }, { id: tags[5].id }] }
    }
  })

  const card3 = await prisma.card.create({
    data: {
      title: '加缪的阿尔及尔 · 异乡人之城',
      bookAuthor: '加缪',
      bookTitle: '局外人',
      quote: '我知道这个世界，我并不是为了这个世界而存在。',
      content: `## 路线概述

阿尔及尔是加缪的出生地，也是《局外人》中默尔索被判死刑的精神现场。地中海的阳光与阿拉伯区的阴影构成了这条路线的双重基调。

## 文学坐标

1. **阿尔及尔老城** — 卡斯巴的阿拉伯区
2. **地中海海滩** — 默尔索开枪的海岸
3. **蒙马岱墓地** — 加缪的安息之地

## 情感叙事

建议在清晨前往卡斯巴，避开游客，在迷宫般的小巷中寻找加缪童年居住的公寓...`,
      price: 18,
      status: 'PUBLISHED',
      featured: true,
      score: 6415,
      salesCount: 198,
      creatorId: creator3.id,
      locations: {
        create: [
          { name: '阿尔及尔老城', lat: 36.7538, lng: 3.0588, description: '卡斯巴的阿拉伯区' },
          { name: '地中海海滩', lat: 36.7650, lng: 3.1700, description: '默尔索开枪的海岸' },
          { name: '蒙马岱墓地', lat: 36.7500, lng: 3.0500, description: '加缪的安息之地' },
        ]
      },
      tags: { connect: [{ id: tags[2].id }, { id: tags[6].id }] }
    }
  })

  const card4 = await prisma.card.create({
    data: {
      title: '波伏娃的巴黎左岸咖啡馆路线',
      bookAuthor: '波伏娃',
      bookTitle: '第二性',
      quote: '女人不是天生的，而是被塑造的。',
      content: `## 路线概述

从花神咖啡馆到双偶咖啡馆，这条路线追踪波伏娃与萨特的存在主义日常。

## 文学坐标

1. **花神咖啡馆** — 存在主义的诞生地
2. **双偶咖啡馆** — 波伏娃的写作桌
3. **卢森堡公园** — 《第二性》的散步思考

## 情感叙事

建议在周日上午出发，在花神咖啡馆点一杯热巧克力，坐波伏娃常坐的角落位置...`,
      price: 18,
      status: 'PUBLISHED',
      featured: false,
      score: 5188,
      salesCount: 156,
      creatorId: creatorUser.id,
      locations: {
        create: [
          { name: '花神咖啡馆', lat: 48.8534, lng: 2.3332, description: '存在主义的诞生地' },
          { name: '双偶咖啡馆', lat: 48.8520, lng: 2.3380, description: '波伏娃的写作桌' },
          { name: '卢森堡公园', lat: 48.8462, lng: 2.3372, description: '散步思考之地' },
        ]
      },
      tags: { connect: [{ id: tags[3].id }, { id: tags[6].id }] }
    }
  })

  const card5 = await prisma.card.create({
    data: {
      title: '鲁迅的绍兴 · 故乡与彷徨',
      bookAuthor: '鲁迅',
      bookTitle: '呐喊',
      quote: '希望是本无所谓有，无所谓无的。',
      content: `## 路线概述

从百草园到三味书屋，从咸亨酒店到鲁迅故居，这是一条关于童年与启蒙的绍兴散步路线。

## 文学坐标

1. **百草园** — 童年的自然乐园
2. **三味书屋** — 启蒙之地
3. **咸亨酒店** — 孔乙己的茴香豆
4. **鲁迅故居** — 家族的记忆现场

## 情感叙事

建议在春日的细雨中前往，携带一把油纸伞，在青石板路上重读《故乡》...`,
      price: 18,
      status: 'PUBLISHED',
      featured: false,
      score: 4902,
      salesCount: 142,
      creatorId: creator2.id,
      locations: {
        create: [
          { name: '百草园', lat: 30.0010, lng: 120.5850, description: '童年的自然乐园' },
          { name: '三味书屋', lat: 30.0015, lng: 120.5855, description: '启蒙之地' },
          { name: '咸亨酒店', lat: 30.0000, lng: 120.5860, description: '孔乙己的茴香豆' },
          { name: '鲁迅故居', lat: 30.0012, lng: 120.5852, description: '家族的记忆现场' },
        ]
      },
      tags: { connect: [{ id: tags[4].id }, { id: tags[7].id }] }
    }
  })

  await prisma.cardOrder.createMany({
    data: [
      { userId: creator2.id, cardId: card1.id, amount: 18, status: 'PAID', paymentId: 'mock_demo_001' },
      { userId: creator3.id, cardId: card1.id, amount: 18, status: 'PAID', paymentId: 'mock_demo_002' },
      { userId: creatorUser.id, cardId: card2.id, amount: 18, status: 'PAID', paymentId: 'mock_demo_003' },
      { userId: creator3.id, cardId: card2.id, amount: 18, status: 'PAID', paymentId: 'mock_demo_004' },
    ]
  })

  console.log('✅ Seed completed!')
  console.log('   - Users: 3 creators')
  console.log('   - Cards: 5 published')
  console.log('   - Tags: 8 tags')
  console.log('   - Orders: 4 demo orders')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
