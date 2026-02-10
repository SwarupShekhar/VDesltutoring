
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'FOUND' : 'MISSING');
console.log('CLERK_SECRET_KEY:', process.env.CLERK_SECRET_KEY ? 'FOUND' : 'MISSING');
console.log('Current Directory:', process.cwd());
