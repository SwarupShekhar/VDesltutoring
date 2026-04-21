import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const posts = await prisma.blog_posts.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      status: true
    }
  })
  console.log(JSON.stringify(posts, null, 2))
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
