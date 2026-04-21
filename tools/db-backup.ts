import { BlobServiceClient } from '@azure/storage-blob';
import { spawn } from 'child_process';
import * as dotenv from 'dotenv';

// Load environment variables manually for standalone script
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
const AZURE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = 'db-backups';

async function performBackup() {
  if (!DATABASE_URL || !AZURE_CONNECTION_STRING) {
    console.error('Missing DATABASE_URL or AZURE_STORAGE_CONNECTION_STRING');
    process.exit(1);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `backup-${timestamp}.sql`;

  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
    await containerClient.createIfNotExists();

    console.log(`[Backup] Streaming dump to Azure: ${fileName}`);

    // pg_dump - needs to be in PATH
    const pgDump = spawn('pg_dump', [DATABASE_URL, '--no-owner', '--no-privileges']);

    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    await blockBlobClient.uploadStream(pgDump.stdout, 4 * 1024 * 1024, 20);

    console.log('✅ Backup successful!');
  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  }
}

performBackup();
