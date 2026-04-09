import { checkRole } from '@/utilities/checkRole'
import { Access, FieldAccess } from 'payload'
import type { User } from '@/payload-types'

// ─────────────────────────────────────────────────────────────
// Permission Checkers
// ─────────────────────────────────────────────────────────────

export const hasGlobalPermission = (permissionKey: string, user?: User | null): boolean => {
  if (!user?.roles) return false
  return user.roles.some((role: any) => {
    if (typeof role === 'string') return false
    return role?.permissions?.[permissionKey] === true
  })
}

export const hasCollectionPermission = (
  collectionKey: string,
  actionKey: string,
  user?: User | null,
): boolean => {
  if (!user?.roles) return false
  return user.roles.some((role: any) => {
    if (typeof role === 'string') return false
    return role?.collectionAccess?.[collectionKey]?.[actionKey] === true
  })
}

export const hasTourPermission = (
  tourCollectionKey: string,
  actionKey: string,
  user?: User | null,
): boolean => {
  if (!user?.roles) return false
  return user.roles.some((role: any) => {
    if (typeof role === 'string') return false
    return role?.tourAccess?.[tourCollectionKey]?.[actionKey] === true
  })
}

// ─────────────────────────────────────────────────────────────
// Access Control Factories
// ─────────────────────────────────────────────────────────────

export const canAccessCollection = (collectionKey: string, actionKey: string): Access => {
  return ({ req: { user } }) => {
    if (checkRole(['admin'], user)) return true
    return hasCollectionPermission(collectionKey, actionKey, user)
  }
}

export const canAccessTour = (tourCollectionKey: string, actionKey: string): Access => {
  return ({ req: { user } }) => {
    if (checkRole(['admin'], user)) return true
    return hasTourPermission(tourCollectionKey, actionKey, user)
  }
}

export const requireTourInfoUpdate = (tourCollectionKey: string): FieldAccess => {
  return ({ req: { user } }) => {
    if (checkRole(['admin'], user)) return true
    return hasTourPermission(tourCollectionKey, 'updateTourInfo', user)
  }
}

export const requireTourUpdateAll = (tourCollectionKey: string): FieldAccess => {
  return ({ req: { user } }) => {
    if (checkRole(['admin'], user)) return true
    return hasTourPermission(tourCollectionKey, 'updateAll', user)
  }
}

export const requireTourSEO = (tourCollectionKey: string): FieldAccess => {
  return ({ req: { user } }) => {
    if (checkRole(['admin'], user)) return true
    return hasTourPermission(tourCollectionKey, 'manageSEO', user)
  }
}

// ─────────────────────────────────────────────────────────────
// Legacy Access / Aliases (For Backward Compatibility)
// ─────────────────────────────────────────────────────────────

/** @deprecated ใช้ hasGlobalPermission แทน */
export const hasPermission = (permissionKey: string, user?: User | null): boolean => {
  return hasGlobalPermission(permissionKey, user)
}

/** @deprecated ใช้ canAccessCollection('tourGroups', 'update') แทน */
export const canAccessTourGroups: Access = canAccessCollection('tourGroups', 'update')

/** @deprecated ใช้ canAccessCollection('pages', 'create') ลิงก์ตรงๆ แทนการอ้าง Design */
export const requireDesignPermission: Access = ({ req: { user } }) => {
  return checkRole(['admin'], user) || hasGlobalPermission('canManageDesign', user)
}

/** @deprecated เปลี่ยนชื่อเป็น requireTourInfoUpdate แล้วเรียกใช้เป็นฟังก์ชัน */
export const denyWithoutTourStructure: FieldAccess = ({ req: { user } }) => {
  return (
    checkRole(['admin'], user) ||
    hasTourPermission('intertours', 'updateTourInfo', user) ||
    hasTourPermission('inboundTours', 'updateTourInfo', user)
  )
}

export const denyWithoutDesign: FieldAccess = ({ req: { user } }) => {
  return checkRole(['admin'], user) || hasGlobalPermission('canManageDesign', user)
}

export const denyAgentStarterFieldUpdate: FieldAccess = denyWithoutTourStructure

export const isAdminOrAgentStarter: Access = ({ req: { user } }) => {
  return checkRole(['admin'], user) || hasGlobalPermission('canManageContent', user)
}

export const isAdminOnly: Access = ({ req: { user } }) => {
  return checkRole(['admin'], user) || hasGlobalPermission('canManageDesign', user)
}
