import { useState, type CSSProperties } from 'react'
import { AppIcon } from '../../components/ui/icons'
import type { AppRoute } from '../../types/routes'
import './patients.css'

type PatientsProps = {
  onNavigate: (route: AppRoute) => void
}

type PatientSource = 'manual' | 'astikan'

type PatientItem = {
  initials: string
  name: string
  age: number
  source: PatientSource
  phone?: string
  company?: string
  lastVisit: string
  visits: number
  issue: string
}

type PatientsScreen = 'list' | 'add' | 'detail'

type PastAppointment = {
  date: string
  type: 'Teleconsultation' | 'OPD'
  concern: string
  outcome: string
}

type PrescriptionItem = {
  medicine: string
  dosage: string
  duration: string
}

type PatientDetail = {
  vitals: string[]
  riskTag: string
  nextReview: string
  pastAppointments: PastAppointment[]
  prescriptions: PrescriptionItem[]
}

const initialPatients: PatientItem[] = [
  { initials: 'RS', name: 'Rajesh Sharma', age: 45, phone: '9876543210', source: 'manual', company: 'Tech Corp India', lastVisit: '2/20/2026', visits: 8, issue: 'Hypertension' },
  { initials: 'PP', name: 'Priya Patel', age: 32, phone: '9988776655', source: 'astikan', lastVisit: '2/24/2026', visits: 3, issue: 'Migraine' },
  { initials: 'AK', name: 'Amit Kumar', age: 28, phone: '9123456780', source: 'manual', company: 'Startup Inc', lastVisit: '2/25/2026', visits: 12, issue: 'Diabetes Type 2' },
  { initials: 'SR', name: 'Sneha Reddy', age: 38, phone: '9012345678', source: 'astikan', lastVisit: '2/22/2026', visits: 5, issue: 'Follow-up' },
]

const patientDetails: Record<string, PatientDetail> = {
  'Rajesh Sharma': {
    vitals: ['BP 148/94', 'Pulse 82', 'BMI 27.4'],
    riskTag: 'Needs BP stabilization',
    nextReview: '12 Mar, 10:30 AM',
    pastAppointments: [
      { date: '20 Feb 2026', type: 'Teleconsultation', concern: 'Hypertension review', outcome: 'Medication adjusted and salt restriction advised' },
      { date: '11 Feb 2026', type: 'OPD', concern: 'Stress headaches', outcome: 'BP monitoring and ECG referral recommended' },
    ],
    prescriptions: [
      { medicine: 'Amlodipine 5mg', dosage: '1 tab after breakfast', duration: '30 days' },
      { medicine: 'Pantoprazole 40mg', dosage: '1 tab before breakfast', duration: '10 days' },
    ],
  },
  'Priya Patel': {
    vitals: ['Pulse 76', 'SpO2 99%', 'Sleep score 6/10'],
    riskTag: 'Migraine trigger monitoring',
    nextReview: '10 Mar, 12:00 PM',
    pastAppointments: [
      { date: '24 Feb 2026', type: 'OPD', concern: 'Migraine review', outcome: 'Sleep hygiene and trigger chart shared' },
      { date: '07 Feb 2026', type: 'Teleconsultation', concern: 'Acute headache', outcome: 'SOS medication and hydration advice' },
    ],
    prescriptions: [
      { medicine: 'Sumatriptan 50mg', dosage: 'SOS for severe attack', duration: '15 days' },
      { medicine: 'Magnesium supplement', dosage: '1 tab at night', duration: '30 days' },
    ],
  },
  'Amit Kumar': {
    vitals: ['FBS 168', 'Weight 82 kg', 'BP 132/86'],
    riskTag: 'Sugar management in focus',
    nextReview: '14 Mar, 09:00 AM',
    pastAppointments: [
      { date: '25 Feb 2026', type: 'Teleconsultation', concern: 'Diabetes consult', outcome: 'Diet and exercise correction initiated' },
      { date: '13 Feb 2026', type: 'OPD', concern: 'Low energy episodes', outcome: 'HbA1c advised and metformin continued' },
    ],
    prescriptions: [
      { medicine: 'Metformin 500mg', dosage: '1 tab twice daily', duration: '60 days' },
      { medicine: 'Vitamin B12', dosage: '1 tab after lunch', duration: '30 days' },
    ],
  },
  'Sneha Reddy': {
    vitals: ['Temp 98.4F', 'Pulse 80', 'Pain score 3/10'],
    riskTag: 'Post-op monitoring',
    nextReview: '09 Mar, 04:00 PM',
    pastAppointments: [
      { date: '22 Feb 2026', type: 'OPD', concern: 'Post-op check', outcome: 'Wound healing normal and mobility advised' },
      { date: '15 Feb 2026', type: 'Teleconsultation', concern: 'Pain follow-up', outcome: 'Medication tapered and rest suggested' },
    ],
    prescriptions: [
      { medicine: 'Paracetamol 650mg', dosage: '1 tab SOS', duration: '5 days' },
      { medicine: 'Antibiotic course', dosage: '1 tab twice daily', duration: '7 days' },
    ],
  },
}

