import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const rows = await sql.query(text, params)
  return rows as T[]
}
