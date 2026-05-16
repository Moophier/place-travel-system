"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"

interface AuthModalProps {
  onClose: () => void
  onSuccess?: () => void
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError("邮箱或密码错误")
    } else {
      onSuccess?.()
      onClose()
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "注册失败")
        setLoading(false)
        return
      }

      // Auto login after register
      const loginResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      setLoading(false)

      if (loginResult?.error) {
        setError("注册成功但登录失败，请手动登录")
      } else {
        onSuccess?.()
        onClose()
      }
    } catch (err) {
      setLoading(false)
      setError("网络错误")
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        <h3 className="modal-title">
          {mode === "login" ? "欢迎回到文迹" : "加入文迹"}
        </h3>
        <p className="modal-subtitle">
          {mode === "login" ? "SIGN IN TO CONTINUE" : "CREATE YOUR ACCOUNT"}
        </p>

        <form onSubmit={mode === "login" ? handleLogin : handleRegister}>
          {mode === "register" && (
            <div className="form-group">
              <label className="form-label">昵称</label>
              <input
                className="form-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="您的笔名或昵称"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">邮箱</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">密码</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "register" ? "至少6位字符" : "您的密码"}
              required
              minLength={6}
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <button
            type="submit"
            className="btn-primary"
            style={{ width: "100%", marginTop: "0.5rem" }}
            disabled={loading}
          >
            {loading ? (
              <span className="loading-dots">
                <span></span><span></span><span></span>
              </span>
            ) : mode === "login" ? "登录" : "注册"}
          </button>
        </form>

        <div className="modal-divider">或</div>

        <div style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--text-dim)" }}>
          {mode === "login" ? (
            <>
              还没有账号？{" "}
              <span className="modal-link" onClick={() => { setMode("register"); setError(""); }}>
                立即注册
              </span>
            </>
          ) : (
            <>
              已有账号？{" "}
              <span className="modal-link" onClick={() => { setMode("login"); setError(""); }}>
                直接登录
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
