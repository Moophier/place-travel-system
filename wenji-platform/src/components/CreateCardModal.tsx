"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"

interface CreateCardModalProps {
  onClose: () => void
  onSuccess?: () => void
}

export default function CreateCardModal({ onClose, onSuccess }: CreateCardModalProps) {
  const { data: session } = useSession()
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [bookAuthor, setBookAuthor] = useState("")
  const [bookTitle, setBookTitle] = useState("")
  const [quote, setQuote] = useState("")
  const [content, setContent] = useState("")
  const [price, setPrice] = useState("18")
  const [tagInput, setTagInput] = useState("")
  const [locations, setLocations] = useState([{ name: "", lat: "", lng: "", description: "" }])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")

  const addLocation = () => {
    setLocations([...locations, { name: "", lat: "", lng: "", description: "" }])
  }

  const updateLocation = (index: number, field: string, value: string) => {
    const updated = [...locations]
    updated[index] = { ...updated[index], [field]: value }
    setLocations(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const tagNames = tagInput.split(/[,，]/).map(t => t.trim()).filter(Boolean)
    const validLocations = locations.filter(l => l.name.trim())

    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle,
          bookAuthor,
          bookTitle,
          quote,
          content,
          price: parseFloat(price) || 18,
          locations: validLocations,
          tagNames,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "提交失败")
        setLoading(false)
        return
      }

      setSuccess("卡片已提交审核，通过后将上架展示")
      setLoading(false)
      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 2000)
    } catch (err) {
      setLoading(false)
      setError("网络错误")
    }
  }

  const isCreator = session?.user?.isCreator && session?.user?.creatorApproved && session?.user?.subscriptionActive

  if (!isCreator) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>×</button>
          <h3 className="modal-title">创作权限不足</h3>
          <p className="modal-subtitle">CREATOR ACCESS REQUIRED</p>
          <p style={{ color: "var(--text-dim)", fontSize: "0.85rem", lineHeight: "1.8", marginBottom: "1.5rem" }}>
            您需要满足以下条件才能创作卡片：<br/>
            1. 购买 Design.md 年度订阅（¥68/年）<br/>
            2. 通过平台创作者资格审核<br/>
            3. 订阅状态处于有效期内
          </p>
          <button className="btn-primary" style={{ width: "100%" }} onClick={onClose}>
            了解 Design.md
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "640px" }}>
        <button className="modal-close" onClick={onClose}>×</button>

        <h3 className="modal-title">创作巡礼卡片</h3>
        <p className="modal-subtitle">CREATE LITERARY CARD</p>

        {success ? (
          <div className="form-success">{success}</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">卡片标题 *</label>
              <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="如：《挪威的森林》东京文学巡礼" required />
            </div>

            <div className="form-group">
              <label className="form-label">副标题</label>
              <input className="form-input" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="补充说明" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">文学作者 *</label>
                <input className="form-input" value={bookAuthor} onChange={(e) => setBookAuthor(e.target.value)} placeholder="如：村上春树" required />
              </div>
              <div className="form-group">
                <label className="form-label">作品名</label>
                <input className="form-input" value={bookTitle} onChange={(e) => setBookTitle(e.target.value)} placeholder="如：挪威的森林" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">文学引言</label>
              <input className="form-input" value={quote} onChange={(e) => setQuote(e.target.value)} placeholder="选取作品中最能代表此行的一句" />
            </div>

            <div className="form-group">
              <label className="form-label">内容正文 *</label>
              <textarea className="form-textarea" value={content} onChange={(e) => setContent(e.target.value)} placeholder="按 Design.md 规范书写完整的巡礼路线、情感叙事与文学坐标..." required />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">价格 (¥)</label>
                <input className="form-input" type="number" value={price} onChange={(e) => setPrice(e.target.value)} min="1" max="999" />
              </div>
              <div className="form-group">
                <label className="form-label">标签（逗号分隔）</label>
                <input className="form-input" value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="村上春树, 日本, 东京" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">文学坐标</label>
              {locations.map((loc, idx) => (
                <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 2fr", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <input className="form-input" placeholder="地点名称" value={loc.name} onChange={(e) => updateLocation(idx, "name", e.target.value)} />
                  <input className="form-input" placeholder="纬度" value={loc.lat} onChange={(e) => updateLocation(idx, "lat", e.target.value)} />
                  <input className="form-input" placeholder="经度" value={loc.lng} onChange={(e) => updateLocation(idx, "lng", e.target.value)} />
                  <input className="form-input" placeholder="描述" value={loc.description} onChange={(e) => updateLocation(idx, "description", e.target.value)} />
                </div>
              ))}
              <button type="button" className="btn-ghost" style={{ marginTop: "0.5rem", fontSize: "0.6rem", padding: "0.5rem 1rem" }} onClick={addLocation}>
                + 添加坐标
              </button>
            </div>

            {error && <div className="form-error">{error}</div>}

            <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "0.5rem" }} disabled={loading}>
              {loading ? <span className="loading-dots"><span></span><span></span><span></span></span> : "提交审核"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
