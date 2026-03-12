import type { CSSProperties } from "react"
import { AppIcon } from "../../components/ui/icons"
import type { AppRoute } from "../../types/routes"
import "./notifications.css"

type NotificationsProps = {
  onNavigate: (route: AppRoute) => void
}

type Notice = {
  title: string
  body: string
  time: string
  unread?: boolean
  cta?: string
}

const todayNotices: Notice[] = [
  {
    title: "Profile verification is in progress",
    body: "Your KYC and license docs are under review. Expected completion in 48 minutes.",
    time: "Just now",
    unread: true,
    cta: "Open Profile",
  },
  {
    title: "New OPD request in queue",
    body: "A patient has requested OPD consultation for tomorrow.",
    time: "12 min ago",
    unread: true,
    cta: "View Requests",
  },
  {
    title: "Store price drop alert",
    body: "Pulse Oximeter and BP Monitor prices updated today.",
    time: "33 min ago",
    cta: "Open Store",
  },
]

const yesterdayNotices: Notice[] = [
  {
    title: "Wallet earnings settled",
    body: "Yesterday consultation payout is added to your wallet.",
    time: "Yesterday 7:08 PM",
  },
  {
    title: "Clinical learning module updated",
    body: "A new protocol module has been added in Learning.",
    time: "Yesterday 5:42 PM",
    cta: "Open Learning",
  },
]

function DoctorNotifications({ onNavigate }: NotificationsProps) {
  const unreadCount = todayNotices.filter((item) => item.unread).length

  function handleCta(cta?: string) {
    if (!cta) return
    if (cta === "Open Store") onNavigate("store")
    else if (cta === "Open Learning") onNavigate("learning")
    else if (cta === "Open Profile") onNavigate("settings")
    else onNavigate("appointments")
  }

  return (
    <section className="doc-notif-page">
      <header className="mobile-topbar">
        <button type="button" className="bar-icon" aria-label="back" onClick={() => onNavigate("dashboard")}>
          <AppIcon name="arrow-left" className="bar-svg" />
        </button>
        <h1>Notifications</h1>
        <div className="bar-right">
          <span className="notif-unread-chip">{unreadCount} unread</span>
        </div>
      </header>

      <main className="doc-notif-content">
        <section className="doc-live-card card-rise" style={{ "--d": "0ms" } as CSSProperties}>
          <div className="live-icon"><AppIcon name="bell" className="tiny" /></div>
          <div>
            <h3>Live Updates</h3>
            <p>Realtime platform updates are enabled for this account.</p>
          </div>
        </section>

        <section className="doc-notif-group card-rise" style={{ "--d": "35ms" } as CSSProperties}>
          <div className="doc-notif-head"><h2>Today</h2><span>Recent</span></div>
          <div className="doc-notif-list">
            {todayNotices.map((item) => (
              <article key={`${item.title}-${item.time}`} className={`doc-notif-item ${item.unread ? "unread" : ""}`}>
                <div className="dot-wrap"><i /></div>
                <div>
                  <div className="row"><h4>{item.title}</h4><small>{item.time}</small></div>
                  <p>{item.body}</p>
                  {item.cta ? (
                    <button type="button" className="notif-cta" onClick={() => handleCta(item.cta)}>
                      {item.cta}
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="doc-notif-group card-rise" style={{ "--d": "70ms" } as CSSProperties}>
          <div className="doc-notif-head"><h2>Yesterday</h2><span>Archive</span></div>
          <div className="doc-notif-list">
            {yesterdayNotices.map((item) => (
              <article key={`${item.title}-${item.time}`} className="doc-notif-item">
                <div className="dot-wrap"><i /></div>
                <div>
                  <div className="row"><h4>{item.title}</h4><small>{item.time}</small></div>
                  <p>{item.body}</p>
                  {item.cta ? (
                    <button type="button" className="notif-cta" onClick={() => handleCta(item.cta)}>
                      {item.cta}
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </section>
  )
}

export default DoctorNotifications
