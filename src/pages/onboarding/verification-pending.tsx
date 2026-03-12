import { useEffect, useState } from "react"
import type { AppRoute } from "../../types/routes"
import { saveDoctorProfile } from "../../utils/doctorProfile"
import "./onboarding.css"

type VerificationPendingProps = {
  onNavigate: (route: AppRoute) => void
}

function formatTime(totalSeconds: number) {
  const safe = Math.max(totalSeconds, 0)
  const minutes = String(Math.floor(safe / 60)).padStart(2, "0")
  const seconds = String(safe % 60).padStart(2, "0")
  return `${minutes}:${seconds}`
}

function VerificationPending({ onNavigate }: VerificationPendingProps) {
  const [secondsLeft, setSecondsLeft] = useState(48 * 60)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <section className="onboard-page">
      <div className="onboard-shell">
        <header className="onboard-brand-banner">
          <span className="onboard-chip">Verification in Progress</span>
          <div>
            <h1>Profile Submitted</h1>
            <p>Your KYC and license documents are under review. Great job completing onboarding.</p>
          </div>
        </header>

        <section className="onboard-card onboard-form">
          <div className="onboard-celebrate">Profile submitted successfully. You are all set.</div>
          <h2 className="onboard-title">Please wait for approval</h2>
          <p className="onboard-subtitle">
            Review can take up to 48 minutes. You can continue to dashboard now with limited access until verification.
          </p>
          <p className="onboard-note">Estimated wait time: {formatTime(secondsLeft)}</p>
          <div className="onboard-actions">
            <button type="button" className="onboard-btn" onClick={() => onNavigate("login")}>
              Continue to Login
            </button>
            <button
              type="button"
              className="onboard-btn primary"
              onClick={() => {
                saveDoctorProfile({ verificationStatus: "unverified" })
                onNavigate("dashboard")
              }}
            >
              Open Dashboard
            </button>
          </div>
        </section>
      </div>
    </section>
  )
}

export default VerificationPending
