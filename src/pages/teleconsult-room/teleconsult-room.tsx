import { useEffect, useMemo, useRef, useState } from 'react'
import { AppIcon } from '../../components/ui/icons'
import { createTeleconsultSession, joinTeleconsultSession, type TeleconsultRtcPayload } from '../../services/teleconsultApi'
import type { AppRoute } from '../../types/routes'
import { getDoctorProfile } from '../../utils/doctorProfile'
import './teleconsult-room.css'

type TeleconsultRoomProps = {
  onNavigate: (route: AppRoute) => void
}

type TeleconsultCase = {
  id: string
  name: string
  initials: string
}

type Phase = 'connecting' | 'live' | 'error' | 'ended'

const CASE_STORAGE_KEY = 'doctor:teleconsultCase'
const ZEGO_PREBUILT_SDK_URL = 'https://unpkg.com/@zegocloud/zego-uikit-prebuilt/zego-uikit-prebuilt.js'
let zegoPrebuiltLoadingPromise: Promise<void> | null = null

function readCase(): TeleconsultCase {
  try {
    const raw = window.sessionStorage.getItem(CASE_STORAGE_KEY)
    if (!raw) return { id: 'APT-1', name: 'Patient', initials: 'PT' }
    const parsed = JSON.parse(raw) as Partial<TeleconsultCase>
    return {
      id: parsed.id ?? 'APT-1',
      name: parsed.name ?? 'Patient',
      initials: parsed.initials ?? 'PT',
    }
  } catch {
    return { id: 'APT-1', name: 'Patient', initials: 'PT' }
  }
}

async function loadZegoPrebuiltSdk() {
  const sdk = (window as unknown as { ZegoUIKitPrebuilt?: any }).ZegoUIKitPrebuilt
  if (sdk) return sdk

  if (!zegoPrebuiltLoadingPromise) {
    zegoPrebuiltLoadingPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>("script[data-zego-prebuilt='true']")
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(), { once: true })
        existingScript.addEventListener('error', () => reject(new Error('Failed to load Zego prebuilt SDK')), { once: true })
        return
      }

      const script = document.createElement('script')
      script.src = ZEGO_PREBUILT_SDK_URL
      script.async = true
      script.dataset.zegoPrebuilt = 'true'
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Zego prebuilt SDK'))
      document.body.appendChild(script)
    })
  }

  await zegoPrebuiltLoadingPromise
  const loaded = (window as unknown as { ZegoUIKitPrebuilt?: any }).ZegoUIKitPrebuilt
  if (!loaded) throw new Error('Zego prebuilt SDK unavailable')
  return loaded
}

