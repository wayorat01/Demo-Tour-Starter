'use server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { revalidatePath, revalidateTag } from 'next/cache'
import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import tar from 'tar-stream'
import { Readable } from 'node:stream'
import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import { MongoClient, BSON } from 'mongodb'

const { EJSON } = BSON

const COLLECTION_FILE_NAME = 'collections.json'
const SEED_DIR = path.join(process.cwd(), 'public/seed')
const SEED_FILE_PATH = path.join(SEED_DIR, 'seed-data.tar.gz')
const SEED_GIT_PATH = 'public/seed/seed-data.tar.gz'
const CWD = process.cwd()

/**
 * Collections to exclude from seed data
 */
const EXCLUDED_COLLECTIONS = [
  'users',
  'roles',
  'payload-preferences',
  'payload-migrations',
  // Version collections cause ghost duplicate entries in Payload Admin when
  // imported via seed (different updatedAt timestamps create phantom rows).
  // Payload auto-creates versions when docs are created/updated, so they
  // don't need to be seeded.
  'payload-locked-documents',
  // Search index is auto-rebuilt by Payload Search Plugin.
  // Importing it from seed causes duplicate key errors in admin UI.
  'searches',
]

/**
 * Version collection pattern: _<collection>_versions
 * These are excluded dynamically in the apply loop below.
 */
const isVersionCollection = (name: string) => name.startsWith('_') && name.endsWith('_versions')

// ============================================
// S3 Helpers
// ============================================

function getS3Client() {
  if (
    !process.env.S3_ACCESS_KEY_ID ||
    !process.env.S3_SECRET_ACCESS_KEY ||
    !process.env.S3_BUCKET
  ) {
    throw new Error('S3 configurations (S3_ACCESS_KEY_ID, etc.) are missing in .env')
  }
  return new S3Client({
    region: process.env.S3_REGION || 'ap-southeast-1',
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
  })
}

const S3_SEED_KEY = 'seeds/seed-data.tar.gz'

/**
 * Upload seed file to S3
 */
async function uploadSeedToS3(buffer: Buffer): Promise<string> {
  const client = getS3Client()
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: S3_SEED_KEY,
    Body: buffer,
    ContentType: 'application/gzip',
  })

  await client.send(command)
  return new Date().toISOString()
}

/**
 * Fetch seed file from S3
 */
export async function fetchSeedFromS3(): Promise<Buffer> {
  try {
    const client = getS3Client()
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: S3_SEED_KEY,
    })

    const response = await client.send(command)
    if (!response.Body) throw new Error('Empty S3 response')

    // Convert ReadableStream to Buffer
    const chunks: Uint8Array[] = []
    for await (const chunk of response.Body as any) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)

    console.log('[SeedDB] ✅ Fetched seed from S3')
    return buffer
  } catch (error) {
    console.warn(
      '[SeedDB] ⚠️ Could not fetch seed from S3, falling back to local file',
      error instanceof Error ? error.message : error,
    )
    return fs.readFile(SEED_FILE_PATH)
  }
}

/**
 * Get seed file info from S3
 */
async function getSeedInfoFromS3(): Promise<{
  exists: boolean
  size?: number
  modified?: Date
}> {
  try {
    const client = getS3Client()
    const command = new HeadObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: S3_SEED_KEY,
    })

    const response = await client.send(command)

    return {
      exists: true,
      size: response.ContentLength,
      modified: response.LastModified,
    }
  } catch (error: any) {
    if (error.name === 'NotFound') {
      return { exists: false }
    }
    return { exists: false }
  }
}

const PROTECTED_GLOBAL_TYPES = [
  'header',
  'footer',
  'themeConfig',
  'theme-Config',
  'company-info',
  'page-config',
  'pageConfig',
]

export type SeedMode = 'replace' | 'merge-newer'

export interface ApplySeedOptions {
  mode?: SeedMode
  selectedCollections?: string[]
  excludeGlobalTypes?: string[]
}

