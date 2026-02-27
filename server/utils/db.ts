// server/utils/db.ts
import pg from 'pg'

const { Pool } = pg

let _pool: pg.Pool | null = null

export const useDb = () => {
  if (!_pool) {
    _pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })
  }
  return _pool
}

export const query = (text: string, params?: unknown[]) => {
  return useDb().query(text, params)
}