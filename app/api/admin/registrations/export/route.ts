import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { withRoute } from "@/lib/api/response"

export const GET = withRoute(async (request: NextRequest) => {
  requireAdmin(request)

  const registrations = (await db.query(`
    SELECT
      u.id, u.name, u.email, u.on_camera, u.discord_code,
      u.status, u.registration_date
    FROM users u
    ORDER BY u.created_at DESC
  `)) as any[]

  const headers = ["ID", "Name", "Email", "Type", "Discord Code", "Status", "Registration Date"]

  const csvRows = [
    headers.join(","),
    ...registrations.map((reg) =>
      [
        reg.id,
        `"${String(reg.name).replace(/"/g, '""')}"`,
        reg.email,
        reg.on_camera ? "On Camera" : "Behind Scenes",
        reg.discord_code,
        reg.status,
        new Date(reg.registration_date).toISOString().split("T")[0],
      ].join(","),
    ),
  ]

  const csvContent = csvRows.join("\n")

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="registrations-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  })
})
