import { neon, neonConfig } from "@neondatabase/serverless"

// Configure neon
neonConfig.fetchConnectionCache = true

// Create a SQL function that doesn't rely on template literals
const createSqlTag = () => {
  const sqlInstance = neon(process.env.DATABASE_URL || "")

  // Return a function that accepts SQL and parameters separately
  return {
    query: async (sqlText: string, params: any[] = []) => {
      return sqlInstance.query(sqlText, params)
    },
    // Keep the template literal version for simpler queries
    raw: sqlInstance,
  }
}

export const db = createSqlTag()