export interface ApplySeedReport {
  success: boolean
  message: string
  details?: {
    inserted: number
    updated: number
    skippedLocal: number
    skippedGlobal: number
    mediaRestored: number
    collections: string[]
  }
}

export interface SeedPreview {
  success: boolean
  message?: string
  collections?: {
    name: string
    docCount: number
    isGlobal: boolean
    globalTypes?: string[]
  }[]
  mediaCount?: number
}

export async function getDb() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('SeedDB failed: MONGODB_URI is missing')
  const client = new MongoClient(uri)
  await client.connect()
  return { db: client.db(), client }
}

function createTarGzip(files: { name: string; content: Buffer }[]) {
  return new Promise<Buffer>((resolve, reject) => {
    const pack = tar.pack()
    const gzip = zlib.createGzip()
    const chunks: Buffer[] = []
    files.forEach(({ name, content }) => pack.entry({ name }, content))
    pack.finalize()
    const compressedStream = pack.pipe(gzip)
    compressedStream.on('data', (chunk: Buffer) => chunks.push(chunk))
    compressedStream.on('end', () => resolve(Buffer.concat(chunks as any[])))
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
        files.push({ name: header.name, content: Buffer.concat(chunks as any[]) })
        next()
      })
      stream.resume()
    })
    extract.on('finish', () => resolve(files))
    extract.on('error', reject)

    const stream = Readable.from(fileBuffer)
    stream.pipe(gunzip).pipe(extract)
  })
}

export async function getSeedFileInfo(): Promise<{
  exists: boolean
  size?: number
  modified?: Date
  seedFile?: string
  commitHash?: string
  source?: string
}> {
  try {
    const info = await getSeedInfoFromS3()
    if (!info.exists) return { exists: false, source: 's3' }
    return {
      exists: true,
      size: info.size,
      modified: info.modified,
      seedFile: 'seed-data.tar.gz',
      commitHash: undefined,
      source: 's3',
    }
  } catch {
    return { exists: false, source: 's3' }
  }
}

export async function previewSeed(): Promise<SeedPreview> {
  'use server'
  try {
    const fileBuffer = await fetchSeedFromS3()
    const files = await resolveTarGzip(fileBuffer)
    const collectionsFile = files.find((file) => file.name === COLLECTION_FILE_NAME)
    if (!collectionsFile) throw new Error('Seed file is missing collections.json')

    const collections: Record<string, any[]> = EJSON.parse(collectionsFile.content.toString())
    const mediaFiles = files.filter((file) => file.name !== COLLECTION_FILE_NAME)

    const collectionNames = Object.keys(collections).filter(
      (name) => !EXCLUDED_COLLECTIONS.includes(name) && !isVersionCollection(name),
    )

    const result: SeedPreview = {
      success: true,
      mediaCount: mediaFiles.length,
      collections: collectionNames.map((name) => {
        const isGlobal = name === 'globals'
        const globalTypes = isGlobal
          ? Array.from(new Set(collections[name].map((d) => d.globalType).filter(Boolean)))
          : undefined

        return {
          name,
          docCount: collections[name].length,
          isGlobal,
          globalTypes: globalTypes as string[],
        }
      }),
    }

    return result
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to preview seed',
    }
  }
}

