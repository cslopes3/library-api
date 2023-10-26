import 'dotenv/config';
import { randomUUID } from 'crypto';
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

function generateUniqueDatabaseURL(schemaId: string): string {
    if (!process.env.DATABASE_URL) {
        throw new Error('Please provide a DATABASE_URL environment variable.');
    }

    const url = new URL(process.env.DATABASE_URL);

    url.searchParams.set('schema', schemaId);

    return url.toString();
}

const schemaId = randomUUID();

export function startEnvironment() {
    const databaseUrl = generateUniqueDatabaseURL(schemaId);

    process.env.DATABASE_URL = databaseUrl;

    execSync('npx prisma migrate deploy');
}

export async function stopEnvironment(prisma: PrismaClient) {
    await prisma.$executeRawUnsafe(
        `DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`,
    );

    await prisma.$disconnect;
}
