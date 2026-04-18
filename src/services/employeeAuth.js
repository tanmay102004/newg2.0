import { getEmployeeLoginPreview, getEmployeeUserByEmail } from './employeeUsers'

const EMPLOYEE_SESSION_KEY = 'newgindia.employee.session'

function parseSession(rawValue) {
  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue)
  } catch {
    return null
  }
}

function emitEmployeeAuthChange(session) {
  window.dispatchEvent(
    new CustomEvent('employee-auth-change', {
      detail: session,
    }),
  )
}

function isValidEmployeeSession(session) {
  if (!session) {
    return false
  }

  const matchedUser = getEmployeeUserByEmail(session.email)

  return Boolean(
    matchedUser &&
      matchedUser.role === session.role &&
      matchedUser.status === 'active',
  )
}

export function getEmployeeSession() {
  const session = parseSession(window.localStorage.getItem(EMPLOYEE_SESSION_KEY))
  const matchedUser = session ? getEmployeeUserByEmail(session.email) : null

  if (!isValidEmployeeSession(session)) {
    window.localStorage.removeItem(EMPLOYEE_SESSION_KEY)
    return null
  }

  return {
    ...session,
    bio: matchedUser?.bio ?? session.bio ?? '',
  }
}

export async function loginEmployee({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase()
  const normalizedPassword = password.trim()

  if (!normalizedEmail || !normalizedPassword) {
    throw new Error('Please enter both email and password.')
  }

  const matchedUser = getEmployeeUserByEmail(normalizedEmail)

  if (!matchedUser || matchedUser.password !== normalizedPassword) {
    throw new Error('Invalid credentials. Please check your employee email and password.')
  }

  if (matchedUser.status !== 'active') {
    throw new Error('This employee account is not active right now.')
  }

  // Temporary employee session until backend auth is connected.
  const session = {
    email: normalizedEmail,
    name: matchedUser.name,
    role: matchedUser.role,
    bio: matchedUser.bio ?? '',
    loggedInAt: new Date().toISOString(),
  }

  window.localStorage.setItem(EMPLOYEE_SESSION_KEY, JSON.stringify(session))
  emitEmployeeAuthChange(session)

  return session
}

export function getEmployeeTestCredentials() {
  return getEmployeeLoginPreview()
}

export function logoutEmployee() {
  window.localStorage.removeItem(EMPLOYEE_SESSION_KEY)
  emitEmployeeAuthChange(null)
}

export function updateEmployeeSessionProfile(updates = {}) {
  const currentSession = getEmployeeSession()

  if (!currentSession) {
    return null
  }

  const nextSession = {
    ...currentSession,
    ...updates,
  }

  window.localStorage.setItem(EMPLOYEE_SESSION_KEY, JSON.stringify(nextSession))
  emitEmployeeAuthChange(nextSession)

  return nextSession
}

export function navigateToEmployeePath(pathname) {
  if (window.location.pathname === pathname) {
    return
  }

  window.history.pushState({}, '', pathname)
  window.dispatchEvent(new PopStateEvent('popstate'))
}