export async function generateSeed(): Promise<{
  success: boolean
  message: string
  size?: number
}> {
  'use server'
  let dbClient: MongoClient | null = null
  try {
    const { db, client } = await getDb()
    dbClient = client
    const collections = await db.listCollections().toArray()
    const allData: Record<string, unknown[]> = {}

    for (const collection of collections) {
      if (EXCLUDED_COLLECTIONS.includes(collection.name) || isVersionCollection(collection.name))
        continue
      allData[collection.name] = await db.collection(collection.name).find({}).toArray()
    }

    const collectionBackupFile = EJSON.stringify(allData)

    const tarGzBuffer = await createTarGzip([
      { name: COLLECTION_FILE_NAME, content: Buffer.from(collectionBackupFile) },
    ])

    await fs.mkdir(SEED_DIR, { recursive: true })
    await fs.writeFile(SEED_FILE_PATH, new Uint8Array(tarGzBuffer))
    const stats = await fs.stat(SEED_FILE_PATH)

    // Auto-push to S3
    let uploadTimestamp = ''
    try {
      const buffer = await fs.readFile(SEED_FILE_PATH)
      uploadTimestamp = await uploadSeedToS3(buffer)
      console.log(`Seed pushed to S3 at: ${uploadTimestamp}`)
    } catch (pushError) {
      console.error('Failed to push seed to S3:', pushError)
      return {
        success: false,
        message: `สร้าง seed สำเร็จ แต่ push ไป S3 ไม่ได้: ${pushError instanceof Error ? pushError.message : 'Unknown error'}`,
        size: stats.size,
      }
    }

    return {
      success: true,
      message: `✅ Seed สร้างและ push ไป S3 เรียบร้อย! (${new Date(uploadTimestamp).toLocaleString()}) — ${Object.keys(allData).length} collections`,
      size: stats.size,
    }
  } catch (error) {
    return {
      success: false,
      message: `Failed to generate seed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  } finally {
    if (dbClient) await dbClient.close()
  }
}

export async function applySeed(options?: ApplySeedOptions): Promise<ApplySeedReport> {
  'use server'
  let dbClient: MongoClient | null = null
  try {
    const fileBuffer = await fetchSeedFromS3()
    console.log('[APPLY] Using seed from S3')

    const mode: SeedMode = options?.mode ?? 'merge-newer'
    const selectedCollections = options?.selectedCollections
    const excludeGlobalTypes = options?.excludeGlobalTypes ?? PROTECTED_GLOBAL_TYPES

    const { db, client } = await getDb()
    dbClient = client
    const files = await resolveTarGzip(fileBuffer)
    const collectionsFile = files.find((file) => file.name === COLLECTION_FILE_NAME)
    if (!collectionsFile) throw new Error('Seed file is missing collections.json')

    const collections: Record<string, any[]> = EJSON.parse(collectionsFile.content.toString())
    let mediaRestored = 0

    let totalInserted = 0,
      totalUpdated = 0,
      totalSkippedLocal = 0,
      totalSkippedGlobal = 0
    const processedCollections: string[] = []

    for (const collectionName of Object.keys(collections)) {
      if (EXCLUDED_COLLECTIONS.includes(collectionName)) continue
      if (isVersionCollection(collectionName)) {
        console.log(
          `[SeedDB] ⏭️  Skipping ${collectionName} (versions are auto-created by Payload)`,
        )
        continue
      }
      if (selectedCollections && !selectedCollections.includes(collectionName)) continue

      let collectionData = collections[collectionName]
      if (collectionName === 'globals' && excludeGlobalTypes.length > 0) {
        collectionData = collectionData.filter(
          (doc) => !doc.globalType || !excludeGlobalTypes.includes(doc.globalType),
        )
        totalSkippedGlobal += collections[collectionName].length - collectionData.length
      }

      if (collectionData.length === 0) continue
      const collection = db.collection(collectionName)
      processedCollections.push(collectionName)

      // --- Apply seed data (batch approach) ---
      console.log(`[SeedDB] 📦 Processing ${collectionName}: ${collectionData.length} docs...`)

      if (mode === 'replace') {
        if (collectionName === 'globals' && excludeGlobalTypes.length > 0) {
          await collection.deleteMany({
            $or: [{ globalType: { $nin: excludeGlobalTypes } }, { globalType: { $exists: false } }],
          })
        } else await collection.deleteMany({})

        const bulkOps = collectionData.map((doc: any) => ({
          updateOne: { filter: { _id: doc._id }, update: { $set: doc }, upsert: true },
        }))
        await collection.bulkWrite(bulkOps as any)
        totalInserted += collectionData.length
        console.log(`[SeedDB] ✅ ${collectionName}: ${collectionData.length} replaced`)
      } else {
        // Determine the unique key field for this collection
        const getUniqueKey = (doc: any): { field: string; value: any } | null => {
          if (doc.globalType) return { field: 'globalType', value: doc.globalType }
          if (collectionName === 'media' && doc.filename)
            return { field: 'filename', value: doc.filename }
          if (collectionName === 'airlines' && doc.airlineCode)
            return { field: 'airlineCode', value: doc.airlineCode }
          if (collectionName === 'program-tours' && doc.productCode)
            return { field: 'productCode', value: doc.productCode }
          if (collectionName === 'tour-groups' && doc.groupKey)
            return { field: 'groupKey', value: doc.groupKey }
          if (doc.slug != null && doc.slug !== '') return { field: 'slug', value: doc.slug }
          return null // will fall back to _id
        }

        // Step A: Fetch all existing docs in ONE query (only _id, slug, globalType, filename, updatedAt)
        const projection: any = { _id: 1, updatedAt: 1 }
        if (collectionName === 'globals') projection.globalType = 1
        else if (collectionName === 'media') projection.filename = 1
        else if (collectionName === 'airlines') {
          projection.airlineCode = 1
          projection.slug = 1
        } else if (collectionName === 'program-tours') {
          projection.productCode = 1
          projection.slug = 1
        } else if (collectionName === 'tour-groups') {
          projection.groupKey = 1
          projection.slug = 1
        } else projection.slug = 1

        const existingDocs = await collection.find({}, { projection }).toArray()

        // Step B: Build lookup maps
        const byId = new Map<string, any>()
        const byKey = new Map<string, any>()
        for (const doc of existingDocs) {
          byId.set(String(doc._id), doc)
          const key = getUniqueKey(doc)
          if (key) byKey.set(`${key.field}:${key.value}`, doc)
        }

        // Step C: Build bulk operations by comparing in memory
        const bulkOps: any[] = []
        let inserted = 0,
          updated = 0,
          skipped = 0

        for (const seedDoc of collectionData) {
          const uniqueKey = getUniqueKey(seedDoc)
          const existingByKey = uniqueKey
            ? byKey.get(`${uniqueKey.field}:${uniqueKey.value}`)
            : null
          const existingById = byId.get(String(seedDoc._id))
          const existing = existingByKey || existingById

          if (!existing) {
            // New doc → insert
            bulkOps.push({
              updateOne: {
                filter: { _id: seedDoc._id },
                update: { $setOnInsert: seedDoc },
                upsert: true,
              },
            })
            inserted++
          } else {
            // Existing → compare timestamps
            const seedDate = new Date(seedDoc.updatedAt || 0).getTime()
            const localDate = new Date(existing.updatedAt || 0).getTime()
            if (seedDate > localDate) {
              bulkOps.push({
                replaceOne: {
                  filter: { _id: existing._id },
                  replacement: { ...seedDoc, _id: existing._id },
                },
              })
              updated++
            } else {
              skipped++
            }
          }
        }

        // Step D: Execute single bulkWrite
        if (bulkOps.length > 0) {
          await collection.bulkWrite(bulkOps, { ordered: false })
        }
        totalInserted += inserted
        totalUpdated += updated
        totalSkippedLocal += skipped
        console.log(
          `[SeedDB] ✅ ${collectionName}: ${inserted} inserted, ${updated} updated, ${skipped} skipped`,
        )
      }
    }

    try {
      revalidateTag('global_header')
      revalidatePath('/')
    } catch {
      /* CLI context — skip revalidation */
    }
    return {
      success: true,
      message: `Seed applied: ${totalInserted} inserted, ${totalUpdated} updated, ${totalSkippedLocal} kept local`,
    }
  } catch (error) {
    return {
      success: false,
      message: `Apply failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  } finally {
    if (dbClient) await dbClient.close()
  }
}
