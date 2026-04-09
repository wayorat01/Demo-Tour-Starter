import { Payload } from 'payload'

const fullCollections = {
  create: true,
  update: true,
  delete: true,
}

const noDeleteCollections = {
  create: true,
  update: true,
  delete: false,
}

const fullTours = {
  create: true,
  updateTourInfo: true,
  manageSEO: true,
  delete: true,
}

const agentTours = {
  create: true,
  updateTourInfo: true,
  manageSEO: true,
  delete: false,
}

const defaultRoles = [
  {
    name: 'Admin',
    slug: 'admin',
    description: 'Full access to all features',
    permissions: {
      canManageContent: true,
      canPublish: true,
      canManageUsers: true,
      canManageRedirects: true,
      canManageDesign: true,
    },
    collectionAccess: {
      pages: fullCollections,
      posts: fullCollections,
      media: fullCollections,
      categories: fullCollections,
      tourCategories: fullCollections,
      programTours: fullCollections,
      galleryAlbums: fullCollections,
      tags: fullCollections,
      testimonials: fullCollections,
      bookings: fullCollections,
      festivals: fullCollections,
      airlines: fullCollections,
      tourGroups: fullCollections,
      customLandingPages: fullCollections,
    },
    tourAccess: {
      intertours: fullTours,
      inboundTours: fullTours,
    },
  },
  {
    name: 'Editor',
    slug: 'editor',
    description: 'Can create and edit content',
    permissions: {
      canManageContent: true,
      canPublish: false,
      canManageUsers: false,
      canManageRedirects: false,
      canManageDesign: true,
    },
    collectionAccess: {
      pages: noDeleteCollections,
      posts: noDeleteCollections,
      media: fullCollections,
      categories: noDeleteCollections,
      tourCategories: noDeleteCollections,
      programTours: noDeleteCollections,
      galleryAlbums: noDeleteCollections,
      tags: noDeleteCollections,
      testimonials: noDeleteCollections,
      bookings: noDeleteCollections,
      festivals: noDeleteCollections,
      airlines: noDeleteCollections,
      tourGroups: noDeleteCollections,
      customLandingPages: noDeleteCollections,
    },
    tourAccess: {
      intertours: agentTours,
      inboundTours: agentTours,
    },
  },
  {
    name: 'Agent Starter',
    slug: 'agent_starter',
    description: 'แพ็กเกจเริ่มต้น — แก้ไขเนื้อหาทัวร์ได้ จำกัดสิทธิ์การลบและการแก้โครงสร้างพิเศษ',
    permissions: {
      canManageContent: true,
      canPublish: true,
      canManageUsers: false,
      canManageRedirects: false,
      canManageDesign: false, // Agent Starter defaults to no design management
    },
    collectionAccess: {
      pages: { create: false, update: false, delete: false },
      posts: noDeleteCollections,
      media: fullCollections,
      categories: noDeleteCollections,
      tourCategories: { create: false, update: false, delete: false },
      programTours: noDeleteCollections,
      galleryAlbums: noDeleteCollections,
      tags: noDeleteCollections,
      testimonials: noDeleteCollections,
      bookings: noDeleteCollections,
      festivals: noDeleteCollections,
      airlines: noDeleteCollections,
      tourGroups: { create: false, update: false, delete: false }, // ล็อกตามโจทย์
      customLandingPages: { create: false, update: false, delete: false },
    },
    tourAccess: {
      intertours: agentTours,
      inboundTours: agentTours,
    },
  },
]

const initRoleCreation = async (payload: Payload) => {
  for (const role of defaultRoles) {
    try {
      await payload.create({
        collection: 'roles',
        data: role,
      })
    } catch (error) {
      payload.logger.error(`Error creating role ${role.name}: ${error}`)
    }
  }

  // Verify roles were created
  const { docs: createdRoles } = await payload.find({
    collection: 'roles',
    limit: 10,
  })
  payload.logger.info(`Created roles: ${createdRoles.map((r) => r.name)}`)
}

export async function initializeRoles(payload: Payload): Promise<void> {
  try {
    // Check if any roles exist
    const { totalDocs } = await payload.find({
      collection: 'roles',
      limit: 0,
    })

    // Create default roles if they are not yet created
    if (totalDocs < defaultRoles.length) {
      payload.logger.info('No roles found, creating defaults...')
      // we wait a bit to make sure, that we dont run into mongoDB "Unable to write to collection 'XX.roles' due to catalog changes;"
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Create roles. Retry one time if it fails
      try {
        await initRoleCreation(payload)
      } catch (error) {
        payload.logger.error(`Error creating roles, retrying one time: ${error}`)
        await new Promise((resolve) => setTimeout(resolve, 4000))
        await initRoleCreation(payload)
      }
    }
  } catch (error) {
    payload.logger.error(`Error initializing roles: ${error}`)
    // When the role creation fails, we should fail the entire process,
    // as the first user has no permissions otherwise
    throw error
  }
}
