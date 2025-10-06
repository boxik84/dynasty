import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import database from "@/lib/db";
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permissions
    const response = await fetch(`${process.env.BETTER_AUTH_URL}/api/user/me`, {
      headers: { cookie: (await headers()).get('cookie') || '' }
    });
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userData = await response.json();
    if (!userData.permissions?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { type = 'full' } = await request.json();
    
    // Create backups directory if it doesn't exist
    const backupDir = path.join(process.cwd(), 'backups');
    try {
      await fs.access(backupDir);
    } catch {
      await fs.mkdir(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `retrovax_${type}_backup_${timestamp}.sql`;
    const backupPath = path.join(backupDir, backupFileName);

    // Database connection details from environment
    const dbHost = process.env.DATABASE_HOST || 'localhost';
    const dbPort = process.env.DATABASE_PORT || '3306';
    const dbUser = process.env.DATABASE_USERNAME;
    const dbPassword = process.env.DATABASE_PASSWORD;
    const dbName = process.env.DATABASE_NAME;

    if (!dbUser || !dbPassword || !dbName) {
      return NextResponse.json({ error: 'Database credentials not configured' }, { status: 500 });
    }

    let mysqldumpCommand = '';

    if (type === 'structure') {
      // Structure only backup
      mysqldumpCommand = `mysqldump -h ${dbHost} -P ${dbPort} -u ${dbUser} -p${dbPassword} --no-data --routines --triggers ${dbName} > "${backupPath}"`;
    } else if (type === 'data') {
      // Data only backup (exclude logs and sessions for smaller backup)
      mysqldumpCommand = `mysqldump -h ${dbHost} -P ${dbPort} -u ${dbUser} -p${dbPassword} --no-create-info --ignore-table=${dbName}.session --ignore-table=${dbName}.logs ${dbName} > "${backupPath}"`;
    } else {
      // Full backup (default)
      mysqldumpCommand = `mysqldump -h ${dbHost} -P ${dbPort} -u ${dbUser} -p${dbPassword} --routines --triggers --single-transaction ${dbName} > "${backupPath}"`;
    }

    // Execute backup command
    await execAsync(mysqldumpCommand);

    // Get backup file stats
    const stats = await fs.stat(backupPath);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

    // Log backup to database
    await database.execute(
      'INSERT INTO backup_logs (type, filename, file_size, status, created_by, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [type, backupFileName, fileSizeInMB, 'completed', session.user.id]
    );

    return NextResponse.json({
      success: true,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} backup created successfully`,
      filename: backupFileName,
      size: `${fileSizeInMB} MB`,
      path: backupPath
    });

  } catch (error: any) {
    console.error('Backup error:', error);
    
    // Log failed backup to database
    try {
      const session = await auth.api.getSession({ headers: await headers() });
      if (session) {
        await database.execute(
          'INSERT INTO backup_logs (type, filename, file_size, status, error_message, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
          ['unknown', 'failed_backup', 0, 'failed', error.message, session.user.id]
        );
      }
    } catch (logError) {
      console.error('Failed to log backup error:', logError);
    }

    return NextResponse.json({ 
      error: 'Backup failed', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permissions
    const response = await fetch(`${process.env.BETTER_AUTH_URL}/api/user/me`, {
      headers: { cookie: (await headers()).get('cookie') || '' }
    });
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userData = await response.json();
    if (!userData.permissions?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get backup history
    const backupHistory = await database.execute(`
      SELECT 
        id,
        type,
        filename,
        file_size,
        status,
        error_message,
        created_by,
        created_at
      FROM backup_logs 
      ORDER BY created_at DESC 
      LIMIT 50
    `);

    // Get backup directory size
    const backupDir = path.join(process.cwd(), 'backups');
    let totalSize = 0;
    let fileCount = 0;

    try {
      const files = await fs.readdir(backupDir);
      for (const file of files) {
        if (file.endsWith('.sql')) {
          const filePath = path.join(backupDir, file);
          const stats = await fs.stat(filePath);
          totalSize += stats.size;
          fileCount++;
        }
      }
    } catch (error) {
      console.error('Error reading backup directory:', error);
    }

    const backupRows = backupHistory[0] as any[];
    
    return NextResponse.json({
      backupHistory: backupRows,
      statistics: {
        totalBackups: fileCount,
        totalSize: `${(totalSize / (1024 * 1024)).toFixed(2)} MB`,
        lastBackup: backupRows.length > 0 ? backupRows[0].created_at : null
      }
    });

  } catch (error) {
    console.error('Error fetching backup info:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 