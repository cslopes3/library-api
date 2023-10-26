import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import {
    startEnvironment,
    stopEnvironment,
} from './utils/test-environment-setup';

const prisma = new PrismaClient();

beforeAll(async () => {
    startEnvironment();
});

afterAll(async () => {
    await stopEnvironment(prisma);
});
