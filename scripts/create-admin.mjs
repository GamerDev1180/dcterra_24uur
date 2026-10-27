// Interactively creates (or promotes) an admin_users row with a real bcrypt hash.
// Replaces the old approach of baking a known "admin123" password into SQL seed
// files, which is a standing credential risk in a repo meant to live for years.
//
// Usage: pnpm db:create-admin

import mysql from "mysql2/promise"
import bcrypt from "bcryptjs"
import readline from "node:readline/promises"
import { stdin, stdout } from "node:process"

const KEYCODE_CTRL_C = 3
const KEYCODE_BACKSPACE = 8
const KEYCODE_DELETE = 127

async function prompt(rl, question, { hidden = false } = {}) {
  if (!hidden) {
    return (await rl.question(question)).trim()
  }

  // Minimal masked-input prompt without extra dependencies.
  return new Promise((resolve) => {
    stdout.write(question)
    let buffer = ""

    const onData = (char) => {
      const code = char[0]

      if (code === 13 || code === 10) {
        stdin.setRawMode?.(false)
        stdin.pause()
        stdin.removeListener("data", onData)
        stdout.write("\n")
        resolve(buffer)
        return
      }

      if (code === KEYCODE_CTRL_C) {
        stdout.write("\n")
        process.exit(1)
      }

      if (code === KEYCODE_BACKSPACE || code === KEYCODE_DELETE) {
        buffer = buffer.slice(0, -1)
        return
      }

      buffer += char.toString("utf8")
    }

    stdin.resume()
    stdin.setRawMode?.(true)
    stdin.on("data", onData)
  })
}

async function main() {
  const rl = readline.createInterface({ input: stdin, output: stdout })

  const username = await prompt(rl, "Admin username: ")
  const email = await prompt(rl, "Admin email: ")
  const password = await prompt(rl, "Admin password (min 12 chars): ", { hidden: true })
  const roleInput = (await prompt(rl, "Role [super_admin/admin] (default super_admin): ")) || "super_admin"
  rl.close()

  if (!username || !email || password.length < 12) {
    console.error("Username, email and a password of at least 12 characters are required.")
    process.exit(1)
  }

  const role = roleInput === "admin" ? "admin" : "super_admin"
  const passwordHash = await bcrypt.hash(password, 12)

  const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "livestream_event",
  })

  try {
    await pool.query(
      `INSERT INTO admin_users (username, password_hash, email, role)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), email = VALUES(email), role = VALUES(role)`,
      [username, passwordHash, email, role],
    )
    console.log(`Admin user "${username}" (${role}) is ready.`)
  } finally {
    await pool.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
