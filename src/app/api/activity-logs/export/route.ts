import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { checkPermission } from '@/utilities/checkPermission'
import { checkRole } from '@/utilities/checkRole'

/**
 * GET /api/activity-logs/export
 *
 * Export activity logs เป็น CSV — เฉพาะ admin หรือผู้มี canViewActivityLogs
 *
 * Query params:
 *   ?from=2026-01-01&to=2026-12-31  — กรองตามช่วงเวลา
 *   &action=create,update,delete     — กรองตาม action
 *   &collection=intertours           — กรองตาม collection
 */
export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: req.headers })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check access: admin or canViewActivityLogs
    const isAdminUser = checkRole(['admin'], user as any)
    const hasAuditPerm = checkPermission('canViewActivityLogs', user as any)
    if (!isAdminUser && !hasAuditPerm) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse query params
    const { searchParams } = new URL(req.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const actions = searchParams.get('action')?.split(',').filter(Boolean)
    const collection = searchParams.get('collection')

    // Build MongoDB query
    const query: Record<string, any> = {}
    if (from || to) {
      query.timestamp = {}
      if (from) query.timestamp.$gte = new Date(from)
      if (to) query.timestamp.$lte = new Date(to + 'T23:59:59.999Z')
    }
    if (actions && actions.length > 0) {
      query.action = { $in: actions }
    }
    if (collection) {
      query.targetCollection = collection
    }

    // Fetch from DB directly for performance
    const db = payload.db.connection.db
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }

    const docs = await db
      .collection('activity-logs')
      .find(query)
      .sort({ timestamp: -1 })
      .limit(10000) // Safety limit
      .toArray()

    // Fetch user emails for display
    const userIds = [...new Set(docs.map((d) => d.user).filter(Boolean))]
    const userMap = new Map<string, string>()
    if (userIds.length > 0) {
      const users = await db
        .collection('users')
        .find({ _id: { $in: userIds } }, { projection: { _id: 1, email: 1, name: 1 } })
        .toArray()
      users.forEach((u) => {
        userMap.set(String(u._id), u.name || u.email || String(u._id))
      })
    }

    // Generate CSV
    const header = 'Timestamp,Action,Collection,Document ID,Document Title,User,Changed Fields'
    const rows = docs.map((doc) => {
      const timestamp = doc.timestamp ? new Date(doc.timestamp).toISOString() : ''
      const userName = userMap.get(String(doc.user)) || String(doc.user || '')
      const changes = doc.changes
        ? Array.isArray(doc.changes)
          ? doc.changes.join('; ')
          : JSON.stringify(doc.changes)
        : ''

      return [
        timestamp,
        doc.action || '',
        doc.targetCollection || '',
        doc.documentId || '',
        `"${(doc.documentTitle || '').replace(/"/g, '""')}"`,
        `"${userName.replace(/"/g, '""')}"`,
        `"${changes.replace(/"/g, '""')}"`,
      ].join(',')
    })

    const csv = [header, ...rows].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="activity-logs-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    })
  } catch (error) {
    console.error('[ActivityLogs Export]', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
