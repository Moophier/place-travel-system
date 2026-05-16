"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession, signOut } from "next-auth/react"
import AuthModal from "@/components/AuthModal"
import CreateCardModal from "@/components/CreateCardModal"

interface Card {
  id: string
  title: string
  subtitle?: string
  bookAuthor: string
  bookTitle?: string
  quote?: string
  price: number
  locations: { name: string }[]
  tags: { name: string }[]
  creator?: { penName?: string; user?: { name?: string } }
}

interface LeaderboardItem {
  rank: number
  id: string
  title: string
  creatorName: string
  createdAt: string
  tag: string
  score: number
}

export default function Home() {
  const { data: session, status } = useSession()
  const [showAuth, setShowAuth] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [paymentType, setPaymentType] = useState<"subscribe" | "buy">("subscribe")
  const [paymentTarget, setPaymentTarget] = useState<string>("")
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([])
  const [featuredCards, setFeaturedCards] = useState<Card[]>([])
  const [toast, setToast] = useState<{ message: string; type?: "error" } | null>(null)
  const [processing, setProcessing] = useState(false)

  // 获取动态数据
  useEffect(() => {
    fetch("/api/leaderboard?limit=5")
      .then((r) => r.json())
      .then((data) => {
        if (data.leaderboard) setLeaderboard(data.leaderboard)
      })
      .catch(console.error)

    fetch("/api/cards?featured=true&limit=3")
      .then((r) => r.json())
      .then((data) => {
        if (data.cards) setFeaturedCards(data.cards)
      })
      .catch(console.error)
  }, [])

  // 滚动渐显
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible")
        })
      },
      { threshold: 0.12 }
    )
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [leaderboard, featuredCards])

  // 导航栏滚动效果
  useEffect(() => {
    const handleScroll = () => {
      const nav = document.querySelector("nav")
      if (!nav) return
      if (window.scrollY > 80) {
        nav.style.background = "rgba(13,12,10,0.97)"
      } else {
        nav.style.background = "linear-gradient(180deg, rgba(13,12,10,0.95) 0%, transparent 100%)"
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const showToast = useCallback((message: string, type?: "error") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }, [])

  const handleSubscribe = async () => {
    if (!session) {
      setShowAuth(true)
      return
    }
    setPaymentType("subscribe")
    setShowPayment(true)
  }

  const handleBuyCard = (cardId: string) => {
    if (!session) {
      setShowAuth(true)
      return
    }
    setPaymentType("buy")
    setPaymentTarget(cardId)
    setShowPayment(true)
  }

  const processPayment = async () => {
    setProcessing(true)
    try {
      const url = paymentType === "subscribe" ? "/api/payment/subscribe" : "/api/payment/buy-card"
      const body = paymentType === "subscribe" ? {} : { cardId: paymentTarget }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: "mock", ...body }),
      })

      const data = await res.json()

      if (!res.ok) {
        showToast(data.error || "支付失败", "error")
        setProcessing(false)
        return
      }

      if (data.success) {
        showToast(paymentType === "subscribe" ? "订阅成功！创作者资格已激活" : "购买成功！卡片已加入您的收藏")
        setShowPayment(false)
        // 刷新页面以更新session状态
        setTimeout(() => window.location.reload(), 1500)
      } else {
        showToast(data.message || "支付处理中", "error")
      }
    } catch (err) {
      showToast("网络错误", "error")
    }
    setProcessing(false)
  }

  const handleCreateClick = () => {
    if (!session) {
      setShowAuth(true)
      return
    }
    setShowCreate(true)
  }

  const isLoggedIn = status === "authenticated"
  const isCreator = session?.user?.isCreator && session?.user?.creatorApproved && session?.user?.subscriptionActive

  return (
    <>
      <div className="grain"></div>

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type || ""}`}>
          {toast.message}
        </div>
      )}

      {/* Modals */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showCreate && <CreateCardModal onClose={() => setShowCreate(false)} onSuccess={() => { showToast("卡片提交成功"); setShowCreate(false) }} />}
      {showPayment && (
        <div className="modal-overlay" onClick={() => setShowPayment(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowPayment(false)}>×</button>
            <h3 className="modal-title">
              {paymentType === "subscribe" ? "订阅 Design.md" : "购买卡片"}
            </h3>
            <p className="modal-subtitle">
              {paymentType === "subscribe" ? "DESIGN.MD SUBSCRIPTION" : "CONFIRM PURCHASE"}
            </p>
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <div className="price-main">{paymentType === "subscribe" ? "¥68" : "¥18"}</div>
              <div className="price-period">{paymentType === "subscribe" ? "/ 年" : "单次购买"}</div>
            </div>
            <p style={{ color: "var(--text-dim)", fontSize: "0.75rem", textAlign: "center", marginBottom: "1.5rem" }}>
              当前为模拟支付模式，点击确认即可立即完成交易
            </p>
            <button
              className="btn-primary"
              style={{ width: "100%" }}
              onClick={processPayment}
              disabled={processing}
            >
              {processing ? <span className="loading-dots"><span></span><span></span><span></span></span> : "确认支付"}
            </button>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav>
        <a className="nav-logo" href="#"><span>文迹</span>Literary Footprints</a>
        <ul className="nav-links">
          <li><a href="#how">如何运作</a></li>
          <li><a href="#roles">四方价值</a></li>
          <li><a href="#design">Design.md</a></li>
          <li><a href="#board">巡礼榜</a></li>
        </ul>
        <div className="nav-user">
          {isLoggedIn ? (
            <>
              <span>{session?.user?.name || session?.user?.email}</span>
              {isCreator && (
                <button className="nav-btn" onClick={handleCreateClick} style={{ fontSize: "0.55rem", padding: "0.45rem 1rem" }}>
                  创作卡片
                </button>
              )}
              <button className="nav-cta" onClick={() => signOut()} style={{ background: "transparent", color: "var(--gold)", border: "1px solid var(--gold-line)" }}>
                退出
              </button>
            </>
          ) : (
            <button className="nav-cta" onClick={() => setShowAuth(true)}>登录 / 注册</button>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-kanji">迹</div>
        <div className="hero-kanji">文</div>
        <div className="hero-kanji">旅</div>
        <div className="hero-rule-v"></div>
        <div className="hero-content">
          <div className="hero-eyebrow">情怀文旅资产平台</div>
          <div className="hero-title">文迹</div>
          <div className="hero-title-en">Literary Footprints</div>
          <div className="hero-divider">
            <div className="hero-divider-line"></div>
            <div className="hero-divider-diamond"></div>
            <div className="hero-divider-line right"></div>
          </div>
          <p className="hero-tagline">
            用 Design.md 书写你的文学朝圣路线<br/>
            每一张卡片，都是情感的独享资产<br/>
            守护人类共同的文化记忆
          </p>
          <div className="hero-cta-group">
            <button className="btn-primary" onClick={handleSubscribe}>获取 Design.md</button>
            <a className="btn-ghost" href="#board">探索巡礼榜</a>
          </div>
          <div className="hero-stats">
            <div>
              <div className="hero-stat-num">Design<span style={{ fontSize: "1rem" }}>.md</span></div>
              <div className="hero-stat-label">审美准入门槛</div>
            </div>
            <div>
              <div className="hero-stat-num">4</div>
              <div className="hero-stat-label">价值共生角色</div>
            </div>
            <div>
              <div className="hero-stat-num">∞</div>
              <div className="hero-stat-label">文学坐标待发现</div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-bg" id="how">
        <div className="section-wrap">
          <div className="reveal">
            <div className="section-label">运作机制 · How It Works</div>
            <h2 className="section-heading">一张卡片的<em>完整旅程</em></h2>
          </div>
          <div className="how-grid reveal">
            <div className="how-card">
              <span className="how-num">01</span>
              <span className="how-icon">📖</span>
              <div className="how-title">读者付费获取 Design.md</div>
              <p className="how-desc">订阅费筛选出真正有审美意愿的创造者。付费本身是一道情怀过滤器，维护平台内容的纯净度。</p>
            </div>
            <div className="how-card">
              <span className="how-num">02</span>
              <span className="how-icon">✦</span>
              <div className="how-title">按规范创作文旅巡礼卡片</div>
              <p className="how-desc">以 Design.md 为框架，输出文学坐标、情感叙事与实用路线，形成个人独享的文化资产。</p>
            </div>
            <div className="how-card">
              <span className="how-num">03</span>
              <span className="how-icon">🏆</span>
              <div className="how-title">卡片上榜 · 积累声望</div>
              <p className="how-desc">优质卡片进入巡礼榜，获得曝光与打榜积分。排名越高，创造者的文化影响力越强。</p>
            </div>
            <div className="how-card">
              <span className="how-num">04</span>
              <span className="how-icon">🗺</span>
              <div className="how-title">消费者购买卡片 · 真实出行</div>
              <p className="how-desc">巡礼者购买卡片作为出行指南，沿着文学坐标真实行走，触发文旅供应商的精准导流。</p>
            </div>
            <div className="how-card">
              <span className="how-num">05</span>
              <span className="how-icon">🔄</span>
              <div className="how-title">供应商联名 · 价值回流</div>
              <p className="how-desc">酒店、书店、咖啡馆等文旅供应商通过内容自然触发获得导流，反哺创造者与平台生态。</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOUR ROLES */}
      <section className="roles-section" id="roles">
        <div className="section-wrap">
          <div className="reveal roles-intro">
            <div className="section-label">四方共生 · Four Roles</div>
            <h2 className="section-heading">每个角色都<em>找到自己的价值</em></h2>
            <p>平台不是信息中介，而是一个情感资产的生态系统。创造者、消费者、供应商与平台之间形成有机的价值循环——不是单向变现，而是相互滋养。</p>
          </div>
          <div className="roles-grid reveal">
            <div className="role-card creator">
              <span className="role-badge creator">Creator · 创造者</span>
              <div className="role-title">情怀读者</div>
              <div className="role-subtitle">Literary Reader</div>
              <ul className="role-items">
                <li>用 Design.md 创作个人独享的文旅资产</li>
                <li>卡片上榜带来文化声望与影响力积累</li>
                <li>销售分成：每次被购买获得收益回流</li>
                <li>与供应商联名，实现创作变现</li>
              </ul>
            </div>
            <div className="role-card consumer">
              <span className="role-badge consumer">Consumer · 消费者</span>
              <div className="role-title">巡礼者</div>
              <div className="role-subtitle">Pilgrim Traveler</div>
              <ul className="role-items">
                <li>购买高质量文学巡礼卡片作为出行指南</li>
                <li>获得有情感温度的文旅决策参考</li>
                <li>沿卡片坐标真实行走，完成精神朝圣</li>
                <li>为优质创造者打榜，影响内容生态</li>
              </ul>
            </div>
            <div className="role-card supplier">
              <span className="role-badge supplier">Supplier · 供应商</span>
              <div className="role-title">文旅服务方</div>
              <div className="role-subtitle">Travel Service</div>
              <ul className="role-items">
                <li>通过内容自然触发获得精准高质量导流</li>
                <li>与创造者联名，提升品牌文化调性</li>
                <li>无广告式曝光，情怀用户转化率更高</li>
                <li>反哺平台生态，建立长期合作关系</li>
              </ul>
            </div>
            <div className="role-card platform">
              <span className="role-badge platform">Platform · 平台</span>
              <div className="role-title">情怀守门人</div>
              <div className="role-subtitle">Cultural Guardian</div>
              <ul className="role-items">
                <li>维护 Design.md 审美标准与平台纯净度</li>
                <li>订阅费 + 交易抽佣构成可持续收入</li>
                <li>供应商联名费用支持平台独立运营</li>
                <li>守护文学文化记忆的长期价值沉淀</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* DESIGN.MD */}
      <section className="design-section" id="design">
        <div className="section-wrap">
          <div className="design-layout">
            <div className="design-text reveal">
              <div className="section-label">准入规范 · Design.md</div>
              <h2 className="section-heading">情怀的<em>门槛</em><br/>也是质量的<em>保证</em></h2>
              <p style={{ marginTop: "1.5rem" }}>
                Design.md 不是模板，是<strong>一套审美契约</strong>。它定义了一张合格的文旅巡礼卡片应有的文学厚度、视觉规范与内容诚信标准。
              </p>
              <p>
                愿意为此付费的创造者，已经通过了第一道筛选。这保证了平台上每一张卡片都是<strong>有情感真诚度的独立创作</strong>，而非信息堆砌。
              </p>
              <p>
                付费也是一种声明：<strong>我愿意为情怀负责。</strong>
              </p>
            </div>
            <div className="reveal">
              <div className="design-price-card">
                <div className="price-main">¥ 68</div>
                <div className="price-period">/ 年 · Per Year</div>
                <ul className="price-features">
                  <li>完整 Design.md 规范文档</li>
                  <li>文学坐标验证标准与引言规范</li>
                  <li>视觉输出模板（HTML / PDF）</li>
                  <li>卡片上榜资格 · 积分体系准入</li>
                  <li>创造者社群准入与季度选题参考</li>
                </ul>
                <button className="price-btn" onClick={handleSubscribe} disabled={isCreator}>
                  {isCreator ? "您已订阅" : "申请创作资格"}
                </button>
                <p className="price-note">订阅即认同平台情怀公约</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LEADERBOARD */}
      <section className="board-section" id="board">
        <div className="section-wrap">
          <div className="reveal">
            <div className="section-label">巡礼榜 · Literary Leaderboard</div>
            <h2 className="section-heading">最受<em>巡礼者</em>青睐的卡片</h2>
          </div>
          <div className="board-preview reveal">
            <div className="board-header-row">
              <span>排名</span>
              <span>卡片信息</span>
              <span>标签</span>
              <span>热度分</span>
            </div>
            {leaderboard.length > 0 ? (
              leaderboard.map((item) => (
                <div className="board-row" key={item.id}>
                  <div className={`board-rank ${item.rank <= 3 ? "top" : ""}`}>
                    {item.rank === 1 ? "🥇" : item.rank === 2 ? "🥈" : item.rank === 3 ? "🥉" : String(item.rank).padStart(2, "0")}
                  </div>
                  <div>
                    <div className="board-card-title">{item.title}</div>
                    <div className="board-card-author">by {item.creatorName} · {new Date(item.createdAt).toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit" })}</div>
                  </div>
                  <div className="board-tag">{item.tag}</div>
                  <div className="board-score">{item.score.toLocaleString()} pts</div>
                </div>
              ))
            ) : (
              <div className="board-row" style={{ justifyContent: "center", color: "var(--text-dim)", fontSize: "0.8rem" }}>
                榜单加载中...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CARD PREVIEWS */}
      <section className="preview-section">
        <div className="section-wrap">
          <div className="reveal">
            <div className="section-label">精选卡片 · Featured Cards</div>
            <h2 className="section-heading">每一张都是<em>独立的文化坐标</em></h2>
          </div>
          <div className="cards-scroll reveal">
            {featuredCards.length > 0 ? (
              featuredCards.map((card, idx) => (
                <div className="mini-card" key={card.id}>
                  <div className="mini-card-number">No.{String(idx + 1).padStart(3, "0")}</div>
                  <div className="mini-card-book">
                    {idx === 0 ? "🌲" : idx === 1 ? "🌊" : "☀️"}
                  </div>
                  <div className="mini-card-title">{card.bookTitle || card.title}</div>
                  <div className="mini-card-author">{card.bookAuthor} · {card.creator?.penName || card.creator?.user?.name || "文迹创作者"}</div>
                  <div className="mini-card-quote">"{card.quote || "每一张卡片，都是一个人用情感与文字创造的私人资产。"}"</div>
                  <div className="mini-card-locs">
                    {card.locations?.slice(0, 5).map((loc) => (
                      <span className="mini-loc" key={loc.name}>{loc.name}</span>
                    ))}
                  </div>
                  <div className="mini-card-footer">
                    <span className="mini-card-price">¥ {card.price}</span>
                    <button className="mini-card-cta" onClick={() => handleBuyCard(card.id)}>
                      购买卡片
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", color: "var(--text-dim)", padding: "3rem", fontSize: "0.85rem" }}>
                精选卡片加载中...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="manifesto-section">
        <div className="section-wrap" style={{ textAlign: "center" }}>
          <div className="reveal">
            <div className="section-label">平台宣言 · Manifesto</div>
            <div className="manifesto-seal">
              <div className="manifesto-seal-inner">文</div>
            </div>
            <p className="manifesto-text">
              我们相信，<strong>文学不只是阅读的事</strong>。<br/>
              它应该被走进去，被感受，被以身体丈量。<br/><br/>
              每一张巡礼卡片，都是一个人<strong>用情感与文字创造的私人资产</strong>，<br/>
              也是人类共同文化记忆的一个坐标。<br/><br/>
              我们收取情怀的门槛费，<strong>不为盈利，为了纯净</strong>。<br/>
              让真正热爱的人，在这里找到彼此。
            </p>
            <button className="btn-primary" style={{ display: "inline-block", marginBottom: "1rem" }} onClick={handleSubscribe}>
              加入文迹
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-brand"><span>文迹</span>Literary Footprints</div>
        <ul className="footer-links">
          <li><a href="#">关于平台</a></li>
          <li><a href="#">创作规范</a></li>
          <li><a href="#">供应商合作</a></li>
          <li><a href="#">联系我们</a></li>
        </ul>
        <div className="footer-copy">© 2026 Literary Footprints · 守护人类共同的文化记忆</div>
      </footer>
    </>
  )
}
