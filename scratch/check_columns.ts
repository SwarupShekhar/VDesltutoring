import { Pool } from "pg";
import "dotenv/config";

async function main() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    try {
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'blog_posts'
        `);
        console.log('Columns in blog_posts:');
        res.rows.forEach(row => console.log(`${row.column_name}: ${row.data_type}`));
    } catch (error) {
        console.error('Failed to list columns:', error);
    } finally {
        await pool.end();
    }
}

main();
