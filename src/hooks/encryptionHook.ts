// encryptionHooks.ts
import { FieldHook } from 'payload'

const encryptKey: FieldHook = ({ req, value }) =>
  value ? req.payload.encrypt(value as string) : undefined

const decryptKey: FieldHook = ({ req, value }) => {
  if (!value) return undefined
  try {
    return req.payload.decrypt(value as string)
  } catch {
    // If decryption fails, value was stored before encryption was enabled — return as-is
    return value
  }
}

const encryptionHooks = {
  beforeChange: [encryptKey],
  afterRead: [decryptKey],
}

export default encryptionHooks
