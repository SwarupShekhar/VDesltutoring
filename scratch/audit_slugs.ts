import { prisma } from '../src/lib/prisma.ts';

async function checkSlugs() {
  try {
    const posts = await prisma.blog_posts.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        status: true
      }
    });

    console.log('--- DATABASE SLUG AUDIT ---');
    posts.forEach(p => {
      console.log(`[${p.status}] ID: ${p.id} | Slug: "${p.slug}" | Title: ${p.title}`);
    });
    console.log('---------------------------');
  } catch (error) {
    console.error('Audit failed:', error);
  } finally {
    process.exit(0);
  }
}

checkSlugs();
