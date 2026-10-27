// Applies pending SQL migrations from scripts/migrations/, in filename order,
// tracking what has already run in a `schema_migrations` table so this is safe
// to re-run at any time (fresh database or an existing production one).
//
// Usage: pnpm db:migrate

import mysql from "mysql2/promise"
import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const MIGRATIONS_DIR = path.join(__dirname, "migrations")

function splitStatements(sql) {
  // Good enough for our migration files: no stored procedures/triggers with
  // embedded semicolons, so a naive split on ";" is safe and keeps this
  // dependency-free.
  return sql
    .split(";")
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0)
}

async function main() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "livestream_event",
    multipleStatements: false,
  })

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    const [appliedRows] = await pool.query("SELECT filename FROM schema_migrations")
    const applied = new Set(appliedRows.map((row) => row.filename))

    const files = (await readdir(MIGRATIONS_DIR))
      .filter((file) => file.endsWith(".sql"))
      .sort()

    let ranCount = 0

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`skip  ${file} (already applied)`)
        continue
      }

      const sql = await readFile(path.join(MIGRATIONS_DIR, file), "utf8")
      const statements = splitStatements(sql)

      const connection = await pool.getConnection()
      try {
        await connection.beginTransaction()
        for (const statement of statements) {
          await connection.query(statement)
        }
        await connection.query("INSERT INTO schema_migrations (filename) VALUES (?)", [file])
        await connection.commit()
        console.log(`apply ${file}`)
        ranCount += 1
      } catch (error) {
        await connection.rollback()
        console.error(`FAILED ${file}:`, error.message)
        throw error
      } finally {
        connection.release()
      }
    }

    console.log(ranCount === 0 ? "Database already up to date." : `Applied ${ranCount} migration(s).`)
  } finally {
    await pool.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