function Patients({ onNavigate }: PatientsProps) {
  const [patients, setPatients] = useState(initialPatients)
  const [screen, setScreen] = useState<PatientsScreen>('list')
  const [selectedPatient, setSelectedPatient] = useState<PatientItem | null>(null)
  const [notice, setNotice] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    phone: '',
    issue: '',
    company: '',
  })

  function updateField(field: keyof typeof newPatient, value: string) {
    setNewPatient((prev) => ({ ...prev, [field]: value }))
  }

  function addPatient() {
    if (!newPatient.name.trim() || !newPatient.age.trim() || !newPatient.issue.trim()) return

    const name = newPatient.name.trim()
    const initials = name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')

    setPatients((prev) => [
      {
        initials: initials || 'NP',
        name,
        age: Number(newPatient.age) || 0,
        phone: newPatient.phone.trim(),
        source: 'manual',
        company: newPatient.company.trim(),
        lastVisit: 'Added just now',
        visits: 0,
        issue: newPatient.issue.trim(),
      },
      ...prev,
    ])
    setNewPatient({ name: '', age: '', phone: '', issue: '', company: '' })
    setScreen('list')
    setNotice('Patient added successfully in panel.')
  }

  const detail = selectedPatient ? patientDetails[selectedPatient.name] : null
  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  )

  function openPatientDetail(patient: PatientItem) {
    setSelectedPatient(patient)
    setScreen('detail')
  }

  return (
    <section className="patients-page">
      <header className="mobile-topbar">
        <button type="button" className="bar-icon" aria-label="back" onClick={() => (screen === 'add' || screen === 'detail' ? setScreen('list') : onNavigate('dashboard'))}><AppIcon name="arrow-left" className="bar-svg" /></button>
        <h1>{screen === 'add' ? 'Add Patient' : screen === 'detail' ? 'Patient Profile' : 'Patients'}</h1>
        <div className="bar-right">
          <button type="button" className="bar-icon" aria-label="notifications"><AppIcon name="bell" className="bar-svg" /><span className="dot">3</span></button>
        </div>
      </header>

      <main className="patients-content">
        {screen === 'list' && notice ? (
          <section className="patient-notice card-rise" style={{ '--d': '0ms' } as CSSProperties}>
            {notice}
          </section>
        ) : null}

        {screen === 'detail' && selectedPatient && detail ? (
          <section className="patient-detail-screen">
            <section className="patient-detail-hero card-rise" style={{ '--d': '0ms' } as CSSProperties}>
              <div className="detail-avatar">{selectedPatient.initials}</div>
              <div className="detail-copy">
                <span className={`pill ${selectedPatient.source === 'manual' ? 'manual' : 'astikan'}`}>{selectedPatient.source === 'manual' ? 'Doctor Added' : 'Astikan Online'}</span>
                <h2>{selectedPatient.name}</h2>
                <p>{selectedPatient.age} years • {selectedPatient.phone || 'No phone added'}</p>
                <div className="detail-vitals">
                  {detail.vitals.map((item) => <span key={item}>{item}</span>)}
                </div>
              </div>
            </section>

            <section className="patient-summary-grid card-rise" style={{ '--d': '35ms' } as CSSProperties}>
              <article>
                <small>Current concern</small>
                <strong>{selectedPatient.issue}</strong>
              </article>
              <article>
                <small>Risk flag</small>
                <strong>{detail.riskTag}</strong>
              </article>
              <article>
                <small>Visits</small>
                <strong>{selectedPatient.visits} total</strong>
              </article>
              <article>
                <small>Next review</small>
                <strong>{detail.nextReview}</strong>
              </article>
            </section>

            <section className="timeline-card card-rise" style={{ '--d': '70ms' } as CSSProperties}>
              <div className="section-head">
                <h3>Past Appointments</h3>
                <span>Clinical history</span>
              </div>
              <div className="timeline-list">
                {detail.pastAppointments.map((appointment) => (
                  <article key={`${appointment.date}-${appointment.concern}`} className="timeline-item">
                    <div className="timeline-icon"><AppIcon name="calendar" className="tiny" /></div>
                    <div>
                      <div className="timeline-top">
                        <strong>{appointment.concern}</strong>
                        <span>{appointment.date}</span>
                      </div>
                      <p>{appointment.type}</p>
                      <small>{appointment.outcome}</small>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="prescription-card card-rise" style={{ '--d': '105ms' } as CSSProperties}>
              <div className="section-head">
                <h3>Prescriptions Given</h3>
                <span>Recent treatment</span>
              </div>
              <div className="prescription-list">
                {detail.prescriptions.map((item) => (
                  <article key={item.medicine} className="prescription-item">
                    <div className="prescription-icon"><AppIcon name="bottle" className="tiny" /></div>
                    <div>
                      <strong>{item.medicine}</strong>
                      <p>{item.dosage}</p>
                    </div>
                    <span>{item.duration}</span>
                  </article>
                ))}
              </div>
            </section>

            <section className="book-appointment-bar card-rise" style={{ '--d': '140ms' } as CSSProperties}>
              <div>
                <small>Ready for follow-up</small>
                <strong>Book next appointment</strong>
              </div>
              <button type="button" className="book-appointment-btn" onClick={() => onNavigate('appointments')}>
                <AppIcon name="calendar" className="tiny" /> Book Appointment
              </button>
            </section>
          </section>
        ) : screen === 'add' ? (
          <section className="add-patient-screen card-rise" style={{ '--d': '0ms' } as CSSProperties}>
            <div className="add-screen-hero">
              <div>
                <span className="add-screen-kicker">Astikan Care</span>
                <h2>Add patient information</h2>
                <p>Create a direct patient record for clinic follow-ups, prescriptions, and appointment continuity.</p>
              </div>
              <div className="hero-orb">
                <AppIcon name="patients" className="hero-orb-icon" />
              </div>
            </div>

            <section className="add-patient-card">
              <div className="patient-form-head">
                <h3>Patient details</h3>
                <span className="mini-chip">Clinic entry</span>
              </div>
              <label>
                Patient Name
                <input value={newPatient.name} onChange={(event) => updateField('name', event.target.value)} placeholder="Enter full name" />
              </label>
              <div className="add-patient-grid">
                <label>
                  Age
                  <input value={newPatient.age} onChange={(event) => updateField('age', event.target.value.replace(/[^\d]/g, ''))} placeholder="Enter age" />
                </label>
                <label>
                  Phone Number
                  <input value={newPatient.phone} onChange={(event) => updateField('phone', event.target.value.replace(/[^\d]/g, '').slice(0, 10))} placeholder="Enter phone number" />
                </label>
              </div>
              <label>
                Primary Issue
                <input value={newPatient.issue} onChange={(event) => updateField('issue', event.target.value)} placeholder="Enter concern" />
              </label>
              <label>
                Company
                <input value={newPatient.company} onChange={(event) => updateField('company', event.target.value)} placeholder="Optional company" />
              </label>
              <div className="add-patient-actions">
                <button type="button" className="ghost-btn" onClick={() => setScreen('list')}>Cancel</button>
                <button type="button" className="primary-btn" onClick={addPatient}>Add Patient</button>
              </div>
            </section>
          </section>
        ) : (
          <>
            <section className="search-row card-rise" style={{ '--d': '0ms' } as CSSProperties}>
              <label className="search-box">
                <AppIcon name="search" className="search-icon" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search with patient name"
                />
              </label>
            </section>

            <section className="patient-list">
              {filteredPatients.map((item, idx) => (
                <article
                  key={`${item.name}-${idx}`}
                  className="patient-card card-rise"
                  style={{ '--d': `${90 + idx * 35}ms` } as CSSProperties}
                  onClick={() => openPatientDetail(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      openPatientDetail(item)
                    }
                  }}
                >
                  <div className="avatar">{item.initials}</div>
                  <div className="patient-main">
                    <div className="top-line"><h3>{item.name}</h3><span className={`pill ${item.source === 'manual' ? 'manual' : 'astikan'}`}>{item.source === 'manual' ? 'Doctor Added' : 'Astikan Online'}</span></div>
                    <p>{item.age} years</p>
                    {item.company ? <p><AppIcon name="store" className="tiny" /> {item.company}</p> : null}
                    <p><AppIcon name="calendar" className="tiny" /> Last visit: {item.lastVisit}</p>
                    <div className="chips"><span className="visit-chip">{item.visits} visits</span><span className="issue">{item.issue}</span></div>
                  </div>
                </article>
              ))}
              {filteredPatients.length === 0 ? (
                <article className="patient-empty card-rise" style={{ '--d': '90ms' } as CSSProperties}>
                  No patients found for "{searchQuery}".
                </article>
              ) : null}
            </section>
          </>
        )}
      </main>

      {screen === 'list' ? (
        <button type="button" className="fab-btn" aria-label="add patient" onClick={() => { setNotice(''); setScreen('add') }}><AppIcon name="plus" className="fab-icon" /></button>
      ) : null}

      <nav className="bottom-nav">
        <button type="button" className="nav-item" onClick={() => onNavigate('dashboard')}><AppIcon name="home" className="nav-svg" /><span>Home</span></button>
        <button type="button" className="nav-item active" onClick={() => onNavigate('patients')}><AppIcon name="patients" className="nav-svg" /><span>Patients</span></button>
        <button type="button" className="nav-item" onClick={() => onNavigate('appointments')}><AppIcon name="calendar" className="nav-svg" /><span>Appointments</span></button>
        <button type="button" className="nav-item" onClick={() => onNavigate('freelance-cases')}><AppIcon name="sparkles" className="nav-svg" /><span>Explore</span></button>
        <button type="button" className="nav-item" onClick={() => onNavigate('store')}><AppIcon name="store" className="nav-svg" /><span>Store</span></button>
      </nav>
    </section>
  )
}

export default Patients
