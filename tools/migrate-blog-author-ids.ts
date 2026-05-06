import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const ADMIN_EMAIL = 'swarupshekhar.vaidikedu@gmail.com'

async function main() {
    console.log('🚀 Starting Blog Author ID Migration (Final Cleanup)...')

    const posts = await prisma.blog_posts.findMany()
    const users = await prisma.users.findMany()

    const admin = users.find(u => u.email === ADMIN_EMAIL)
    if (!admin) {
        throw new Error(`Admin user with email ${ADMIN_EMAIL} not found!`)
    }

    console.log(`Admin ID: ${admin.id} (${admin.clerkId})`)
    console.log(`Found ${posts.length} posts and ${users.length} users.`)

    let updatedCount = 0;
    let orphanedCount = 0;
    for (const post of posts) {
        // Check if author_id is a valid UUID and exists in users
        const userById = users.find(u => u.id === post.author_id)
        if (userById) {
            console.log(`Post ${post.id}: Already has valid UUID ${post.author_id}`)
            continue;
        }

        // Try to match by Clerk ID
        const userByClerk = users.find(u => u.clerkId === post.author_id)
        if (userByClerk) {
            console.log(`Post ${post.id}: Matching Clerk ID found. Updating ${post.author_id} -> ${userByClerk.id}`)
            await prisma.blog_posts.update({
                where: { id: post.id },
                data: { author_id: userByClerk.id }
            })
            updatedCount++;
        } else {
            // Orphaned post! Assign to Admin.
            console.warn(`Post ${post.id}: Author ID "${post.author_id}" orphaned! Reassigning to Admin (${admin.id})`)
            await prisma.blog_posts.update({
                where: { id: post.id },
                data: { author_id: admin.id }
            })
            orphanedCount++;
        }
    }

    console.log(`✅ Migration complete. Updated ${updatedCount} posts. Reassigned ${orphanedCount} orphaned posts.`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
        await pool.end()
    })
