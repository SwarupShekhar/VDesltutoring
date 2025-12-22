import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as bcrypt from 'bcrypt'

// Use Prisma's PostgreSQL driver adapter with the DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  // Hash the password for security
  const hashedPassword = await bcrypt.hash('Vaidik@1234', 10)

  const admin = await prisma.users.upsert({
    where: { email: 'swarupshekhar.vaidikedu@gmail.com' },
    update: {},
    create: {
      email: 'swarupshekhar.vaidikedu@gmail.com',
      full_name: 'Swarup Shekhar (Admin)',
      clerkId: 'seed-admin-user-id', // Temporary ID for seeding
      role: 'ADMIN',
    },
  })

  console.log('Admin account created successfully:', admin.email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })