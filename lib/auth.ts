import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import type { NextRequest } from "next/server"
import { db } from "./db"
import { env } from "@/lib/env"
import { ApiError } from "@/lib/api/response"

const JWT_EXPIRES_IN = "24h"
export const SESSION_COOKIE_NAME = "admin_session"
export const SESSION_MAX_AGE_SECONDS = 24 * 60 * 60

export interface AdminUser {
  id: number
  username: string
  email: string
  role: "admin" | "super_admin"
}

function getJwtSecret(): string {
  const secret = env.JWT_SECRET
  if (!secret || (env.NODE_ENV === "production" && secret.length < 32)) {
    console.error("[auth] JWT_SECRET ontbreekt of is te kort (minimaal 32 tekens). Beheer-login is uitgeschakeld.")
    throw new ApiError("Beheer-login is niet geconfigureerd (JWT_SECRET ontbreekt).", 503)
  }
  return secret
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

// Generate JWT token
export function generateToken(user: AdminUser): string {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    getJwtSecret(),
    { expiresIn: JWT_EXPIRES_IN },
  )
}

// Verify JWT token
export function verifyToken(token: string): AdminUser | null {
  let secret: string
  try {
    secret = getJwtSecret()
  } catch {
    return null
  }
  try {
    const decoded = jwt.verify(token, secret) as any
    return {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
    }
  } catch (error) {
    return null
  }
}

// Authenticate admin user
export async function authenticateAdmin(username: string, password: string): Promise<AdminUser | null> {
  try {
    const result = (await db.query(
      "SELECT id, username, password_hash, email, role FROM admin_users WHERE username = ?",
      [username],
    )) as any[]

    if (result.length === 0) {
      return null
    }

    const user = result[0]
    const isValidPassword = await verifyPassword(password, user.password_hash)

    if (!isValidPassword) {
      return null
    }

    // Update last login
    await db.query("UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?", [user.id])

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    }
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
}

// Create admin user
export async function createAdminUser(
  username: string,
  password: string,
  email: string,
  role: "admin" | "super_admin" = "admin",
): Promise<boolean> {
  try {
    const hashedPassword = await hashPassword(password)

    await db.query("INSERT INTO admin_users (username, password_hash, email, role) VALUES (?, ?, ?, ?)", [
      username,
      hashedPassword,
      email,
      role,
    ])

    return true
  } catch (error) {
    console.error("Create admin user error:", error)
    return false
  }
}

/**
 * Reads and verifies the admin_session cookie, throwing a 401/403 ApiError if
 * the request isn't authenticated (or lacks the required role). Call this at
 * the top of any admin route handler; let withRoute() turn the thrown error
 * into the right HTTP response.
 */
export function requireAdmin(request: NextRequest, requiredRole?: "admin" | "super_admin"): AdminUser {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value

  if (!token) {
    throw new ApiError("Niet ingelogd.", 401)
  }

  const user = verifyToken(token)

  if (!user) {
    throw new ApiError("Je sessie is verlopen. Log opnieuw in.", 401)
  }

  if (requiredRole && user.role !== requiredRole && user.role !== "super_admin") {
    throw new ApiError("Je hebt hier geen rechten voor.", 403)
  }

  return user
}
