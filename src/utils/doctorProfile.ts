export type DoctorOnboardingProfile = {
  userId?: string
  companyId?: string
  fullName?: string
  email?: string
  mobile?: string
  specializations?: string[]
  medicalCouncilNumber?: string
  governmentIdNumber?: string
  governmentIdFileName?: string
  governmentIdMimeType?: string
  governmentIdStorageKey?: string
  governmentIdDocumentId?: string
  licenseFileName?: string
  licenseMimeType?: string
  licenseStorageKey?: string
  licenseDocumentId?: string
  highestQualification?: string
  experienceYears?: number
  consultationLanguages?: string[]
  shortBio?: string
  practiceAddress?: string
  availabilityMode?: {
    virtual: boolean
    physical: boolean
  }
  opdDays?: string[]
  opdTiming?: {
    from: string
    to: string
  }
  teleconsultSlots?: string[]
  verificationStatus?: 'unverified' | 'verified'
  submittedAt?: string
}

const PROFILE_STORAGE_KEY = 'astikan_doctor_onboarding_profile'

export function getDoctorProfile(): DoctorOnboardingProfile {
  const raw = localStorage.getItem(PROFILE_STORAGE_KEY)
  if (!raw) return {}
  try {
    return JSON.parse(raw) as DoctorOnboardingProfile
  } catch {
    return {}
  }
}

export function saveDoctorProfile(patch: Partial<DoctorOnboardingProfile>) {
  const current = getDoctorProfile()
  const next = { ...current, ...patch }
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(next))
  return next
}

export function clearDoctorProfile() {
  localStorage.removeItem(PROFILE_STORAGE_KEY)
}
