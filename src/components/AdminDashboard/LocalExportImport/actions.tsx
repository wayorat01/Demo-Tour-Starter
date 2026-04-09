'use server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { EJSON } from 'bson'
import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import tar from 'tar-stream'
import { Readable } from 'node:stream'

const COLLECTION_FILE_NAME = 'collections.json'

export async function getDb() {
  const payload = await getPayload({ config: configPromise })
  if (payload.db.name !== 'mongoose') {
    throw new Error('Export failed: Not a mongoose database adapter')
  }
  const db = payload.db.connection.db
  if (!db) {
    console.error('Export failed: Database not initialized')
    throw new Error('Export failed: Database not initialized')
  }
  return db!
}

/**
 * Creates a gzipped tar archive from multiple file buffers
 */
function createTarGzip(files: { name: string; content: Buffer }[]) {
  return new Promise<Buffer>((resolve, reject) => {
    const pack = tar.pack()
    const gzip = zlib.createGzip()
    const chunks: Buffer[] = []

    files.forEach(({ name, content }) => {
      pack.entry({ name }, content)
    })

    pack.finalize()

    const compressedStream = pack.pipe(gzip)
    compressedStream.on('data', (chunk: Buffer) => chunks.push(chunk))
    compressedStream.on('end', () => resolve(Buffer.concat(chunks as unknown as Uint8Array[])))
    compressedStream.on('error', reject)
  })
}

function resolveTarGzip(fileBuffer: Buffer) {
  return new Promise<{ name: string; content: Buffer }[]>((resolve, reject) => {
    const gunzip = zlib.createGunzip()
    const extract = tar.extract()

    const files: { name: string; content: Buffer }[] = []

    extract.on('entry', (header, stream, next) => {
      const chunks: Buffer[] = []
      stream.on('data', (chunk) => chunks.push(chunk))
      stream.on('end', () => {
        files.push({
          name: header.name,
          content: Buffer.concat(chunks as unknown as Uint8Array[]),
        })
        next()
      })
      stream.resume()
    })
    extract.on('finish', () => {
      resolve(files)
    })
    extract.on('error', reject)

    const stream = Readable.from(fileBuffer)
    stream.pipe(gunzip).pipe(extract)
  })
}

/**
 * Export database to JSON string (for download)
 */
export async function exportDatabase(includeMedia: boolean = false): Promise<{
  data: string
  filename: string
  contentType: string
}> {
  'use server'
  const db = await getDb()
  const collections = await db.listCollections().toArray()
  const allData: Record<string, unknown[]> = {}

  for (const collection of collections) {
    allData[collection.name] = await db.collection(collection.name).find({}).toArray()
  }

  const collectionBackupFile = EJSON.stringify(allData)
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

  if (includeMedia && allData['media']) {
    // Create tar.gz with media files
    const mediaFiles: { name: string; content: Buffer }[] = []
    const mediaCollection = allData['media'] as { filename?: string; url?: string }[]

    for (const media of mediaCollection) {
      if (media.filename) {
        try {
          // Read media file from public/media folder
          const mediaPath = path.join(process.cwd(), 'public/media', media.filename)
          const buffer = await fs.readFile(mediaPath)
          mediaFiles.push({ name: media.filename, content: buffer })
        } catch (error) {
          console.warn('Could not read media file:', media.filename, error)
        }
      }
    }

    const tarGzBuffer = await createTarGzip([
      { name: COLLECTION_FILE_NAME, content: Buffer.from(collectionBackupFile) },
      ...mediaFiles,
    ])

    return {
      data: tarGzBuffer.toString('base64'),
      filename: `backup-${timestamp}.tar.gz`,
      contentType: 'application/gzip',
    }
  }

  return {
    data: collectionBackupFile,
    filename: `backup-${timestamp}.json`,
    contentType: 'application/json',
  }
}

/**
 * Import database from uploaded file content
 */
export async function importDatabase(
  fileContent: string,
  fileType: 'json' | 'tar.gz',
  mergeData: boolean = false,
) {
  'use server'
  const db = await getDb()
  let collections: Record<string, { _id?: any }[]> = {}

  if (fileType === 'json') {
    collections = EJSON.parse(fileContent)
  } else if (fileType === 'tar.gz') {
    const buffer = Buffer.from(fileContent, 'base64')
    const files = await resolveTarGzip(buffer)

    const collectionsFile = files.find((file) => file.name === COLLECTION_FILE_NAME)
    if (collectionsFile) {
      collections = EJSON.parse(collectionsFile.content.toString())
    }

    // Save media files to local public/media folder
    const mediaFiles = files.filter((file) => file.name !== COLLECTION_FILE_NAME)
    const mediaFolder = path.join(process.cwd(), 'public/media')
    await fs.mkdir(mediaFolder, { recursive: true })

    for (const media of mediaFiles) {
      const filePath = path.join(mediaFolder, media.name)
      await fs.writeFile(filePath, new Uint8Array(media.content))
      console.log('Restored media file:', filePath)
    }
  }

  // Blacklist certain system collections
  const collectionBlacklist = ['payload-preferences', 'payload-migrations']

  for (const collectionName of Object.keys(collections)) {
    if (collectionBlacklist.includes(collectionName)) {
      continue
    }

    const collectionData = collections[collectionName]
    if (collectionData.length > 0) {
      console.log('Restoring collection', collectionName)
      const collection = db.collection(collectionName)
      const indexes = await collection.indexes()
      const uniqueIndexes = indexes
        .filter((idx) => idx.unique)
        .flatMap((idx) => Object.keys(idx.key))

      if (!mergeData) {
        await collection.deleteMany({})
      }

      const res = await collection.bulkWrite(
        collectionData.map((doc) => ({
          updateOne: {
            filter:
              uniqueIndexes.length > 0
                ? {
                    $or: [
                      { _id: doc._id },
                      ...uniqueIndexes.map((field) => ({ [field]: doc[field] })),
                    ],
                  }
                : { _id: doc._id },
            update: { $set: doc },
            upsert: true,
          },
        })),
      )
      console.log('Restoring done', res)
    }
  }

  // Revalidate all caches
  revalidateTag('global_footer')
  revalidateTag('global_header')
  revalidateTag('global_page-config')
  revalidateTag('global_pageConfig')
  revalidateTag('global_theme-Config')
  revalidateTag('global_themeConfig')
  revalidatePath('/admin')
  revalidatePath('/')

  return { success: true }
}
