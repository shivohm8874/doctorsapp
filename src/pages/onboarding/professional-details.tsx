import { useMemo, useState } from "react"
import type { AppRoute } from "../../types/routes"
import { saveDoctorProfile } from "../../utils/doctorProfile"
import "./onboarding.css"

type ProfessionalDetailsProps = {
  onNavigate: (route: AppRoute) => void
}

function ProfessionalDetails({ onNavigate }: ProfessionalDetailsProps) {
  const [highestQualification, setHighestQualification] = useState("MBBS")
  const [experienceYears, setExperienceYears] = useState("1")
  const [languagePickerOpen, setLanguagePickerOpen] = useState(false)
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["English", "Hindi"])
  const [shortBio, setShortBio] = useState("")
  const [error, setError] = useState("")

  const qualifications = useMemo(
    () => ["MBBS", "MD", "MS", "DNB", "DM", "MCh", "BAMS", "BHMS", "BUMS"],
    []
  )
  const yearsOptions = useMemo(() => Array.from({ length: 41 }, (_, index) => String(index)), [])
  const languages = useMemo(
    () => [
      "English",
      "Hindi",
      "Bengali",
      "Telugu",
      "Marathi",
      "Tamil",
      "Urdu",
      "Gujarati",
      "Kannada",
      "Odia",
      "Malayalam",
      "Punjabi",
      "Assamese",
      "Maithili",
      "Sanskrit",
      "Kashmiri",
      "Nepali",
      "Konkani",
      "Sindhi",
      "Dogri",
      "Manipuri",
      "Bodo",
      "Santali",
    ],
    []
  )

  function toggleLanguage(language: string) {
    setSelectedLanguages((prev) =>
      prev.includes(language) ? prev.filter((item) => item !== language) : [...prev, language]
    )
  }

  function handleContinue() {
    if (selectedLanguages.length === 0) {
      setError("Select at least one consultation language.")
      return
    }
    setError("")
    saveDoctorProfile({
      highestQualification,
      experienceYears: Number(experienceYears),
      consultationLanguages: selectedLanguages,
      shortBio: shortBio.trim(),
      verificationStatus: "unverified",
    })
    onNavigate("practice-availability")
  }

  return (
    <section className="onboard-page">
      <div className="onboard-shell">
      <header className="onboard-brand-banner">
        <span className="onboard-chip">Step 3 of 4</span>
        <div>
          <h1>Professional Details</h1>
          <p>Build your doctor profile for patients and corporates.</p>
        </div>
        <div className="onboard-steps">
          <span className="onboard-step active" />
          <span className="onboard-step active" />
          <span className="onboard-step active" />
          <span className="onboard-step" />
        </div>
      </header>

      <section className="onboard-card onboard-form">
        <h2 className="onboard-title">Clinical Profile</h2>
        <p className="onboard-subtitle">These details appear in appointment discovery and profile cards</p>
        <label>
          Highest Qualification
          <select className="onboard-input" value={highestQualification} onChange={(event) => setHighestQualification(event.target.value)}>
            {qualifications.map((qualification) => (
              <option key={qualification} value={qualification}>{qualification}</option>
            ))}
          </select>
        </label>
        <label>
          Years of Experience
          <select className="onboard-input" value={experienceYears} onChange={(event) => setExperienceYears(event.target.value)}>
            {yearsOptions.map((year) => (
              <option key={year} value={year}>{year} years</option>
            ))}
          </select>
        </label>
        <label>
          Consultation Languages
          <button type="button" className="onboard-picker-btn" onClick={() => setLanguagePickerOpen(true)}>
            {selectedLanguages.length} selected
          </button>
        </label>
        <div className="onboard-chip-row">
          {selectedLanguages.map((language) => (
            <span className="onboard-tag" key={language}>{language}</span>
          ))}
        </div>
        <label>
          Short Bio
          <textarea className="onboard-input" placeholder="Clinical strengths, treatment approach, key special interests" value={shortBio} onChange={(event) => setShortBio(event.target.value)} />
        </label>
        {error ? <p className="onboard-error-block">{error}</p> : null}

        <div className="onboard-actions">
          <button type="button" className="onboard-btn" onClick={() => onNavigate("identity-verification")}>Back</button>
          <button type="button" className="onboard-btn primary" onClick={handleContinue}>Continue</button>
        </div>
      </section>

      {languagePickerOpen ? (
        <div className="onboard-modal-overlay" role="dialog" aria-modal="true">
          <section className="onboard-modal-card">
            <h3>Select Consultation Languages</h3>
            <p>Choose all languages you consult in.</p>
            <div className="onboard-options-grid">
              {languages.map((language) => (
                <button
                  type="button"
                  key={language}
                  className={`onboard-option ${selectedLanguages.includes(language) ? "active" : ""}`}
                  onClick={() => toggleLanguage(language)}
                >
                  {language}
                </button>
              ))}
            </div>
            <div className="onboard-actions">
              <button type="button" className="onboard-btn" onClick={() => setLanguagePickerOpen(false)}>Close</button>
              <button type="button" className="onboard-btn primary" onClick={() => setLanguagePickerOpen(false)}>Done</button>
            </div>
          </section>
        </div>
      ) : null}
      </div>
    </section>
  )
}

export default ProfessionalDetails
