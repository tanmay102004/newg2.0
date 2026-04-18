import { EMPLOYEE_ROLES, EMPLOYEE_ROLE_ORDER } from '../data/employeeRoles'

export function getRoleDefinition(role) {
  return EMPLOYEE_ROLES[role] ?? EMPLOYEE_ROLES.admin
}

export function getRolePreviewCards(activeRole) {
  return EMPLOYEE_ROLE_ORDER.map((role) => ({
    ...EMPLOYEE_ROLES[role],
    isActive: role === activeRole,
  }))
}
