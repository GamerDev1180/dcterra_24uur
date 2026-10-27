import mysql from "mysql2/promise"
import { env } from "@/lib/env"

// Next.js dev-mode hot reload re-executes this module on every edit; without a
// globalThis-cached singleton each reload leaks a fresh connection pool and the
// DB eventually runs out of connections during a long dev session.
const globalForDb = globalThis as unknown as { __mysqlPool?: mysql.Pool }

function createPool() {
  return mysql.createPool({
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    waitForConnections: true,
    connectionLimit: env.DB_CONNECTION_LIMIT,
    queueLimit: env.DB_QUEUE_LIMIT,
    connectTimeout: env.DB_CONNECT_TIMEOUT_MS,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
  })
}

const pool = globalForDb.__mysqlPool ?? createPool()

if (env.NODE_ENV !== "production") {
  globalForDb.__mysqlPool = pool
}

// Database utility functions
export const db = {
  // Execute query with parameters
  async query(sql: string, params?: any[]) {
    try {
      const [results] = await pool.execute(sql, params)
      return results
    } catch (error) {
      console.error("Database query error:", error)
      throw error
    }
  },

  // Get connection from pool
  async getConnection() {
    return await pool.getConnection()
  },

  // Close pool
  async close() {
    await pool.end()
  },
}

export const query = db.query.bind(db)

// Types for database entities
export interface User {
  id: number
  name: string
  email: string
  on_camera: boolean
  discord_code: string
  registration_date: Date
  status: "pending" | "confirmed" | "cancelled"
  created_at: Date
  updated_at: Date
}

export interface Question {
  id: number
  question_text: string
  question_type: "text" | "textarea" | "select" | "radio" | "checkbox"
  options?: string[]
  required: boolean
  category: "on_camera" | "off_camera"
  order_index: number
  active: boolean
}

export interface UserAnswer {
  id: number
  user_id: number
  question_id: number
  answer: string
  created_at: Date
}

export interface AdminUser {
  id: number
  username: string
  email: string
  role: "admin" | "super_admin"
  created_at: Date
  last_login?: Date
}

export interface Sponsor {
  id: number
  name: string
  tier: "Platinum" | "Gold" | "Silver" | "Bronze"
  logo_url: string | null
  description: string | null
  website: string | null
  contribution: string | null
  display_order: number
  is_active: boolean
}

export interface ScheduleEvent {
  id: number
  title: string
  description: string | null
  start_time: string
  end_time: string
  event_type: "gaming" | "music" | "talk" | "break" | "special"
  participants: string[] | null
  display_order: number
  is_active: boolean
}

export interface FaqItem {
  id: number
  question: string
  answer: string
  display_order: number
  is_active: boolean
}
