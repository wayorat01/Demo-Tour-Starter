import { checkRole } from '@/utilities/checkRole'
import { Access, FieldAccess, User } from 'payload'

export const isAdmin: Access = ({ req: { user } }) => {
  return checkRole(['admin'], user)
}

export const isAdminFieldLevel: FieldAccess = ({ req: { user } }) => {
  return checkRole(['admin'], user)
}

// For Payload admin UI and frontend components
export const isAdminHidden = ({ user }: { user: User }): boolean => {
  return !checkRole(['admin'], user);
}
