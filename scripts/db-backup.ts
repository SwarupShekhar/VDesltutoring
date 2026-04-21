import { BlobServiceClient } from '@azure/storage-blob';
import { spawn } from 'child_process';
import * as dotenv from 'dotenv';
import { format } from 'date-fns';
import path from 'path';

// Load environment variables
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
const AZURE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = 'db-backups';

async function performBackup() {
  if (!DATABASE_URL || !AZURE_CONNECTION_STRING) {
    console.error('Missing required environment variables: DATABASE_URL or AZURE_STORAGE_CONNECTION_STRING');
    process.exit(1);
  }

  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
  const fileName = `backup_${timestamp}.sql`;

  console.log(`Starting backup: ${fileName}`);

  try {
    // 1. Initialize Azure Blob Storage Client
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

    // Ensure container exists
    await containerClient.createIfNotExists();

    // 2. Prepare pg_dump process
    // We use pg_dump directly. It needs to be in the PATH.
    const pgDump = spawn('pg_dump', [DATABASE_URL, '--no-owner', '--no-privileges']);

    // 3. Upload stream directly to Azure
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    
    // We wrap the stdout in a promise for error handling
    const uploadPromise = blockBlobClient.uploadStream(pgDump.stdout, 4 * 1024 * 1024, 20);

    pgDump.stderr.on('data', (data) => {
      console.error(`pg_dump stderr: ${data}`);
    });

    pgDump.on('error', (err) => {
      console.error('Failed to start pg_dump:', err);
      process.exit(1);
    });

    await uploadPromise;
    
    console.log(`Backup completed successfully and uploaded to Azure: ${fileName}`);
  } catch (error) {
    console.error('Backup failed:', error);
    process.exit(1);
  }
}

performBackup();
