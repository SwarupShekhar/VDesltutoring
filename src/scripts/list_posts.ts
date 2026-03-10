import { prisma } from "../lib/prisma";

async function main() {
  const posts = await prisma.blog_posts.findMany({
    where: { status: "published" },
    select: { title: true, slug: true },
  });
  console.log(JSON.stringify(posts, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
