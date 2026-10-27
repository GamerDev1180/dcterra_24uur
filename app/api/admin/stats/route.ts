import type { NextRequest } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { apiSuccess, withRoute } from "@/lib/api/response"

export const GET = withRoute(async (request: NextRequest) => {
  requireAdmin(request)

  const [totalResult, onCameraResult, offCameraResult, pendingResult, confirmedResult] = await Promise.all([
    db.query("SELECT COUNT(*) as count FROM users") as Promise<any[]>,
    db.query("SELECT COUNT(*) as count FROM users WHERE on_camera = true") as Promise<any[]>,
    db.query("SELECT COUNT(*) as count FROM users WHERE on_camera = false") as Promise<any[]>,
    db.query('SELECT COUNT(*) as count FROM users WHERE status = "pending"') as Promise<any[]>,
    db.query('SELECT COUNT(*) as count FROM users WHERE status = "confirmed"') as Promise<any[]>,
  ])

  const stats = {
    totalRegistrations: totalResult[0].count,
    onCameraCount: onCameraResult[0].count,
    offCameraCount: offCameraResult[0].count,
    pendingCount: pendingResult[0].count,
    confirmedCount: confirmedResult[0].count,
  }

  return apiSuccess({ stats })
})
