import { useMemo, useState } from "react"
import { loginDoctor, saveDoctorSession } from "../../services/authApi"
import type { AppRoute } from "../../types/routes"
import { saveDoctorProfile } from "../../utils/doctorProfile"
import "./onboarding.css"

type LoginProps = {
  onNavigate: (route: AppRoute) => void
}

function DoctorLogin({ onNavigate }: LoginProps) {
  const [mobile, setMobile] = useState("")
  const [password, setPassword] = useState("")
  const [mobileError, setMobileError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [formError, setFormError] = useState("")
  const [loading, setLoading] = useState(false)

  const canSubmit = useMemo(() => /^\d{10}$/.test(mobile) && password.length >= 8, [mobile, password.length])

  function validateMobile(value: string) {
    if (!value) return "Mobile number is required."
    if (!/^\d+$/.test(value)) return "Mobile number must contain only digits."
    if (value.length !== 10) return "Mobile number must be exactly 10 digits."
    return ""
  }

  function validatePassword(value: string) {
    if (!value) return "Password is required."
    if (value.length < 8) return "Password must be at least 8 characters."
    return ""
  }

  async function handleLogin() {
    const nextMobileError = validateMobile(mobile)
    const nextPasswordError = validatePassword(password)
    setMobileError(nextMobileError)
    setPasswordError(nextPasswordError)

    if (nextMobileError || nextPasswordError) {
      setFormError("Please correct the highlighted fields.")
      return
    }

    setFormError("")
    setLoading(true)

    try {
      const session = await loginDoctor(mobile, password)
      saveDoctorSession(session)
      saveDoctorProfile({
        userId: session.userId,
        fullName: session.fullName ?? undefined,
        email: session.email ?? undefined,
        mobile: session.phone ?? mobile,
      })
      setLoading(false)
      onNavigate("dashboard")
    } catch (error) {
      setLoading(false)
      setFormError(error instanceof Error ? error.message : "Unable to login")
    }
  }

  return (
    <section className="onboard-page">
      <div className="onboard-shell">
      <header className="onboard-brand-banner">
        <span className="onboard-chip">Secure Access</span>
        <div>
          <h1>Doctor Login</h1>
          <p>Access consultations, OPD queue, and telehealth dashboard.</p>
        </div>
        <div className="onboard-steps">
          <span className="onboard-step" />
          <span className="onboard-step" />
          <span className="onboard-step" />
          <span className="onboard-step" />
        </div>
      </header>

      <section className="onboard-card onboard-form">
        <h2 className="onboard-title">Welcome Back</h2>
        <p className="onboard-subtitle">Sign in or continue doctor onboarding</p>
        <label>
          Mobile Number
          <input
            className={`onboard-input ${mobileError ? "input-error" : ""}`}
            type="tel"
            placeholder="Enter 10-digit mobile number"
            value={mobile}
            inputMode="numeric"
            maxLength={10}
            onChange={(event) => {
              const next = event.target.value.replace(/\D/g, "").slice(0, 10)
              setMobile(next)
              if (mobileError) {
                setMobileError(validateMobile(next))
              }
            }}
            onBlur={() => setMobileError(validateMobile(mobile))}
          />
          {mobileError ? <small className="onboard-error">{mobileError}</small> : null}
        </label>
        <label>
          Password
          <input
            className={`onboard-input ${passwordError ? "input-error" : ""}`}
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => {
              const next = event.target.value
              setPassword(next)
              if (passwordError) {
                setPasswordError(validatePassword(next))
              }
            }}
            onBlur={() => setPasswordError(validatePassword(password))}
          />
          {passwordError ? <small className="onboard-error">{passwordError}</small> : null}
        </label>
        {formError ? <p className="onboard-error-block">{formError}</p> : null}

        <div className="onboard-actions">
          <button type="button" className="onboard-btn" onClick={() => onNavigate("registration")} disabled={loading}>New Registration</button>
          <button type="button" className="onboard-btn primary" onClick={() => void handleLogin()} disabled={!canSubmit || loading}>
            {loading ? "Signing In..." : "Login"}
          </button>
        </div>
      </section>
      </div>
    </section>
  )
}

export default DoctorLogin
