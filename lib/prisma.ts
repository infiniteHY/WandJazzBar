import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const url = process.env.DATABASE_URL
    || process.env.POSTGRES_PRISMA_URL
    || process.env.POSTGRES_URL
    || process.env.PRISMA_DATABASE_URL

  if (!url) return null

  return new PrismaClient({
    datasources: {
      db: { url },
    },
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production' && prisma) {
  globalForPrisma.prisma = prisma
}
