import { employeeSeedUsers } from '../data/employeeSeedUsers'

const EMPLOYEE_USERS_KEY = 'newgindia.employee.users'

function hasValidUserShape(users) {
  return users.every(
    (employee) =>
      employee?.email &&
      employee?.role &&
      employee?.status &&
      typeof employee?.bio === 'string' &&
      typeof employee?.password === 'string',
  )
}

function parseUsers(rawValue) {
  if (!rawValue) {
    return null
  }

  try {
    const parsed = JSON.parse(rawValue)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function writeUsers(users) {
  window.localStorage.setItem(EMPLOYEE_USERS_KEY, JSON.stringify(users))
}

export function getEmployeeUsers() {
  const savedUsers = parseUsers(window.localStorage.getItem(EMPLOYEE_USERS_KEY))

  if (savedUsers?.length && hasValidUserShape(savedUsers)) {
    return savedUsers
  }

  writeUsers(employeeSeedUsers)
  return employeeSeedUsers
}

export function getEmployeeUserByEmail(email) {
  const normalizedEmail = email.trim().toLowerCase()
  return getEmployeeUsers().find((employee) => employee.email === normalizedEmail) ?? null
}

export function createEmployeeUser({ name, email, password, role, bio = '' }) {
  const users = getEmployeeUsers()
  const normalizedName = name.trim()
  const normalizedEmail = email.trim().toLowerCase()
  const normalizedPassword = password.trim()

  const nextUser = {
    id: `emp-${role}-${Date.now()}`,
    name: normalizedName,
    email: normalizedEmail,
    password: normalizedPassword,
    role,
    status: 'active',
    bio: bio.trim(),
  }

  const nextUsers = [nextUser, ...users]
  writeUsers(nextUsers)
  return nextUser
}

export function updateEmployeeUserStatus(employeeId, status) {
  const nextUsers = getEmployeeUsers().map((employee) =>
    employee.id === employeeId
      ? {
          ...employee,
          status,
        }
      : employee,
  )

  writeUsers(nextUsers)
  return nextUsers
}

export function updateEmployeeUserBio(email, bio) {
  const normalizedEmail = email.trim().toLowerCase()
  const nextUsers = getEmployeeUsers().map((employee) =>
    employee.email === normalizedEmail
      ? {
          ...employee,
          bio: bio.trim(),
        }
      : employee,
  )

  writeUsers(nextUsers)
  return nextUsers.find((employee) => employee.email === normalizedEmail) ?? null
}

export function getEmployeeLoginPreview() {
  return getEmployeeUsers().map(({ email, password, role, name, bio }) => ({
    email,
    password,
    role,
    name,
    bio,
  }))
}
