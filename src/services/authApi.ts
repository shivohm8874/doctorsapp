import { apiPost } from './api'

export type DoctorLoginResponse = {
  userId: string
  role: string
  fullName?: string | null
  email?: string | null
  phone?: string | null
  avatarUrl?: string | null
  companyId?: string | null
}

const DOCTOR_SESSION_KEY = "astikan_doctor_session"

export function saveDoctorSession(payload: DoctorLoginResponse) {
  localStorage.setItem(DOCTOR_SESSION_KEY, JSON.stringify(payload))
}

export function getDoctorSession(): DoctorLoginResponse | null {
  const raw = localStorage.getItem(DOCTOR_SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as DoctorLoginResponse
  } catch {
    return null
  }
}

export function clearDoctorSession() {
  localStorage.removeItem(DOCTOR_SESSION_KEY)
}

export function loginDoctor(mobile: string, password: string) {
  return apiPost<DoctorLoginResponse, { mobile: string; password: string }>('/auth/doctor/login', { mobile, password })
}
