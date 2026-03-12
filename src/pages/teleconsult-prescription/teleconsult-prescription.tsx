import { useMemo, useState, type CSSProperties } from 'react'
import { AppIcon } from '../../components/ui/icons'
import type { AppRoute } from '../../types/routes'
import './teleconsult-prescription.css'

type TeleconsultPrescriptionProps = {
  onNavigate: (route: AppRoute) => void
}

const medicineLibrary = [
  'Paracetamol 650mg',
  'Azithromycin 500mg',
  'Amlodipine 5mg',
  'Pantoprazole 40mg',
  'Metformin 500mg',
  'Sumatriptan 50mg',
]

const labLibrary = [
  'CBC',
  'HbA1c',
  'LFT',
  'KFT',
  'Lipid Profile',
  'Thyroid Profile',
]

function TeleconsultPrescription({ onNavigate }: TeleconsultPrescriptionProps) {
  const [condition, setCondition] = useState('')
  const [medicineQuery, setMedicineQuery] = useState('')
  const [labQuery, setLabQuery] = useState('')
  const [selectedMedicines, setSelectedMedicines] = useState<string[]>([])
  const [selectedLabs, setSelectedLabs] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [rating, setRating] = useState(0)

  const medicineResults = useMemo(
    () => medicineLibrary.filter((item) => item.toLowerCase().includes(medicineQuery.trim().toLowerCase())),
    [medicineQuery],
  )
  const labResults = useMemo(
    () => labLibrary.filter((item) => item.toLowerCase().includes(labQuery.trim().toLowerCase())),
    [labQuery],
  )

  function toggleItem(list: string[], setList: (next: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((item) => item !== value) : [...list, value])
  }

  function submitPrescription() {
    setSubmitted(true)
  }

  return (
    <section className="tele-rx-page">
      <header className="mobile-topbar tele-rx-topbar">
        <button type="button" className="bar-icon" aria-label="back" onClick={() => onNavigate('appointments')}>
          <AppIcon name="arrow-left" className="bar-svg" />
        </button>
        <h1>{submitted ? 'Review & Feedback' : 'Prescription'}</h1>
        <div className="bar-right" />
      </header>

      <main className="tele-rx-content">
        {!submitted ? (
          <>
            <section className="tele-rx-card card-rise" style={{ '--d': '0ms' } as CSSProperties}>
              <h3>Patient Condition</h3>
              <textarea
                rows={5}
                value={condition}
                onChange={(event) => setCondition(event.target.value)}
                placeholder="Write diagnosis, complaints, vitals summary, and treatment condition..."
              />
            </section>

            <section className="tele-rx-card card-rise" style={{ '--d': '35ms' } as CSSProperties}>
              <h3>Search Medicine</h3>
              <input
                value={medicineQuery}
                onChange={(event) => setMedicineQuery(event.target.value)}
                placeholder="Search medicines"
              />
              <div className="tele-rx-chip-grid">
                {medicineResults.map((item) => (
                  <button key={item} type="button" className={selectedMedicines.includes(item) ? 'active' : ''} onClick={() => toggleItem(selectedMedicines, setSelectedMedicines, item)}>
                    {item}
                  </button>
                ))}
              </div>
            </section>

            <section className="tele-rx-card card-rise" style={{ '--d': '70ms' } as CSSProperties}>
              <h3>Select Lab Tests</h3>
              <input
                value={labQuery}
                onChange={(event) => setLabQuery(event.target.value)}
                placeholder="Search lab tests"
              />
              <div className="tele-rx-chip-grid">
                {labResults.map((item) => (
                  <button key={item} type="button" className={selectedLabs.includes(item) ? 'active' : ''} onClick={() => toggleItem(selectedLabs, setSelectedLabs, item)}>
                    {item}
                  </button>
                ))}
              </div>
            </section>

            <section className="tele-rx-submit card-rise" style={{ '--d': '105ms' } as CSSProperties}>
              <button type="button" className="tele-rx-primary" onClick={submitPrescription}>
                <AppIcon name="check-circle" className="tiny" /> Submit Prescription
              </button>
            </section>
          </>
        ) : (
          <section className="tele-rx-card tele-rx-review card-rise" style={{ '--d': '0ms' } as CSSProperties}>
            <h3>Prescription submitted</h3>
            <p>Collect consultation feedback and close this case properly.</p>
            <div className="tele-rx-stars">
              {Array.from({ length: 5 }).map((_, index) => (
                <button key={index} type="button" className={rating > index ? 'active' : ''} onClick={() => setRating(index + 1)}>
                  <AppIcon name="sparkles" className="tiny" />
                </button>
              ))}
            </div>
            <div className="tele-rx-review-grid">
              <article>
                <small>Condition Summary</small>
                <strong>{condition || 'Condition added'}</strong>
              </article>
              <article>
                <small>Medicines</small>
                <strong>{selectedMedicines.join(', ') || 'No medicine selected'}</strong>
              </article>
              <article>
                <small>Lab Tests</small>
                <strong>{selectedLabs.join(', ') || 'No lab tests selected'}</strong>
              </article>
            </div>
            <button type="button" className="tele-rx-primary" onClick={() => onNavigate('appointments')}>
              Finish
            </button>
          </section>
        )}
      </main>
    </section>
  )
}

export default TeleconsultPrescription