function TeleconsultRoom({ onNavigate }: TeleconsultRoomProps) {
  const [phase, setPhase] = useState<Phase>('connecting')
  const [error, setError] = useState('')
  const [helperMessage, setHelperMessage] = useState('Joining your consultation room...')
  const [reconnectNonce, setReconnectNonce] = useState(0)
  const zegoContainerRef = useRef<HTMLDivElement | null>(null)
  const zegoTemplateInstanceRef = useRef<any>(null)
  const retryCountRef = useRef(0)
  const currentCase = useMemo(() => readCase(), [])
  const profile = getDoctorProfile()
  const doctorName = profile.fullName ?? 'Doctor'
  const doctorId = profile.userId ?? (profile.mobile ?? 'doctor-demo').replace(/\s+/g, '')

  useEffect(() => {
    let isMounted = true

    async function startZegoTemplateCall(rtc: TeleconsultRtcPayload) {
      const appId = Number(rtc.appId)
      if (!appId || !rtc.token) {
        throw new Error('Invalid Zego credentials from backend')
      }

      const container = zegoContainerRef.current
      if (!container) {
        throw new Error('Meeting container unavailable')
      }

      const ZegoUIKitPrebuilt = await loadZegoPrebuiltSdk()
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
        appId,
        rtc.token,
        rtc.channelName,
        rtc.userId,
        doctorName,
      )

      const zp = ZegoUIKitPrebuilt.create(kitToken)
      zegoTemplateInstanceRef.current = zp
      setPhase('live')
      zp.joinRoom({
        container,
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
        },
        layout: ZegoUIKitPrebuilt.AutoLayout,
        showPreJoinView: false,
        turnOnMicrophoneWhenJoining: true,
        turnOnCameraWhenJoining: true,
        autoHideFooter: false,
        showLeaveRoomConfirmDialog: false,
        showMyCameraToggleButton: true,
        showMyMicrophoneToggleButton: true,
        showAudioVideoSettingsButton: false,
        showTextChat: true,
        showUserList: false,
        showRoomDetailsButton: false,
        showMoreButton: false,
        showLayoutButton: false,
        showScreenSharingButton: false,
        maxUsers: 2,
        onLeaveRoom: () => {
          setPhase('ended')
        },
      })
    }

    async function bootstrap() {
      try {
        setPhase('connecting')
        setError('')
        setHelperMessage('Joining your consultation room...')

        const storageSessionKey = `doctor:teleconsult:session:${currentCase.id}`
        let sessionId = window.sessionStorage.getItem(storageSessionKey) ?? ''

        if (!sessionId) {
          const created = await createTeleconsultSession({
            companyId: import.meta.env.VITE_COMPANY_ID ?? 'hcltech',
            employeeId: `employee-${currentCase.initials.toLowerCase()}`,
            doctorId,
            appointmentId: currentCase.id,
            preferredProvider: 'zego',
          })
          sessionId = created.sessionId
          window.sessionStorage.setItem(storageSessionKey, sessionId)
        }

        let joined
        try {
          joined = await joinTeleconsultSession(sessionId, {
            participantType: 'doctor',
            participantId: doctorId,
            preferredProvider: 'zego',
          })
        } catch {
          joined = await joinTeleconsultSession(sessionId, {
            participantType: 'employee',
            participantId: doctorId,
            preferredProvider: 'zego',
          })
        }

        if (!isMounted) return
        if (joined.rtc.provider !== 'zego') {
          throw new Error('Active provider is not Zego for this session')
        }
        await startZegoTemplateCall(joined.rtc)
      } catch (err) {
        if (!isMounted) return
        if (retryCountRef.current < 4) {
          retryCountRef.current += 1
          setPhase('connecting')
          setHelperMessage('Preparing room. Retrying automatically...')
          window.setTimeout(() => {
            if (isMounted) void bootstrap()
          }, 1200)
          return
        }
        setPhase('error')
        setError(err instanceof Error ? err.message : 'Unable to connect right now. Please tap retry.')
      }
    }

    retryCountRef.current = 0
    void bootstrap()
    return () => {
      isMounted = false
      if (zegoTemplateInstanceRef.current) {
        try {
          zegoTemplateInstanceRef.current.destroy()
        } catch {
          // ignore cleanup error
        }
        zegoTemplateInstanceRef.current = null
      }
      if (zegoContainerRef.current) {
        zegoContainerRef.current.innerHTML = ''
      }
    }
  }, [currentCase.id, currentCase.initials, doctorId, doctorName, onNavigate, reconnectNonce])

  return (
    <section className={`tele-room-page ${phase === 'live' ? 'live' : ''}`}>
      {phase !== 'live' ? (
        <header className="mobile-topbar tele-room-topbar">
          <button type="button" className="bar-icon" aria-label="back" onClick={() => onNavigate('appointments')}>
            <AppIcon name="arrow-left" className="bar-svg" />
          </button>
          <h1>Live Consultation</h1>
          <div className="bar-right">
            <span className="patient-chip">{currentCase.name}</span>
          </div>
        </header>
      ) : null}

      <main className="tele-room-content">
        {phase === 'connecting' ? (
          <section className="tele-room-status">
            <h3>Connecting secure room</h3>
            <p>{helperMessage} ({currentCase.id})</p>
          </section>
        ) : null}

        {phase === 'error' ? (
          <section className="tele-room-status error">
            <h3>Unable to start consultation</h3>
            <p>{error}</p>
            <button type="button" className="retry-btn" onClick={() => setReconnectNonce((prev) => prev + 1)}>
              Retry
            </button>
          </section>
        ) : null}

        <div ref={zegoContainerRef} className="zego-room-container" />

        {phase === 'ended' ? (
          <section className="tele-room-complete-sheet">
            <h3>Consultation ended</h3>
            <p>Rejoin the room or mark this consultation complete and continue to prescription.</p>
            <div className="tele-room-complete-actions">
              <button type="button" className="ghost-complete-btn" onClick={() => setReconnectNonce((prev) => prev + 1)}>
                Rejoin
              </button>
              <button type="button" className="retry-btn" onClick={() => onNavigate('teleconsult-prescription')}>
                Mark Complete
              </button>
            </div>
          </section>
        ) : null}
      </main>
    </section>
  )
}

export default TeleconsultRoom
